import { SetMetadata } from '@nestjs/common';
import { Roles as Role } from '../../enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
