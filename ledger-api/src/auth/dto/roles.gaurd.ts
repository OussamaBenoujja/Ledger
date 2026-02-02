
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../roles.decorator'
import { UserRole } from 'src/users/user-role.enum'



@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private readonly reflector: Reflector) { }


    canActivate(context: ExecutionContext): boolean {

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as { userId: string; role: UserRole } | undefined;

        if (!user) throw new ForbiddenException('Missing user context');


        const allowed = requiredRoles.includes(user.role);
        if (!allowed) throw new ForbiddenException('Insufficient permissions');


        return true;

    }


}