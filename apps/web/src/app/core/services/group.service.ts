import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Group } from '../models/group.model';
import { RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends BaseCrudService<Group> {
  constructor() {
    super('groups');
  }

  async getMyGroups() {
    const user = this.pbClient.instance.authStore.model;
    if (!user) return { items: [] };

    const groupsCreated = this.getList(1, 200, {
      filter: `created_by = "${user.id}"`,
    });

    const groupsParticipating = this.pbClient.instance.collection('group_participants').getList<(Group & RecordModel)>(1, 200, {
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

    return { items: allGroups };
  }

  async getByInviteCode(code: string) {
    return await this.pbClient.instance.collection('groups').getFirstListItem<Group & RecordModel>(`id = "${code}"`);
  }
}
