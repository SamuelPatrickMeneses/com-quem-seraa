import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
      const data = await this.authService.pocketBase.send('/api/join?code=' + encodeURIComponent(code), {});
      this.router.navigateByUrl(data?.redirect || `/group/${code}`);
    } catch (err: any) {
      this.error.set(err?.message || 'Erro ao entrar no grupo.');
      this.loading.set(false);
    }
  }
}
