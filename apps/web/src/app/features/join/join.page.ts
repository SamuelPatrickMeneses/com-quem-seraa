import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ParticipantService } from '../../core/services/participant.service';
import { GroupService } from '../../core/services/group.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './join.page.html'
})
export class JoinComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private participantService = inject(ParticipantService);
  private groupService = inject(GroupService);

  error = signal('');
  loading = signal(true);

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.error.set('Link de convite inválido.');
      this.loading.set(false);
      return;
    }

    if (!this.authService.isAuthenticated) {
      const returnUrl = `/join?code=${encodeURIComponent(code)}`;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    this.joinGroup(code);
  }

  private async joinGroup(code: string) {
    try {
      const group = await this.groupService.getByInviteCode(code);

      if (group.created_by === this.authService.user?.id) {
        await this.router.navigateByUrl(`/group/${code}`);
        return;
      }

      await this.participantService.joinGroup(code);
      await this.router.navigateByUrl(`/group/${code}`);
    } catch (err: any) {
      if (err?.status === 400) {
        await this.router.navigateByUrl(`/group/${code}`);
        return;
      }
      this.error.set(err?.message || 'Erro ao entrar no grupo.');
      this.loading.set(false);
    }
  }
}
