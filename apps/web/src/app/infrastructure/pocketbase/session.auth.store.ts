import { Injectable } from '@angular/core';
import { BaseAuthStore, RecordModel } from 'pocketbase';

export const PB_AUTH_STORAGE_KEY = 'pb_auth';

@Injectable({
  providedIn: 'root',
})
export default class SessionAuthStore extends BaseAuthStore {
  private readonly storageKey = PB_AUTH_STORAGE_KEY;

  constructor() {
    super();
    this.restoreFromStorage();
  }

  override save(token: string, model?: RecordModel | null): void {
    super.save(token, model);
    this.persistToStorage(token, model ?? null);
  }

  override clear(): void {
    super.clear();
    this.removeFromStorage();
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return;
      }

      const data = JSON.parse(raw) as { token?: string; model?: RecordModel | null };
      if (data?.token) {
        super.save(data.token, data.model ?? null);
      }
    } catch {
      this.removeFromStorage();
    }
  }

  private persistToStorage(token: string, model: RecordModel | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify({ token, model }));
  }

  private removeFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }
}
