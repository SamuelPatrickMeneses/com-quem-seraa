import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Group } from '../models/group.model';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends BaseCrudService<Group> {
  constructor(pbClient: PocketBaseClient) {
    super(pbClient, 'groups');
  }

  /**
   * Busca os grupos vinculados ao usuário logado (criados por ele)
   */
  async getUserGroups(userId: string) {
    return this.getList(1, 50, {
      filter: `created_by = "${userId}"`
    });
  }
}
