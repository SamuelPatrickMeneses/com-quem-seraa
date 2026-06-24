import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ParticipantService } from '../../core/services/participant.service';
import { GroupService } from '../../core/services/group.service';
import { GroupParticipant } from '../../core/models/group-participant.model';
import { LucideAngularModule, Gift, Users, ChevronLeft, PlusCircle, User } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BottomNavComponent, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#faf9f8] pb-24 md:pb-0">
      <header class="bg-[#ffffff] border-b border-[#e4beba]/15 px-4 py-4 md:px-8">
        <div class="max-w-6xl mx-auto">
          <a routerLink="/group/{{groupId}}" class="inline-flex items-center gap-1 text-sm text-[#5b403d] hover:text-[#1a1c1c] mb-2">
            <lucide-icon [img]="ChevronLeftIcon" size="16"></lucide-icon>
            Voltar
          </a>
          <h1 class="text-2xl md:text-3xl font-bold text-[#1a1c1c]">{{ groupName() }}</h1>
          <p class="text-[#5b403d] mt-1">Resultado do Sorteio</p>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-4 md:px-8 py-6">
        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-[#a20513] border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (error()) {
          <div class="text-center py-12">
            <p class="text-[#5b403d] mb-4">Algo deu errado ao carregar os pares.</p>
            <button (click)="loadPairs()" class="px-6 py-2 bg-[#a20513] text-white font-semibold rounded-xl hover:bg-[#93000e] transition-colors">
              TENTAR NOVAMENTE
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (pair of pairs(); track pair.id) {
              <div class="bg-[#ffffff] rounded-xl p-5 shadow-[0_2px_8px_rgba(91,64,61,0.06)]">
                <div class="flex items-center justify-between">
                  <div class="flex-1 text-center">
                    <lucide-icon [img]="GiftIcon" size="24" class="mx-auto mb-1 text-[#a20513]"></lucide-icon>
                    <p class="font-semibold text-[#1a1c1c]">{{ pair.giver_name || pair.giver_id }}</p>
                    <p class="text-xs text-[#5b403d] mt-0.5">Presenteia</p>
                  </div>
                  <div class="flex-shrink-0 mx-3">
                    <lucide-icon [img]="ChevronLeftIcon" size="20" class="text-[#2b6954] rotate-180"></lucide-icon>
                  </div>
                  <div class="flex-1 text-center">
                    <lucide-icon [img]="GiftIcon" size="24" class="mx-auto mb-1 text-[#2b6954]"></lucide-icon>
                    <p class="font-semibold text-[#1a1c1c]">{{ pair.receiver_name || pair.receiver_id }}</p>
                    <p class="text-xs text-[#5b403d] mt-0.5">Recebe</p>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (pairs().length === 0) {
            <div class="text-center py-12">
              <lucide-icon [img]="UsersIcon" size="48" class="mx-auto mb-3 text-[#e4beba]"></lucide-icon>
              <p class="text-[#5b403d]">Nenhum par encontrado.</p>
            </div>
          }}
      </main>

      <app-bottom-nav [items]="navItems"></app-bottom-nav>
    </div>
  `,
})
export class AdminDashboardComponent {
  private route = inject(ActivatedRoute);
  private participantService = inject(ParticipantService);
  private groupService = inject(GroupService);

  readonly GiftIcon = Gift;
  readonly UsersIcon = Users;
  readonly ChevronLeftIcon = ChevronLeft;

  groupId = this.route.snapshot.paramMap.get('groupId') || '';
  groupName = signal('');
  pairs = signal<GroupParticipant[]>([]);
  isLoading = signal(true);
  error = signal(false);

  navItems = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

  constructor() {
    this.loadGroupName();
    this.loadPairs();
  }

  private async loadGroupName() {
    try {
      const group = await this.groupService.getById(this.groupId);
      this.groupName.set(group.name);
    } catch {
      this.groupName.set('Grupo');
    }
  }

  async loadPairs() {
    this.isLoading.set(true);
    this.error.set(false);
    try {
      const result = await this.participantService.getParticipants(this.groupId);
      this.pairs.set(result.items);
    } catch {
      this.error.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
