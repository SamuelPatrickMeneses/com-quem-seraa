import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';
import { isOrganizerGuard } from './is-organizer.guard';

describe('isOrganizerGuard', () => {
  let router: Router;
  let mockGroupService: jasmine.SpyObj<GroupService>;
  let mockAuthService: any;

  function createRouteWithParam(groupId: string | null) {
    return { paramMap: new Map([['groupId', groupId]]) } as any;
  }

  beforeEach(() => {
    mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
    mockAuthService = {
      user: { id: 'user-1', name: 'Ana' },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: GroupService, useValue: mockGroupService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should return true when user is the organizer', async () => {
    mockGroupService.getById.and.resolveTo({ id: 'group-1', created_by: 'user-1' } as any);
    const result = await TestBed.runInInjectionContext(() =>
      isOrganizerGuard(createRouteWithParam('group-1'), {} as any)
    );
    expect(result).toBeTrue();
  });

  it('should redirect when user is not the organizer', async () => {
    mockGroupService.getById.and.resolveTo({ id: 'group-1', created_by: 'user-2' } as any);
    const result = await TestBed.runInInjectionContext(() =>
      isOrganizerGuard(createRouteWithParam('group-1'), {} as any)
    );
    expect((result as any).toString()).toContain('/my-groups');
  });

  it('should redirect when user is not authenticated', async () => {
    mockAuthService.user = null;
    mockGroupService.getById.and.resolveTo({ id: 'group-1', created_by: 'user-1' } as any);
    const result = await TestBed.runInInjectionContext(() =>
      isOrganizerGuard(createRouteWithParam('group-1'), {} as any)
    );
    expect((result as any).toString()).toContain('/my-groups');
  });

  it('should redirect when groupId is missing', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      isOrganizerGuard(createRouteWithParam(null), {} as any)
    );
    expect((result as any).toString()).toContain('/my-groups');
  });

  it('should redirect on error', async () => {
    mockGroupService.getById.and.rejectWith(new Error('Network error'));
    const result = await TestBed.runInInjectionContext(() =>
      isOrganizerGuard(createRouteWithParam('group-1'), {} as any)
    );
    expect((result as any).toString()).toContain('/my-groups');
  });
});
