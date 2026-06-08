import { Component, OnInit, inject } from '@angular/core';
import { NgIf, UpperCasePipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { Group } from '../../core/models/group.model';
import { LucideAngularModule, Gift, LogOut, Plus, Home, User, Settings, UserPlus, Users } from 'lucide-angular';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [NgIf, UpperCasePipe, DatePipe, LucideAngularModule],
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
  readonly UsersIcon = Users;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  user: any = null;
  groups: Group[] = [];
  isLoading = true;

  async ngOnInit() {
    this.user = this.authService.user;
    if (this.user) {
      await this.loadGroups();
    }
  }

  async loadGroups() {
    try {
      this.isLoading = true;
      const result = await this.groupService.getUserGroups(this.user.id);
      console.log(result);

      this.groups = result.items as unknown as Group[];
    } catch (error) {
      console.error('Erro ao carregar grupos', error);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
