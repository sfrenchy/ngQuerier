import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthStateService } from '@services/auth-state.service';
import { AddDBConnectionProgressStatus } from '@shared/enums/add-db-connection-progress-status.enum';

export interface ProgressEvent {
  operationId: string;
  progress: number;
  status: AddDBConnectionProgressStatus;
  error?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: HubConnection;

  constructor(private authStateService: AuthStateService) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/querier`, {
        accessTokenFactory: () => this.authStateService.getAccessToken() ?? '',
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
      })
      .configureLogging(environment.production ? LogLevel.Error : LogLevel.Debug)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          const delayMs = Math.min(5000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          console.debug(`SignalR reconnecting attempt ${retryContext.previousRetryCount + 1}, delay: ${delayMs}ms`);
          return delayMs;
        }
      })
      .build();

    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.debug('SignalR Connected successfully');
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      setTimeout(() => {
        console.debug('SignalR attempting reconnection...');
        this.startConnection();
      }, 5000);
    }
  }

  public onOperationProgress(operationId: string): Observable<ProgressEvent> {
    console.debug(`SignalR subscribing to progress updates for operation: ${operationId}`);
    return new Observable(observer => {
      const handler = (data: ProgressEvent) => {
        if (data.operationId === operationId) {
          console.debug(`SignalR progress update:`, data);
          data.timestamp = new Date(data.timestamp);
          observer.next(data);
        }
      };

      this.hubConnection.on('ProgressUpdate', handler);

      return () => {
        console.debug(`SignalR unsubscribing from progress updates for operation: ${operationId}`);
        this.hubConnection.off('ProgressUpdate', handler);
      };
    });
  }

  public async subscribeToOperation(operationId: string): Promise<void> {
    try {
      console.debug(`SignalR invoking SubscribeToOperation for: ${operationId}`);
      await this.hubConnection.invoke('SubscribeToOperation', operationId);
      console.debug(`SignalR successfully subscribed to operation: ${operationId}`);
    } catch (err) {
      console.error(`SignalR error subscribing to operation ${operationId}:`, err);
      throw err;
    }
  }

  public async unsubscribeFromOperation(operationId: string): Promise<void> {
    try {
      console.debug(`SignalR invoking UnsubscribeFromOperation for: ${operationId}`);
      await this.hubConnection.invoke('UnsubscribeFromOperation', operationId);
      console.debug(`SignalR successfully unsubscribed from operation: ${operationId}`);
    } catch (err) {
      console.error(`SignalR error unsubscribing from operation ${operationId}:`, err);
      throw err;
    }
  }
}
