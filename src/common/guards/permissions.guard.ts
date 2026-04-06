import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY, PermissionOptions } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const metadata = this.reflector.getAllAndOverride<{ permissions: string[], options?: PermissionOptions }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

        let requiredPermissions: string[] = [];
        let options: PermissionOptions | undefined;

        if (Array.isArray(metadata)) {
            requiredPermissions = metadata;
        } else if (metadata && typeof metadata === 'object') {
            requiredPermissions = metadata.permissions;
            options = metadata.options;
        }

        if (!requiredPermissions || requiredPermissions.length === 0) { return true; }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) { throw new ForbiddenException('User is not authenticated.'); }
        if (!user.role_id) { throw new ForbiddenException('User role is missing or invalid.'); }

        const roleId = Number(user.role_id);

        // --- 1. Root Bypass (Role ID 1) ---
        if (roleId === 1) { return true; }

        // --- 2. Admin Bypass (Role ID 2) for ownership checks ---
        // Admins can manage everything they have permissions for, ignoring ownership.
        const isAdmin = roleId === 2;

        // --- 3. Basic Permission Check ---
        const userRolePermissions = await this.prisma.client.roles.findUnique({ where: { id: BigInt(roleId) }, include: { role_permission: { include: { permissions: true } } } });
        const userPermissionCodes = userRolePermissions?.role_permission.map((rp: any) => rp.permissions.code) || [];
        const hasPermission = requiredPermissions.every(perm => userPermissionCodes.includes(perm));

        if (!hasPermission) { throw new ForbiddenException('You do not have the necessary permissions to access this resource.'); }

        // --- 4. Ownership Check (If configured and user is NOT an Admin/Root) ---
        if (options?.checkOwnership && !isAdmin) {
            const resourceId = request.params[options.resourceIdParam || 'id'];
            const resourceEntity = options.resourceEntity;
            const ownerField = options.ownerField || 'user_id';

            if (resourceId && resourceEntity) {
                // Find the resource in the database
                const resource = await (this.prisma.client[resourceEntity] as any).findUnique({
                    where: { id: BigInt(resourceId) },
                    select: { [ownerField]: true }
                });

                if (resource) {
                    const ownerId = resource[ownerField];
                    if (BigInt(ownerId) !== BigInt(user.id)) {
                        throw new ForbiddenException('You do not own this resource.');
                    }
                }
            }
        }

        return true;
    }
}