import { Component, OnInit, inject, signal, computed, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { GroupService } from '../../core/services/group.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';
import { DrawService } from '../../core/services/draw.service';
import type { Group } from '../../core/models/group.model';
import type { GroupParticipant } from '../../core/models/group-participant.model';
import type { User } from '../../core/models/user.model';
import { LucideAngularModule, Gift, Users, ChevronLeft, PlusCircle, User as UserIcon, ShieldCheck, Sparkles, ArrowRight, Copy, LogOut, Trash2, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-group-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, BottomNavComponent],
  templateUrl: './group-dashboard.page.html',
})
export class GroupDashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private authService = inject(AuthService);
  private drawService = inject(DrawService);
  private router = inject(Router);

  readonly GiftIcon = Gift;
  readonly UsersIcon = Users;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly SparklesIcon = Sparkles;
  readonly ArrowRightIcon = ArrowRight;
  readonly CopyIcon = Copy;
  readonly LogOutIcon = LogOut;
  readonly Trash2Icon = Trash2;
  readonly UserPlusIcon = UserPlus;

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: UserIcon, route: '/profile' },
  ];

  @Input() groupId = '';
  group = signal<Group | null>(null);
  participants = signal<GroupParticipant[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  authUser = signal<User | null>(null);
  copied = signal(false);
  isDrawLoading = signal(false);
  isActionLoading = signal(false);

  readonly isOrganizer = computed(() => {
    const g = this.group();
    const u = this.authUser();
    return !!g && !!u && g.created_by === u.id;
  });

  readonly myParticipant = computed<GroupParticipant | undefined>(() => {
    const u = this.authUser();
    if (!u) return undefined;
    return this.participants().find(p => p.giver_id === u.id);
  });

  readonly isOrganizerParticipant = computed(() => {
    const g = this.group();
    const u = this.authUser();
    if (!g || !u) return false;
    return this.participants().some(p => p.giver_id === u.id);
  });

  readonly inviteUrl = computed(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/join?code=${this.groupId}`;
  });

  get status(): 'SORTEADO' | 'ATIVO' | 'PENDENTE' {
    const g = this.group();
    if (!g) return 'PENDENTE';
    if (g.has_been_drawn) return 'SORTEADO';
    if (g.participants_count >= 3) return 'ATIVO';
    return 'PENDENTE';
  }

  ngOnInit() {
    this.authUser.set(this.authService.user as User | null);
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const [group, participantsResult] = await Promise.all([
        this.groupService.getById(this.groupId),
        this.participantService.getParticipants(this.groupId),
      ]);
      this.group.set(group);
      this.participants.set(participantsResult.items);
    } catch (e: unknown) {
      this.error.set((e as any)?.message || 'Erro desconhecido');
    } finally {
      this.isLoading.set(false);
    }
  }

  async performDraw() {
    if (!confirm('Tem certeza que deseja realizar o sorteio? Esta ação não pode ser desfeita.')) {
      return;
    }
    this.isDrawLoading.set(true);
    try {
      await this.drawService.performDraw(this.groupId);
      await this.loadData();
    } catch (e: unknown) {
      this.error.set((e as any)?.message || 'Erro ao realizar sorteio');
    } finally {
      this.isDrawLoading.set(false);
    }
  }

  async copyInviteLink() {
    try {
      await navigator.clipboard.writeText(this.inviteUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Fallback para ambientes sem clipboard API
    }
  }

  async toggleMembership() {
    this.isActionLoading.set(true);
    try {
      if (this.isOrganizerParticipant()) {
        if (this.participants().length <= 1) {
          throw new Error('Você é o único participante. Adicione mais pessoas antes de sair.');
        }
        const myP = this.myParticipant();
        if (myP) {
          await this.participantService.delete(myP.id);
        }
      } else {
        await this.participantService.joinGroup(this.groupId);
      }
      await this.loadData();
    } catch (e: unknown) {
      this.error.set((e as any)?.message || 'Erro ao alterar participação');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async removeParticipant(participant: GroupParticipant) {
    if (!confirm('Tem certeza que deseja remover este participante?')) {
      return;
    }
    this.isActionLoading.set(true);
    try {
      await this.participantService.delete(participant.id);
      await this.loadData();
    } catch (e: unknown) {
      this.error.set((e as any)?.message || 'Erro ao remover participante');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async leaveGroup() {
    const g = this.group();
    if (!confirm(`Tem certeza que deseja sair do grupo "${g?.name || ''}"?`)) {
      return;
    }
    this.isActionLoading.set(true);
    try {
      const myP = this.myParticipant();
      if (myP) {
        await this.participantService.delete(myP.id);
      }
      await this.router.navigate(['/my-groups']);
    } catch (e: unknown) {
      this.error.set((e as any)?.message || 'Erro ao sair do grupo');
      this.isActionLoading.set(false);
    }
  }

  async deleteGroup() {
    const g = this.group();
    if (!g) return;
    if (!confirm(`Tem certeza que deseja excluir o grupo "${g.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    this.isActionLoading.set(true);
    try {
      const participants = this.participants();
      for (const p of participants) {
        await this.participantService.delete(p.id);
      }
      await this.groupService.delete(this.groupId);
      await this.router.navigate(['/my-groups']);
    } catch (e: unknown) {
      this.error.set((e as any)?.message || 'Erro ao excluir grupo');
      this.isActionLoading.set(false);
    }
  }
}
