import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GroupService } from '../services/group.service';
import { groupExistsGuard } from './group-exists.guard';

describe('groupExistsGuard', () => {
  let router: Router;
  let mockGroupService: jasmine.SpyObj<GroupService>;

  function createRouteWithParam(groupId: string | null) {
    return { paramMap: new Map([['groupId', groupId]]) } as any;
  }

  beforeEach(() => {
    mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);

    TestBed.configureTestingModule({
      providers: [
        { provide: GroupService, useValue: mockGroupService },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should return true when group exists', async () => {
    mockGroupService.getById.and.resolveTo({ id: 'group-1', name: 'Teste' } as any);
    const result = await TestBed.runInInjectionContext(() =>
      groupExistsGuard(createRouteWithParam('group-1'), {} as any)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to /my-groups when group is not found', async () => {
    mockGroupService.getById.and.rejectWith(new Error('Not found'));
    const result = await TestBed.runInInjectionContext(() =>
      groupExistsGuard(createRouteWithParam('group-1'), {} as any)
    );
    expect((result as any).toString()).toContain('/my-groups');
  });

  it('should redirect to /my-groups when groupId is missing', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      groupExistsGuard(createRouteWithParam(null), {} as any)
    );
    expect((result as any).toString()).toContain('/my-groups');
  });
});
