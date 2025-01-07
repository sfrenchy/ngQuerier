import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html'
})
export class UserAvatarComponent {
  constructor(public userService: UserService) {}

  get userInitials(): string {
    const user = this.userService.getCurrentUser();
    if (!user) return '';
    
    return (user.FirstName[0] + user.LastName[0]).toUpperCase();
  }

  get userFullName(): string {
    const user = this.userService.getCurrentUser();
    return user?.FirstName + ' ' + user?.LastName || '';
  }
} 