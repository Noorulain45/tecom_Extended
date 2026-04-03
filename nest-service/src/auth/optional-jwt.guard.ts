import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Allows unauthenticated requests through (user will be null)
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || null;
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
