import { inject } from '@angular/core';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import { RecordModel, RecordService } from 'pocketbase';

export abstract class BaseCrudService<T> {
  protected pbClient = inject(PocketBaseClient);
  protected collection: RecordService;

  constructor(protected collectionName: string) {
    this.collection = this.pbClient.instance.collection(this.collectionName);
  }

  async getList(page = 1, perPage = 50, options?: any) {
    return await this.collection.getList<T & RecordModel>(page, perPage, options);
  }

  async getById(id: string, options?: any) {
    return await this.collection.getOne<T & RecordModel>(id, options);
  }

  async create(data: Partial<T>, options?: any) {
    return await this.collection.create<T & RecordModel>(data, options);
  }

  async update(id: string, data: Partial<T>, options?: any) {
    return await this.collection.update<T & RecordModel>(id, data, options);
  }

  async delete(id: string, options?: any) {
    return await this.collection.delete(id, options);
  }
}
