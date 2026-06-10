import { inject, Injectable } from '@angular/core';
import PocketBase, { BaseAuthStore } from 'pocketbase';
import { environment } from '../../../environments/environment.development';
import SessionAuthStore from './session.auth.store';

@Injectable({
  providedIn: 'root'
})
export class PocketBaseClient {
  private pb: PocketBase;
  private authStore: BaseAuthStore = inject(SessionAuthStore);

  constructor() {
    this.pb = new PocketBase(environment.apiUrl, this.authStore);
  }

  get instance(): PocketBase {
    return this.pb;
  }
}
