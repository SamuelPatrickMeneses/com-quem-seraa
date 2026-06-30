import { TestBed } from '@angular/core/testing';
import { GroupService } from './group.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import SessionAuthStore from '../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../infrastructure/pocketbase/inMemory.auth.store';

describe('GroupService', () => {
  let service: GroupService;
  let mockCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;
  let mockParticipantCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;
  let mockAuthStore: {
    isValid: boolean;
    model: Record<string, unknown> | null;
    clear: jasmine.Spy;
  };

  function createMockPbClient() {
    mockCollection = jasmine.createSpyObj('GroupRecordService', [
      'getList',
      'getOne',
      'create',
      'update',
      'delete',
      'getFirstListItem',
    ]);

    mockParticipantCollection = jasmine.createSpyObj('ParticipantRecordService', [
      'getList',
    ]);

    mockAuthStore = {
      isValid: true,
      model: { id: 'user-1', name: 'Test User' },
      clear: jasmine.createSpy('clear'),
    };

    const mockPb = {
      collection: jasmine.createSpy('collection').and.callFake((name: string) => {
        if (name === 'group_participants') return mockParticipantCollection;
        return mockCollection;
      }),
      authStore: mockAuthStore,
    };

    return { instance: mockPb } as unknown as jasmine.SpyObj<PocketBaseClient>;
  }

  beforeEach(() => {
    const mockPbClient = createMockPbClient();

    TestBed.configureTestingModule({
      providers: [
        GroupService,
        { provide: PocketBaseClient, useValue: mockPbClient },
        {provide: SessionAuthStore, useValue: new InMemoryAuthStore()},
      ],
    });

    service = TestBed.inject(GroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('inherited CRUD', () => {
    it('getList should call collection.getList for groups', async () => {
      const expected = { items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 50 };
      mockCollection.getList.and.resolveTo(expected);

      const result = await service.getList(1, 10);

      expect(mockCollection.getList).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(expected as any);
    });

    it('getById should call collection.getOne for groups', async () => {
      const expected = { id: 'group-1', name: 'My Group', collectionId: 'groups', collectionName: 'groups' };
      mockCollection.getOne.and.resolveTo(expected);

      const result = await service.getById('group-1');

      expect(mockCollection.getOne).toHaveBeenCalledWith('group-1', undefined);
      expect(result).toEqual(expected as any);
    });

    it('create should call collection.create', async () => {
      const data = { name: 'New Group', created_by: 'user-1' };
      const expected = { id: 'group-2', collectionId: 'groups', collectionName: 'groups', ...data, has_been_drawn: false };
      mockCollection.create.and.resolveTo(expected);

      const result = await service.create(data as any);

      expect(mockCollection.create).toHaveBeenCalledWith(data, undefined);
      expect(result).toEqual(expected as any);
    });

    it('update should call collection.update', async () => {
      const data = { name: 'Updated Group' };
      mockCollection.update.and.resolveTo({ id: 'group-1', ...data });

      await service.update('group-1', data);

      expect(mockCollection.update).toHaveBeenCalledWith('group-1', data, undefined);
    });

    it('delete should call collection.delete', async () => {
      mockCollection.delete.and.resolveTo(true);

      const result = await service.delete('group-1');

      expect(mockCollection.delete).toHaveBeenCalledWith('group-1', undefined);
      expect(result).toBeTrue();
    });
  });

  describe('getMyGroups', () => {
    it('should merge groups where user is creator and participant', async () => {
      const createdGroups = [
        { id: 'group-1', name: 'My Group', created_by: 'user-1' },
      ];
      const participantRecords = {
        items: [
          {
            id: 'p1',
            group_id: 'group-2',
            expand: { group_id: { id: 'group-2', name: 'Joined Group', created_by: 'user-2' } },
          },
        ],
        totalItems: 1,
        totalPages: 1,
        page: 1,
        perPage: 50,
      };

      mockCollection.getList.and.resolveTo({ items: createdGroups, totalItems: 1, totalPages: 1, page: 1, perPage: 50 });
      mockParticipantCollection.getList.and.resolveTo(participantRecords);

      const result = await service.getMyGroups();

      expect(mockCollection.getList).toHaveBeenCalledWith(1, 200, {
        filter: 'created_by = "user-1"',
      });
      expect(mockParticipantCollection.getList).toHaveBeenCalledWith(1, 200, {
        filter: 'giver_id = "user-1"',
        expand: 'group_id',
      });
      expect(result.items.length).toBe(2);
      expect(result.items[0].id).toBe('group-1');
      expect(result.items[1].id).toBe('group-2');
    });

    it('should return empty list when user is not authenticated', async () => {
      mockAuthStore.model = null;

      const result = await service.getMyGroups();

      expect(result.items).toEqual([]);
      expect(mockCollection.getList).not.toHaveBeenCalled();
    });

    it('should deduplicate groups that appear in both lists', async () => {
      const createdGroups = [
        { id: 'group-1', name: 'My Group', created_by: 'user-1' },
      ];
      const participantRecords = {
        items: [
          {
            id: 'p1',
            group_id: 'group-1',
            expand: { group_id: { id: 'group-1', name: 'My Group', created_by: 'user-1' } },
          },
        ],
        totalItems: 1,
        totalPages: 1,
        page: 1,
        perPage: 50,
      };

      mockCollection.getList.and.resolveTo({ items: createdGroups, totalItems: 1, totalPages: 1, page: 1, perPage: 50 });
      mockParticipantCollection.getList.and.resolveTo(participantRecords);

      const result = await service.getMyGroups();

      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBe('group-1');
    });

    it('should skip participant records without expand.group_id', async () => {
      mockCollection.getList.and.resolveTo({ items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 50 });
      mockParticipantCollection.getList.and.resolveTo({
        items: [
          { id: 'p1', group_id: 'group-x' },
        ],
        totalItems: 1,
        totalPages: 1,
        page: 1,
        perPage: 50,
      });

      const result = await service.getMyGroups();

      expect(result.items.length).toBe(0);
    });
  });

  describe('getByInviteCode', () => {
    it('should call getFirstListItem with the code filter', async () => {
      const expected = { id: 'group-1', name: 'Invited Group' };
      mockCollection.getFirstListItem.and.resolveTo(expected);

      const result = await service.getByInviteCode('abc-123');

      expect(mockCollection.getFirstListItem).toHaveBeenCalledWith('id = "abc-123"');
      expect(result).toEqual(expected as any);
    });
  });
});
