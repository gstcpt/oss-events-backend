import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const user = request.user || 'anonymous';
    this.logger.log(`${method} ${url} - User: ${user} - Time: ${Date.now() - now}ms`);
    return next.handle().pipe(
      tap(() => this.logger.log(`${method} ${url} - Success - Time: ${Date.now() - now}ms`)),
    );
  }
}