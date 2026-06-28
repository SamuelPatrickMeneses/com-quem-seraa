import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GroupService } from '../services/group.service';
import { AuthService } from '../services/auth.service';

export const isOrganizerGuard: CanActivateFn = async (route) => {
  const groupService = inject(GroupService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const groupId = route.paramMap.get('groupId');

  if (!groupId) {
    return router.createUrlTree(['/my-groups']);
  }

  try {
    const group = await groupService.getById(groupId);
    const user = authService.user;

    if (!user || group.created_by !== user.id) {
      return router.createUrlTree(['/my-groups']);
    }

    return true;
  } catch {
    return router.createUrlTree(['/my-groups']);
  }
};
