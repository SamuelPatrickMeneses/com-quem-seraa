import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Gift, Users, ShieldCheck, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-angular';
import type { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, DatePipe],
  template: `
    <a [routerLink]="['/group', group().id]"
       class="group bg-surface-lowest rounded-[2rem] p-8 shadow-ambient transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col h-full border border-transparent hover:border-primary/10">
      
      <!-- Top Row: Badges -->
      <div class="flex justify-between items-start mb-6">
        @if (status === 'SORTEADO') {
          <div class="bg-neutral/5 text-neutral/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Sorteado
          </div>
        } @else if (status === 'ATIVO') {
          <div class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Em Andamento
          </div>
        } @else {
          <div class="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Aguardando Sorteio
          </div>
        }
        
        @if (isAdmin()) {
          <div class="text-primary/40 bg-primary/5 px-2 py-1 rounded-full flex items-center gap-1">
            <lucide-icon [img]="ShieldCheckIcon" size="14"></lucide-icon>
            <span class="text-[10px] font-bold uppercase">Admin</span>
          </div>
        }
      </div>

      <!-- Group Name -->
      <h3 class="font-display font-extrabold text-2xl text-neutral mb-1">{{ group().name }}</h3>
      <p class="text-neutral/50 text-sm mb-8">Criado em {{ group().created_at | date:'dd de MMM, yyyy' }}</p>

      <!-- Bottom Row -->
      <div class="mt-auto">
        @if (status === 'SORTEADO') {
          <div class="flex items-center gap-3 mb-6">
            <lucide-icon [img]="CheckCircle2Icon" size="20" class="text-secondary"></lucide-icon>
            <span class="text-sm font-medium text-secondary">Sorteio Finalizado</span>
          </div>
          <div class="w-full py-4 text-center bg-surface-low text-neutral/60 font-display font-bold rounded-2xl group-hover:bg-neutral/10 transition-all duration-300">
            Revisar Detalhes
          </div>
        } @else if (status === 'ATIVO') {
          <div class="flex items-center gap-2 mb-6 text-neutral/50">
            <lucide-icon [img]="UsersIcon" size="20"></lucide-icon>
            <span class="text-sm font-bold">{{ group().participants_count }} participantes</span>
          </div>
          <div class="w-full py-4 text-center bg-surface-low text-primary font-display font-bold rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
            Ver Detalhes
          </div>
        } @else {
          <div class="bg-primary/5 p-4 rounded-xl mb-6 border border-primary/10">
            <div class="flex justify-between text-xs font-bold mb-2">
              <span class="text-primary uppercase tracking-tighter">Participantes</span>
              <span class="text-neutral">{{ group().participants_count }}</span>
            </div>
            <div class="w-full bg-surface-lowest h-1.5 rounded-full overflow-hidden">
              <div class="bg-primary h-full" [style.width]="(group().participants_count / 3 * 100) + '%'"></div>
            </div>
          </div>
          <div class="w-full py-4 text-center bg-primary text-white font-display font-bold rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all">
            Realizar Sorteio
          </div>
        }
      </div>
    </a>
  `
})
export class GroupCardComponent {
  readonly group = input.required<Group>();
  readonly isAdmin = input(false);

  readonly GiftIcon = Gift;
  readonly UsersIcon = Users;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly SparklesIcon = Sparkles;

  get status(): 'ATIVO' | 'PENDENTE' | 'SORTEADO' {
    if (this.group().has_been_drawn) return 'SORTEADO';
    if (this.group().participants_count >= 3) return 'ATIVO';
    return 'PENDENTE';
  }
}
