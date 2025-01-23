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
    if (!user?.firstName || !user?.lastName) return '';
    
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }

  get userFullName(): string {
    const user = this.userService.getCurrentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  }
} 