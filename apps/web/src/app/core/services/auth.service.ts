import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:80');
  }

  /**
   * Retorna se o usuário está autenticado
   */
  get isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Retorna os dados do usuário logado
   */
  get user() {
    return this.pb.authStore.model;
  }

  /**
   * Realiza o login com e-mail e senha
   */
  async login(email: string, pass: string) {
    return await this.pb.collection('users').authWithPassword(email, pass);
  }

  /**
   * Realiza o logout
   */
  logout() {
    this.pb.authStore.clear();
  }

  /**
   * Realiza o registro de um novo usuário
   */
  async register(data: any) {
    const user = await this.pb.collection('users').create(data);
    await this.pb.collection('users').requestVerification(data.email);
    return user;
  }

  /**
   * Retorna a instância do PocketBase para outros usos (ex: listar coleções)
   */
  get pocketBase(): PocketBase {
    return this.pb;
  }
}
