import { Injectable, inject } from '@angular/core';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private pbClient = inject(PocketBaseClient);

  private get baseUrl(): string {
    return this.pbClient.instance.baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const token = this.pbClient.instance.authStore.token;
    const response = await fetch(`${this.baseUrl}/api/collections/${endpoint}/records`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const token = this.pbClient.instance.authStore.token;
    const response = await fetch(`${this.baseUrl}/api/collections/${endpoint}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    return response.json();
  }
}
