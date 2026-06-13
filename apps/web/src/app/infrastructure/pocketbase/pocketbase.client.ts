import { inject, Injectable, InjectionToken } from '@angular/core';
import PocketBase, { BaseAuthStore } from 'pocketbase';
import SessionAuthStore from './session.auth.store';

export const POCKETBASE_URL = new InjectionToken<string>('POCKETBASE_URL', {
  factory: () =>
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:80',
});

@Injectable({
  providedIn: 'root'
})
export class PocketBaseClient {
  private pb: PocketBase;
  private authStore: BaseAuthStore = inject(SessionAuthStore);
  private apiUrl: string = inject(POCKETBASE_URL);

  constructor() {
    this.pb = new PocketBase(this.apiUrl, this.authStore);
  }

  get instance(): PocketBase {
    return this.pb;
  }
}
