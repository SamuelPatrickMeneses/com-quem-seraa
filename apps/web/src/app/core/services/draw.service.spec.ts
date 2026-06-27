import { TestBed } from '@angular/core/testing';
import { DrawService } from './draw.service';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';
import { GroupService } from './group.service';
import SessionAuthStore from '../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../infrastructure/pocketbase/inMemory.auth.store';

describe('DrawService', () => {
  let service: DrawService;
  let mockParticipantCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;
  let mockGroupCollection: jasmine.SpyObj<ReturnType<PocketBaseClient['instance']['collection']>>;

  function createMockPbClient() {
    mockParticipantCollection = jasmine.createSpyObj('ParticipantRecordService', [
      'getFullList',
      'update',
    ]);

    mockGroupCollection = jasmine.createSpyObj('GroupRecordService', [
      'update',
    ]);

    const mockPb = {
      collection: jasmine.createSpy('collection').and.callFake((name: string) => {
        if (name === 'group_participants') return mockParticipantCollection;
        if (name === 'groups') return mockGroupCollection;
        return null;
      }),
    };

    return { instance: mockPb } as unknown as jasmine.SpyObj<PocketBaseClient>;
  }

  function makeParticipant(id: string, giverId: string, giverName: string) {
    return { id, giver_id: giverId, giver_name: giverName, group_id: 'group-1' };
  }

  beforeEach(() => {
    const mockPbClient = createMockPbClient();
    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);

    TestBed.configureTestingModule({
      providers: [
        DrawService,
        { provide: PocketBaseClient, useValue: mockPbClient },
        { provide: GroupService, useValue: mockGroupService },
        { provide: SessionAuthStore, useValue: new InMemoryAuthStore() },
      ],
    });

    service = TestBed.inject(DrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('performDraw', () => {
    it('should throw when there are fewer than 3 participants', async () => {
      mockParticipantCollection.getFullList.and.resolveTo([
        makeParticipant('p1', 'user-1', 'Ana'),
        makeParticipant('p2', 'user-2', 'Beto'),
      ]);

      await expectAsync(service.performDraw('group-1')).toBeRejectedWithError(
        'É necessário no mínimo 3 participantes para realizar o sorteio.'
      );

      expect(mockParticipantCollection.update).not.toHaveBeenCalled();
      expect(mockGroupCollection.update).not.toHaveBeenCalled();
    });

    it('should update all participants with receiver and mark group as drawn', async () => {
      const participants = [
        makeParticipant('p1', 'user-1', 'Ana'),
        makeParticipant('p2', 'user-2', 'Beto'),
        makeParticipant('p3', 'user-3', 'Caio'),
      ];
      mockParticipantCollection.getFullList.and.resolveTo(participants);
      mockParticipantCollection.update.and.callFake((id: string, data: any) => Promise.resolve({ id, ...data }));
      mockGroupCollection.update.and.resolveTo({ id: 'group-1', has_been_drawn: true });

      await service.performDraw('group-1');

      expect(mockParticipantCollection.getFullList).toHaveBeenCalledWith(
        jasmine.objectContaining({ filter: 'group_id = "group-1"' } as any)
      );

      expect(mockParticipantCollection.update).toHaveBeenCalledTimes(3);
      expect(mockGroupCollection.update).toHaveBeenCalledWith('group-1', {
        has_been_drawn: true,
        drawn_at: jasmine.any(String),
      });
    });

    it('should not assign any participant to give a gift to themselves', async () => {
      const participants = [
        makeParticipant('p1', 'user-1', 'Ana'),
        makeParticipant('p2', 'user-2', 'Beto'),
        makeParticipant('p3', 'user-3', 'Caio'),
      ];
      mockParticipantCollection.getFullList.and.resolveTo(participants);
      mockParticipantCollection.update.and.callFake((id: string, data: any) => Promise.resolve({ id, ...data }));
      mockGroupCollection.update.and.resolveTo({ id: 'group-1', has_been_drawn: true });

      await service.performDraw('group-1');

      const updates = mockParticipantCollection.update.calls.allArgs();
      for (const [id, data] of updates) {
        const participant = participants.find(p => p.id === id)!;
        expect((data as any).receiver_id).not.toBe(participant.giver_id);
      }
    });

    it('should form a complete cycle of giver-receiver pairs', async () => {
      const participants = [
        makeParticipant('p1', 'user-1', 'Ana'),
        makeParticipant('p2', 'user-2', 'Beto'),
        makeParticipant('p3', 'user-3', 'Caio'),
      ];
      mockParticipantCollection.getFullList.and.resolveTo(participants);
      mockParticipantCollection.update.and.callFake((id: string, data: any) => Promise.resolve({ id, ...data }));
      mockGroupCollection.update.and.resolveTo({ id: 'group-1', has_been_drawn: true });

      await service.performDraw('group-1');

      const updates = mockParticipantCollection.update.calls.allArgs();
      const assignedReceivers = updates.map(([_, data]) => (data as any).receiver_id);
      const allUserIds = participants.map(p => p.giver_id);

      expect(assignedReceivers.sort()).toEqual(allUserIds.sort());
    });
  });

  describe('fisherYatesShuffle (private)', () => {
    it('should not mutate the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      const shuffled = (service as any).fisherYatesShuffle(original);
      expect(original).toEqual(copy);
      expect(shuffled).not.toEqual(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should ensure no element stays in its original position (self-gift prevention)', () => {
      for (let run = 0; run < 50; run++) {
        const input = ['a', 'b', 'c', 'd', 'e'];
        const result = (service as any).fisherYatesShuffle(input);
        for (let i = 0; i < input.length; i++) {
          expect(result[i]).not.toBe(input[i]);
        }
      }
    });
  });
});
