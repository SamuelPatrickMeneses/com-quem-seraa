import { Injectable, inject } from '@angular/core';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import { GroupService } from './group.service';
import type { GroupParticipant } from '../models/group-participant.model';
import { RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class DrawService {
  private pbClient = inject(PocketBaseClient);
  private groupService = inject(GroupService);

  async performDraw(groupId: string): Promise<void> {
    const participants = await this.pbClient.instance.collection('group_participants')
      .getFullList<GroupParticipant & RecordModel>({
        filter: `group_id = "${groupId}"`,
      });

    if (participants.length < 3) {
      throw new Error('É necessário no mínimo 3 participantes para realizar o sorteio.');
    }

    const shuffledIds = this.fisherYatesShuffle(participants.map(p => p.id));

    const updates: Promise<any>[] = [];
    for (let i = 0; i < shuffledIds.length; i++) {
      const receiverId = shuffledIds[(i + 1) % shuffledIds.length];
      const participant = participants.find(p => p.id === shuffledIds[i])!;
      const receiver = participants.find(p => p.id === receiverId)!;
      updates.push(
        this.pbClient.instance.collection('group_participants').update(shuffledIds[i], {
          receiver_id: receiver.giver_id,
        })
      );
    }

    await Promise.all(updates);

    await this.pbClient.instance.collection('groups').update(groupId, {
      has_been_drawn: true,
    });
  }

  private fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i] === array[i]) {
        const swapWith = (i + 1) % shuffled.length;
        [shuffled[i], shuffled[swapWith]] = [shuffled[swapWith], shuffled[i]];
      }
    }

    return shuffled;
  }
}
