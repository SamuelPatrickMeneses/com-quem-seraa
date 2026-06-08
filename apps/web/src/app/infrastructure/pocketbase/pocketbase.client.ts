import { Injectable } from '@angular/core';
import PocketBase, { BaseAuthStore, RecordModel } from 'pocketbase';
import { environment } from '../../../environments/environment.development';

class SessionAuthStore extends BaseAuthStore {
  private storageKey = 'pb_auth';

  constructor() {
    super();
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.token) {
          super.save(data.token, data.model ?? null);
        }
      }
    } catch {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  override save(token: string, model?: RecordModel | null): void {
    super.save(token, model);
    sessionStorage.setItem(this.storageKey, JSON.stringify({ token, model }));
  }

  override clear(): void {
    super.clear();
    sessionStorage.removeItem(this.storageKey);
  }
}

@Injectable({
  providedIn: 'root'
})
export class PocketBaseClient {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(environment.apiUrl, new SessionAuthStore());
  }

  get instance(): PocketBase {
    return this.pb;
  }
}
