import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketBaseClient {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(environment.apiUrl);
  }

  get instance(): PocketBase {
    return this.pb;
  }
}
