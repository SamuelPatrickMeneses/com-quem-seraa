import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import { Group } from '../models/group.model';
import { RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends BaseCrudService<Group> {
  constructor(pbClient: PocketBaseClient) {
    super(pbClient, 'groups');
  }

  async getMyGroups(page = 1, perPage = 50) {
    const user = this.pbClient.instance.authStore.model;
    if (!user) return { items: [], totalPages: 0, page: 1, perPage: 50, total: 0 };

    const groupsCreated = this.getList(page, perPage, {
      filter: `created_by = "${user.id}"`,
    });

    const groupsParticipating = this.pbClient.instance.collection('group_participants').getList<(Group & RecordModel)>(page, perPage, {
      filter: `giver_id = "${user.id}"`,
      expand: 'group_id',
    });

    const [createdResult, participatingResult] = await Promise.all([groupsCreated, groupsParticipating]);

    const participatingGroups = (participatingResult.items as any[])
      .filter((p: any) => p.expand?.group_id)
      .map((p: any) => p.expand.group_id);

    const allGroups = [...createdResult.items];
    for (const g of participatingGroups) {
      if (!allGroups.some(existing => existing.id === g.id)) {
        allGroups.push(g);
      }
    }

    allGroups.sort((a: any, b: any) => {
      const dateA = new Date(a.created || 0).getTime();
      const dateB = new Date(b.created || 0).getTime();
      return dateB - dateA;
    });

    return {
      items: allGroups,
      totalPages: createdResult.totalPages,
      page: createdResult.page,
      perPage: createdResult.perPage,
      total: allGroups.length
    };
  }

  async getByInviteCode(code: string) {
    return await this.pbClient.instance.collection('groups').getFirstListItem<Group & RecordModel>(`id = "${code}"`);
  }
}
