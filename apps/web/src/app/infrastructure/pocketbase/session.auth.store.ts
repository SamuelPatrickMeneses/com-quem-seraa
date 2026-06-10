import { Injectable } from '@angular/core';
import { BaseAuthStore, RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export default class SessionAuthStore extends BaseAuthStore {
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
};
