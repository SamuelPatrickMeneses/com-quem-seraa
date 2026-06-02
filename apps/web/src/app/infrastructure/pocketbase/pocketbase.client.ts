import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketBaseClient {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:80');
  }

  get instance(): PocketBase {
    return this.pb;
  }
}
