import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionOptions {
  checkOwnership?: boolean;
  resourceEntity?: string;
  resourceIdParam?: string;
  ownerField?: string;
}

export const RequirePermissions = (permissions: string | string[], options?: PermissionOptions) => 
  SetMetadata(PERMISSIONS_KEY, { 
    permissions: Array.isArray(permissions) ? permissions : [permissions], 
    options 
  });
