import { Component, OnInit, inject } from '@angular/core';
import { NgIf, UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, Gift, LogOut, Plus, Home, User, Settings, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [NgIf, UpperCasePipe, LucideAngularModule],
  templateUrl: './my-groups.component.html'
})
export class MyGroupsComponent implements OnInit {
  readonly GiftIcon = Gift;
  readonly LogOutIcon = LogOut;
  readonly PlusIcon = Plus;
  readonly HomeIcon = Home;
  readonly UserIcon = User;
  readonly SettingsIcon = Settings;
  readonly UserPlusIcon = UserPlus;

  private authService = inject(AuthService);
  private router = inject(Router);

  user: any = null;

  ngOnInit() {
    this.user = this.authService.user;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
