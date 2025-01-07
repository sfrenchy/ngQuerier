import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html'
})
export class UserAvatarComponent {
  @Input() firstName: string = '';
  @Input() lastName: string = '';

  getInitials(): string {
    return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
  }

  onClick(): void {
    // TODO: Implement profile navigation or menu
  }
} 