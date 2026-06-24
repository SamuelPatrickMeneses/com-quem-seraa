import { TestBed } from '@angular/core/testing';
import { ParticipantService } from './participant.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import SessionAuthStore from '../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../infrastructure/pocketbase/inMemory.auth.store';

describe('ParticipantService', () => {
  let service: ParticipantService;
  let mockParticipantCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;
  let mockAuthStore: {
    isValid: boolean;
    model: Record<string, unknown> | null;
    clear: jasmine.Spy;
  };

  function createMockPbClient() {
    mockParticipantCollection = jasmine.createSpyObj('ParticipantRecordService', [
      'getList',
      'getOne',
      'create',
      'update',
      'delete',
    ]);

    mockAuthStore = {
      isValid: true,
      model: { id: 'user-1', name: 'Test User' },
      clear: jasmine.createSpy('clear'),
    };

    const mockPb = {
      collection: jasmine.createSpy('collection').and.returnValue(mockParticipantCollection),
      authStore: mockAuthStore,
    };

    return { instance: mockPb } as unknown as jasmine.SpyObj<PocketBaseClient>;
  }

  beforeEach(() => {
    const mockPbClient = createMockPbClient();

    TestBed.configureTestingModule({
      providers: [
        ParticipantService,
        { provide: PocketBaseClient, useValue: mockPbClient },
        { provide: SessionAuthStore, useValue: new InMemoryAuthStore() },
      ],
    });

    service = TestBed.inject(ParticipantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('joinGroup', () => {
    it('should create a participant record with the given group id', async () => {
      const expected = { id: 'p1', group_id: 'group-1', giver_id: 'user-1', receiver_id: null };
      mockParticipantCollection.create.and.resolveTo(expected);

      const result = await service.joinGroup('group-1');

      expect(mockParticipantCollection.create).toHaveBeenCalledWith(
        { group_id: 'group-1', giver_id: 'user-1', giver_name: 'Test User', receiver_id: null, receiver_name: null },
        undefined,
      );
      expect(result).toEqual(expected as any);
    });

    it('should throw when user is not authenticated', async () => {
      mockAuthStore.model = null;

      await expectAsync(service.joinGroup('group-1')).toBeRejectedWithError('Usuário não autenticado');
      expect(mockParticipantCollection.create).not.toHaveBeenCalled();
    });
  });

  describe('getParticipants', () => {
    it('should call getList with filter by group_id and expand', async () => {
      const expected = { items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 50 };
      mockParticipantCollection.getList.and.resolveTo(expected);

      const result = await service.getParticipants('group-1');

      expect(mockParticipantCollection.getList).toHaveBeenCalledWith(1, 50, {
        filter: 'group_id = "group-1"',
        expand: 'giver_id,receiver_id',
      });
      expect(result).toEqual(expected as any);
    });
  });
});
