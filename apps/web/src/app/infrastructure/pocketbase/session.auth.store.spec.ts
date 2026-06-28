import SessionAuthStore, { PB_AUTH_STORAGE_KEY } from './session.auth.store';

describe('SessionAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should restore token and model from localStorage on init', () => {
    localStorage.setItem(
      PB_AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'stored-token',
        model: { id: 'user-1', name: 'Ana', collectionId: 'users', collectionName: 'users' },
      }),
    );

    const store = new SessionAuthStore();

    expect(store.token).toBe('stored-token');
    expect(store.model?.id).toBe('user-1');
    expect(store.isValid).toBeTrue();
  });

  it('should persist token and model to localStorage on save', () => {
    const store = new SessionAuthStore();

    store.save('fresh-token', {
      id: 'user-2',
      name: 'Beto',
      collectionId: 'users',
      collectionName: 'users',
    });

    const raw = localStorage.getItem(PB_AUTH_STORAGE_KEY);
    expect(raw).toBeTruthy();

    const parsed = JSON.parse(raw!);
    expect(parsed.token).toBe('fresh-token');
    expect(parsed.model.id).toBe('user-2');
  });

  it('should remove persisted auth data on clear', () => {
    const store = new SessionAuthStore();
    store.save('token-to-clear', {
      id: 'user-3',
      name: 'Caio',
      collectionId: 'users',
      collectionName: 'users',
    });

    store.clear();

    expect(localStorage.getItem(PB_AUTH_STORAGE_KEY)).toBeNull();
    expect(store.token).toBe('');
    expect(store.isValid).toBeFalse();
  });

  it('should ignore invalid persisted payload', () => {
    localStorage.setItem(PB_AUTH_STORAGE_KEY, '{invalid-json');

    const store = new SessionAuthStore();

    expect(store.isValid).toBeFalse();
    expect(localStorage.getItem(PB_AUTH_STORAGE_KEY)).toBeNull();
  });
});
