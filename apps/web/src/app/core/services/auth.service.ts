import { Injectable, inject } from '@angular/core';
import PocketBase from 'pocketbase';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import { User, UpdateProfileDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pbClient = inject(PocketBaseClient);

  /**
   * Retorna se o usuário está autenticado
   */
  get isAuthenticated(): boolean {
    return this.pbClient.instance.authStore.isValid;
  }

  /**
   * Retorna os dados do usuário logado
   */
  get user(): User | null {
    return this.pbClient.instance.authStore.model as User | null;
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

  /**
   * Atualiza os dados de perfil (como o nome)
   */
  async updateProfile(userId: string, data: Pick<UpdateProfileDTO, 'name' | 'bio'>) {
    return await this.pbClient.instance.collection('users').update(userId, data);
  }

  /**
   * Atualiza a senha
   * O PocketBase exige re-autenticação antes de aceitar a troca de senha
   */
  async changePassword(userId: string, data: { oldPassword: string, password: string, passwordConfirm: string }) {
    const email = this.user?.['email'];
    if (!email) throw new Error('Usuário não autenticado.');

    // Re-autentica com a senha atual para garantir token válido
    await this.pbClient.instance.collection('users').authWithPassword(email, data.oldPassword);

    // Atualiza a senha
    return await this.pbClient.instance.collection('users').update(userId, {
      oldPassword: data.oldPassword,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
  }
}
