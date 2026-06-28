import { Component, OnInit, inject, signal, computed, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { GroupService } from '../../core/services/group.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';
import { DrawService } from '../../core/services/draw.service';
import type { Group } from '../../core/models/group.model';
import type { GroupParticipant } from '../../core/models/group-participant.model';
import type { User } from '../../core/models/user.model';
import { LucideAngularModule, Gift, Users, ChevronLeft, PlusCircle, User as UserIcon, ShieldCheck, Sparkles, ArrowRight, Copy, LogOut, Trash2, UserPlus, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-group-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, BottomNavComponent, ConfirmModalComponent, DatePipe, NgClass],
  templateUrl: './group-dashboard.page.html',
})
export class GroupDashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private participantService = inject(ParticipantService);
  private authService = inject(AuthService);
  private drawService = inject(DrawService);
  private router = inject(Router);

  readonly GiftIcon = Gift;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly SparklesIcon = Sparkles;
  readonly ArrowRightIcon = ArrowRight;
  readonly CopyIcon = Copy;
  readonly LogOutIcon = LogOut;
  readonly Trash2Icon = Trash2;
  readonly UserPlusIcon = UserPlus;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

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
  copiedLink = signal(false);
  copiedCode = signal(false);
  isDrawLoading = signal(false);
  isActionLoading = signal(false);
  selectedParticipant = signal<User | null>(null);
  showConfirmModal = signal(false);
  confirmModalTitle = signal('');
  confirmModalMessage = signal('');
  confirmModalConfirmText = signal('Confirmar');
  confirmModalCancelText = signal('Cancelar');
  private confirmResolve: ((value: boolean) => void) | null = null;
  readonly isRevealed = signal(false);

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

  toggleRevelation() {
    this.isRevealed.update(v => !v);
  }

  ngOnInit() {
    this.authUser.set(this.authService.user as User | null);
    this.loadData();
  }

  participantAvatarUrl(user?: User | null): string | null {
    if (!user?.avatar) {
      return null;
    }

    return this.authService.pocketBase.files.getUrl(user, user.avatar);
  }

  participantUser(participant: GroupParticipant): User | null {
    const expanded = participant.expand?.giver_id;
    if (expanded) {
      return {
        ...expanded,
        name: expanded.name || participant.giver_name,
      };
    }

    if (!participant.giver_id) {
      return null;
    }

    return {
      id: participant.giver_id,
      name: participant.giver_name,
      email: '',
      emailVisibility: false,
      verified: false,
      created: '',
      updated: '',
    };
  }

  participantInitial(name?: string | null): string {
    return (name?.trim()?.charAt(0) || '?').toUpperCase();
  }

  participantBioPreview(participant: GroupParticipant): string | null {
    const bio = this.participantUser(participant)?.bio?.trim();
    return bio || null;
  }

  isParticipantSelected(participant: GroupParticipant): boolean {
    const user = this.participantUser(participant);
    return !!user && this.selectedParticipant()?.id === user.id;
  }

  participantRowClass(participant: GroupParticipant): Record<string, boolean> {
    const selected = this.isParticipantSelected(participant);
    return {
      'bg-primary/5': selected,
      'ring-1': selected,
      'ring-primary/20': selected,
    };
  }

  selectParticipant(participant: GroupParticipant) {
    const user = this.participantUser(participant);
    if (user && this.selectedParticipant()?.id === user.id) {
      this.selectedParticipant.set(null);
      return;
    }
    this.selectedParticipant.set(user);
  }

  clearSelectedParticipant() {
    this.selectedParticipant.set(null);
  }

  async loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.selectedParticipant.set(null);
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

  private promptConfirm(title: string, message: string, confirmText = 'Confirmar', cancelText = 'Cancelar'): Promise<boolean> {
    this.confirmModalTitle.set(title);
    this.confirmModalMessage.set(message);
    this.confirmModalConfirmText.set(confirmText);
    this.confirmModalCancelText.set(cancelText);
    this.showConfirmModal.set(true);
    return new Promise(resolve => { this.confirmResolve = resolve; });
  }

  onModalConfirm() {
    this.confirmResolve?.(true);
    this.confirmResolve = null;
    this.showConfirmModal.set(false);
  }

  onModalCancel() {
    this.confirmResolve?.(false);
    this.confirmResolve = null;
    this.showConfirmModal.set(false);
  }

  async performDraw() {
    const confirmed = await this.promptConfirm(
      'Realizar sorteio',
      'Tem certeza que deseja realizar o sorteio? Esta ação não pode ser desfeita.',
      'Sim, realizar',
    );
    if (!confirmed) return;
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
      this.copiedLink.set(true);
      setTimeout(() => this.copiedLink.set(false), 2000);
    } catch {
      // Fallback para ambientes sem clipboard API
    }
  }

  async copyInviteCode() {
    try {
      await navigator.clipboard.writeText(this.groupId);
      this.copiedCode.set(true);
      setTimeout(() => this.copiedCode.set(false), 2000);
    } catch {
      // Fallback para ambientes sem clipboard API
    }
  }

  async toggleMembership() {
    if (this.group()?.has_been_drawn) {
      throw new Error('Não é possível alterar participação após o sorteio.');
    }
    const g = this.group();
    const isLeaving = this.isOrganizerParticipant();
    const confirmed = await this.promptConfirm(
      isLeaving ? 'Sair do grupo' : 'Entrar no grupo',
      isLeaving
        ? `Tem certeza que deseja deixar de ser membro do grupo "${g?.name || ''}"?`
        : `Deseja entrar como participante do grupo "${g?.name || ''}"?`,
      isLeaving ? 'Sim, sair' : 'Sim, entrar',
    );
    if (!confirmed) return;
    this.isActionLoading.set(true);
    try {
      if (isLeaving) {
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
    const confirmed = await this.promptConfirm(
      'Remover participante',
      `Tem certeza que deseja remover ${participant.giver_name || 'este participante'} do grupo?`,
      'Sim, remover',
    );
    if (!confirmed) return;
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
    const confirmed = await this.promptConfirm(
      'Sair do grupo',
      `Tem certeza que deseja sair do grupo "${g?.name || ''}"?`,
      'Sim, sair',
    );
    if (!confirmed) return;
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
    const confirmed = await this.promptConfirm(
      'Excluir grupo',
      `Tem certeza que deseja excluir o grupo "${g.name}"? Esta ação não pode ser desfeita.`,
      'Sim, excluir',
    );
    if (!confirmed) return;
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
