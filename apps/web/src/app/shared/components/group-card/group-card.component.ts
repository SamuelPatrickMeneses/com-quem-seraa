import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Gift, Users, ShieldCheck, ArrowRight } from 'lucide-angular';
import type { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [RouterLink, DatePipe, LucideAngularModule],
  template: `
    <a [routerLink]="['/group', group.id]"
       class="group block bg-surface-lowest p-6 rounded-[2rem] shadow-ambient
              hover:shadow-lg hover:-translate-y-1 transition-all duration-300
              border border-neutral/5 hover:border-primary/10">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center
                      group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <lucide-icon [img]="GiftIcon" size="24"></lucide-icon>
          </div>
          <div>
            <h3 class="text-lg font-black text-neutral">{{ group.name }}</h3>
            <p class="text-xs font-bold text-neutral/40">
              Criado em {{ group.created_at | date:"dd/MM/yyyy" }}
            </p>
          </div>
        </div>
        @if (isAdmin) {
          <div class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full
                      group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <lucide-icon [img]="ShieldCheckIcon" size="12" class="inline -mt-0.5 mr-1"></lucide-icon>
            Admin
          </div>
        }
      </div>

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
}
