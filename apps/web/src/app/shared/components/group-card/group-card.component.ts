import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Gift, Users, ShieldCheck, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-angular';
import type { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [NgClass, RouterLink, LucideAngularModule],
  template: `
    <a [routerLink]="['/group', group.id]"
       class="group relative block bg-surface-lowest p-6 rounded-[2rem] shadow-ambient
              hover:shadow-lg hover:-translate-y-1 transition-all duration-300
              border border-neutral/5 hover:border-primary/10 overflow-hidden">
      <!-- Status Bar -->
      <div class="absolute top-0 left-0 right-0 h-1"
           [ngClass]="{
             'bg-secondary': status === 'SORTEADO',
             'bg-primary': status === 'ATIVO',
             'bg-neutral/20': status === 'PENDENTE'
           }">
      </div>

      <!-- Top Row: Badges -->
      <div class="flex items-center justify-between mb-5 mt-2">
        <div class="flex items-center gap-2">
          @if (status === 'SORTEADO') {
            <div class="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <lucide-icon [img]="CheckCircle2Icon" size="12"></lucide-icon>
              Sorteado
            </div>
          } @else if (status === 'ATIVO') {
            <div class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <lucide-icon [img]="SparklesIcon" size="12"></lucide-icon>
              Ativo
            </div>
          } @else {
            <div class="px-3 py-1 bg-neutral/10 text-neutral/50 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <lucide-icon [img]="ClockIcon" size="12"></lucide-icon>
              Pendente
            </div>
          }
        </div>
        <div class="flex items-center gap-2">
          @if (isAdmin) {
            <div class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <lucide-icon [img]="ShieldCheckIcon" size="12"></lucide-icon>
              Admin
            </div>
          }
        </div>
      </div>

      <!-- Group Name -->
      <h3 class="text-xl font-black text-neutral mb-5">{{ group.name }}</h3>

      <!-- Bottom Row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-neutral/50">
          <lucide-icon [img]="UsersIcon" size="16"></lucide-icon>
          <span class="text-sm font-bold">{{ group.participants_count }} participantes</span>
        </div>
        <div class="text-primary font-black text-sm flex items-center gap-1
                    group-hover:gap-2 transition-all">
          Acessar
          <lucide-icon [img]="ArrowRightIcon" size="16"></lucide-icon>
        </div>
      </div>
    </a>
  `
})
export class GroupCardComponent {
  @Input({ required: true }) group!: Group;
  @Input({ required: true }) isAdmin = false;

  readonly GiftIcon = Gift;
  readonly UsersIcon = Users;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly SparklesIcon = Sparkles;

  get status(): 'ATIVO' | 'PENDENTE' | 'SORTEADO' {
    if (this.group.has_been_drawn) return 'SORTEADO';
    if (this.group.participants_count >= 3) return 'ATIVO';
    return 'PENDENTE';
  }
}
