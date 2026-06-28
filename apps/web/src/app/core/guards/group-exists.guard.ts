import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GroupService } from '../services/group.service';

export const groupExistsGuard: CanActivateFn = async (route) => {
  const groupService = inject(GroupService);
  const router = inject(Router);
  const groupId = route.paramMap.get('groupId');

  if (!groupId) {
    return router.createUrlTree(['/my-groups']);
  }

  try {
    await groupService.getById(groupId);
    return true;
  } catch {
    return router.createUrlTree(['/my-groups']);
  }
};
