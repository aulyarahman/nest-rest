import { Roles as Role, Roles } from '../../enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { JwtPayload } from '../../auth/interface';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const user = request.user as JwtPayload;

      return user?.roles.includes(role);
    }
  }

  return mixin(RoleGuardMixin);
};

export const RoleAllGuard = (): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const user = request.user as JwtPayload;
      const roles = [Roles.Courier, Roles.Customer, Roles.Mitra, Roles.Admin];
      return roles.some(role => user?.roles.includes(role));
    }
  }

  return mixin(RoleGuardMixin);
};

export const RoleGuards = (role: Role[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const user = request.user as JwtPayload;

      // return user?.roles.includes(role);
      return role.some(role => user?.roles.includes(role));
    }
  }

  return mixin(RoleGuardMixin);
};
