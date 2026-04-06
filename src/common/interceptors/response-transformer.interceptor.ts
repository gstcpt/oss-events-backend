import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (data && typeof data === 'object') {
          return this.transformBigInts(data);
        }
        return data;
      }),
    );
  }

  private transformBigInts(obj: any): any {
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformBigInts(item));
    }
    if (obj && typeof obj === 'object') {
      const transformed = {};
      for (const key in obj) {
        transformed[key] = this.transformBigInts(obj[key]);
      }
      return transformed;
    }
    return obj;
  }
}