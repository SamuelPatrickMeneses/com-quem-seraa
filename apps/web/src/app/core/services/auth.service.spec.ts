import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import InMemoryAuthStore from '../../infrastructure/pocketbase/inMemory.auth.store';
import SessionAuthStore from '../../infrastructure/pocketbase/session.auth.store';


describe('AuthService', () => {
  let service: AuthService;
  let mockPbClient: jasmine.SpyObj<PocketBaseClient>;
  let mockCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;
  let mockAuthStore: { isValid: boolean; model: Record<string, unknown> | null; clear: jasmine.Spy; save: jasmine.Spy };

  beforeEach(() => {
    mockCollection = jasmine.createSpyObj('RecordService', [
      'authWithPassword',
      'create',
      'requestVerification',
      'update',
    ]);

    mockAuthStore = {
      isValid: true,
      model: { id: 'user-1', name: 'Test User', email: 'test@example.com', collectionId: 'users', collectionName: 'users' },
      clear: jasmine.createSpy('clear'),
      save: jasmine.createSpy('save'),
    };

    const mockPb = {
      collection: jasmine.createSpy('collection').and.returnValue(mockCollection),
      authStore: mockAuthStore,
    };

    mockPbClient = {
      instance: mockPb,
    } as unknown as jasmine.SpyObj<PocketBaseClient>;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PocketBaseClient, useValue: mockPbClient },
        {provide: SessionAuthStore, useValue: new InMemoryAuthStore()},
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should return true when authStore.isValid is true', () => {
      expect(service.isAuthenticated).toBeTrue();
    });

    it('should return false when authStore.isValid is false', () => {
      mockAuthStore.isValid = false;
      expect(service.isAuthenticated).toBeFalse();
    });
  });

  describe('user', () => {
    it('should return the authStore model', () => {
      expect(service.user).toEqual({ id: 'user-1', name: 'Test User', email: 'test@example.com', collectionId: 'users', collectionName: 'users' });
    });

    it('should return null when authStore.model is null', () => {
      mockAuthStore.model = null;
      expect(service.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should call authWithPassword with email and password', async () => {
      const expectedResult = { token: 'abc', record: { id: 'user-1', collectionId: 'users', collectionName: 'users' } };
      mockCollection.authWithPassword.and.resolveTo(expectedResult);

      const result = await service.login('email@test.com', '123456');

      expect(mockCollection.authWithPassword).toHaveBeenCalledWith('email@test.com', '123456');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call authStore.clear', () => {
      service.logout();
      expect(mockAuthStore.clear).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create user and request verification', async () => {
      const data = { email: 'new@test.com', password: '123456', passwordConfirm: '123456', name: 'New User' };
      const createdUser = { id: 'user-2', collectionId: 'users', collectionName: 'users', ...data };
      mockCollection.create.and.resolveTo(createdUser);
      mockCollection.requestVerification.and.resolveTo();

      const result = await service.register(data);

      expect(mockCollection.create).toHaveBeenCalledWith(data);
      expect(mockCollection.requestVerification).toHaveBeenCalledWith('new@test.com');
      expect(result).toEqual(createdUser);
    });
  });

  describe('pocketBase', () => {
    it('should return the raw PocketBase instance', () => {
      const pb = service.pocketBase;
      expect(pb.collection).toBeDefined();
    });
  });

  describe('updateName', () => {
    it('should update user name and save to auth store', async () => {
      const updatedRecord = {
        id: 'user-1',
        name: 'New Name',
        email: 'test@example.com',
        collectionId: 'users',
        collectionName: 'users',
        token: 'new-token',
      };
      mockCollection.update.and.resolveTo(updatedRecord);

      await service.updateName('New Name');

      expect(mockCollection.update).toHaveBeenCalledWith('user-1', { name: 'New Name' });
      expect(mockAuthStore.save).toHaveBeenCalledWith('new-token', updatedRecord);
    });

    it('should throw when user is not authenticated', async () => {
      mockAuthStore.model = null;
      await expectAsync(service.updateName('New Name')).toBeRejectedWithError('Usuário não autenticado');
    });
  });

  describe('updatePassword', () => {
    it('should call collection.update with oldPassword, password and passwordConfirm', async () => {
      mockCollection.update.and.resolveTo({ id: 'user-1' });

      await service.updatePassword('oldPass', 'newPass123', 'newPass123');

      expect(mockCollection.update).toHaveBeenCalledWith('user-1', {
        oldPassword: 'oldPass',
        password: 'newPass123',
        passwordConfirm: 'newPass123',
      });
    });

    it('should throw when user is not authenticated', async () => {
      mockAuthStore.model = null;
      await expectAsync(service.updatePassword('oldPass', 'newPass123', 'newPass123'))
        .toBeRejectedWithError('Usuário não autenticado');
    });
  });
});
