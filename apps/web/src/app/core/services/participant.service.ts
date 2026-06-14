import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import { GroupParticipant } from '../models/group-participant.model';
import { RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService extends BaseCrudService<GroupParticipant> {
  constructor(pbClient: PocketBaseClient) {
    super(pbClient, 'group_participants');
  }

  async joinGroup(groupId: string) {
    const user = this.pbClient.instance.authStore.model;
    if (!user) throw new Error('Usuário não autenticado');

    return await this.create({
      group_id: groupId,
      giver_id: user.id,
      receiver_id: null,
    } as unknown as Partial<GroupParticipant>);
  }

  async getParticipants(groupId: string) {
    return await this.pbClient.instance.collection('group_participants')
      .getList<GroupParticipant & RecordModel>(1, 50, {
        filter: `group_id = "${groupId}"`,
        expand: 'giver_id,receiver_id',
      });
  }
}
