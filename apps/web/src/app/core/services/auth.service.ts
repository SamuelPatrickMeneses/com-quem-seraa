import { Injectable, inject } from '@angular/core';
import PocketBase from 'pocketbase';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pbClient = inject(PocketBaseClient);

  /**
   * Atualiza o nome do usuário autenticado
   */
  async updateName(name: string): Promise<void> {
    const user = this.user;
    if (!user?.id) throw new Error('Usuário não autenticado');
    const record = await this.pbClient.instance.collection('users').update(user.id, { name });
    this.pbClient.instance.authStore.save(record['token'] || '', record);
  }

  /**
   * Altera a senha do usuário autenticado
   */
  async updatePassword(oldPassword: string, password: string, passwordConfirm: string): Promise<void> {
    const user = this.user;
    if (!user?.id) throw new Error('Usuário não autenticado');
    await this.pbClient.instance.collection('users').update(user.id, { oldPassword, password, passwordConfirm });
  }

  /**
   * Retorna se o usuário está autenticado
   */
  get isAuthenticated(): boolean {
    return this.pbClient.instance.authStore.isValid;
  }

  /**
   * Retorna os dados do usuário logado
   */
  get user() {
    return this.pbClient.instance.authStore.model;
  }

  /**
   * Realiza o login com e-mail e senha
   */
  async login(email: string, pass: string) {
    return await this.pbClient.instance.collection('users').authWithPassword(email, pass);
  }

  /**
   * Realiza o logout
   */
  logout() {
    this.pbClient.instance.authStore.clear();
  }

  /**
   * Realiza o registro de um novo usuário
   */
  async register(data: any) {
    const user = await this.pbClient.instance.collection('users').create(data);
    await this.pbClient.instance.collection('users').requestVerification(data.email);
    return user;
  }

  /**
   * Retorna a instância do PocketBase para outros usos (ex: listar coleções)
   */
  get pocketBase(): PocketBase {
    return this.pbClient.instance;
  }
}
