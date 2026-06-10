import { Injectable } from '@angular/core';
import { BaseAuthStore, RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export default class InMemoryAuthStore extends BaseAuthStore {

  _token?: string;
  _model?: RecordModel;

  constructor() {
    super();
  }

  override save(token: string, model?: RecordModel | null): void {
    super.save(token, model);
    this._model = model ?? undefined;
    this._token = token;
  }

  override clear(): void {
    super.clear();
    this._model = undefined;
    this._token = undefined;
  }
};
