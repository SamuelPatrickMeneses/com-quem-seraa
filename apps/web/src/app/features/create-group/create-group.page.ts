import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Gift, ArrowLeft, Check, Loader, AlertCircle, Sparkles, PartyPopper, Users, PlusCircle, User } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { ParticipantService } from '../../core/services/participant.service';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, BottomNavComponent],
  templateUrl: './create-group.page.html',
})
export class CreateGroupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);

  readonly GiftIcon = Gift;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckIcon = Check;
  readonly LoaderIcon = Loader;
  readonly AlertCircleIcon = AlertCircle;
  readonly SparklesIcon = Sparkles;
  readonly PartyPopperIcon = PartyPopper;

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    joinGroup: [false],
  });

  ngOnInit() {
    this.form.get('name')?.valueChanges.subscribe(() => {
      this.error.set(null);
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const user = this.authService.user;
    if (!user) {
      this.error.set('Usuário não autenticado.');
      this.loading.set(false);
      return;
    }

    try {
      const group = await this.groupService.create({
        name: this.form.getRawValue().name.trim(),
        created_by: user.id,
        participants_count: 0,
      } as any);

      if (this.form.getRawValue().joinGroup) {
        await this.participantService.joinGroup(group.id);
        await this.groupService.update(group.id, { participants_count: 1 } as any);
      }

      this.router.navigate(['/group', group.id]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.error.set(message || 'Erro ao criar grupo. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
