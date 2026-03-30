import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

/**
 * Auto-injects created_by / updated_by into request body
 * based on the currently authenticated user.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (userId && request.body && typeof request.body === 'object') {
      const method = request.method.toUpperCase();

      if (method === 'POST') {
        request.body.created_by = userId;
        request.body.updated_by = userId;
      } else if (method === 'PUT' || method === 'PATCH') {
        request.body.updated_by = userId;
      }
    }

    return next.handle();
  }
}
