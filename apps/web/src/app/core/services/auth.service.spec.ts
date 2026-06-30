import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import InMemoryAuthStore from '../../infrastructure/pocketbase/inMemory.auth.store';
import SessionAuthStore from '../../infrastructure/pocketbase/session.auth.store';


describe('AuthService', () => {
  let service: AuthService;
  let mockPbClient: jasmine.SpyObj<PocketBaseClient>;
  let mockCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;
  let mockAuthStore: { isValid: boolean; model: Record<string, unknown> | null; token: string; clear: jasmine.Spy; save: jasmine.Spy };

  beforeEach(() => {
    mockCollection = jasmine.createSpyObj('RecordService', [
      'authWithPassword',
      'create',
      'requestVerification',
      'update',
    ]);

    mockAuthStore = {
      isValid: true,
      token: 'token-1',
      model: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Likes cocoa',
        collectionId: 'users',
        collectionName: 'users',
        emailVisibility: false,
        verified: true,
        created: '2026-06-27T00:00:00.000Z',
        updated: '2026-06-27T00:00:00.000Z',
      },
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
      expect(service.user).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Likes cocoa',
        collectionId: 'users',
        collectionName: 'users',
        emailVisibility: false,
        verified: true,
        created: '2026-06-27T00:00:00.000Z',
        updated: '2026-06-27T00:00:00.000Z',
      });
    });

    it('should return null when authStore.model is null', () => {
      mockAuthStore.model = null;
      expect(service.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should call authWithPassword with email and password and persist auth', async () => {
      const expectedResult = {
        token: 'abc',
        record: { id: 'user-1', collectionId: 'users', collectionName: 'users' },
      };
      mockCollection.authWithPassword.and.resolveTo(expectedResult);

      const result = await service.login('email@test.com', '123456');

      expect(mockCollection.authWithPassword).toHaveBeenCalledWith('email@test.com', '123456');
      expect(mockAuthStore.save).toHaveBeenCalledWith('abc', expectedResult.record);
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
    it('should create user, request verification and login', async () => {
      const data = { email: 'new@test.com', password: '123456', passwordConfirm: '123456', name: 'New User' };
      const authResult = {
        token: 'new-token',
        record: { id: 'user-2', collectionId: 'users', collectionName: 'users', ...data },
      };
      mockCollection.create.and.resolveTo(authResult.record);
      mockCollection.requestVerification.and.resolveTo();
      mockCollection.authWithPassword.and.resolveTo(authResult);

      const result = await service.register(data);

      expect(mockCollection.create).toHaveBeenCalledWith(data);
      expect(mockCollection.requestVerification).toHaveBeenCalledWith('new@test.com');
      expect(mockCollection.authWithPassword).toHaveBeenCalledWith('new@test.com', '123456');
      expect(mockAuthStore.save).toHaveBeenCalledWith('new-token', authResult.record);
      expect(result).toEqual(authResult);
    });
  });

  describe('pocketBase', () => {
    it('should return the raw PocketBase instance', () => {
      const pb = service.pocketBase;
      expect(pb.collection).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update name and bio', async () => {
      mockCollection.update.and.resolveTo({
        id: 'user-1',
        name: 'New Name',
        bio: 'New bio',
        collectionId: 'users',
        collectionName: 'users',
        emailVisibility: false,
        verified: true,
        created: '2026-06-27T00:00:00.000Z',
        updated: '2026-06-27T00:00:00.000Z',
      });

      const result = await service.updateProfile('user-1', { name: 'New Name', bio: 'New bio' });

      expect(mockCollection.update).toHaveBeenCalledWith('user-1', { name: 'New Name', bio: 'New bio' });
      expect(mockAuthStore.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'user-1',
        name: 'New Name',
        bio: 'New bio',
        collectionId: 'users',
        collectionName: 'users',
        emailVisibility: false,
        verified: true,
        created: '2026-06-27T00:00:00.000Z',
        updated: '2026-06-27T00:00:00.000Z',
      });
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar and refresh authStore', async () => {
      const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      mockCollection.update.and.resolveTo({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatars/avatar.png',
        collectionId: 'users',
        collectionName: 'users',
        emailVisibility: false,
        verified: true,
        created: '2026-06-27T00:00:00.000Z',
        updated: '2026-06-27T00:00:00.000Z',
      });

      const result = await service.updateAvatar('user-1', avatar);

      expect(mockCollection.update).toHaveBeenCalledWith('user-1', { avatar });
      expect(mockAuthStore.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatars/avatar.png',
        collectionId: 'users',
        collectionName: 'users',
        emailVisibility: false,
        verified: true,
        created: '2026-06-27T00:00:00.000Z',
        updated: '2026-06-27T00:00:00.000Z',
      });
    });
  });
});
