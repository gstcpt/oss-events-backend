import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function isDate(value: any): value is Date {
  return value instanceof Date;
}

function serializeDates(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(serializeDates);
  }

  if (isDate(data)) {
    return data.toISOString();
  }

  if (typeof data === 'object') {
    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = serializeDates(data[key]);
      }
    }
    return newObj;
  }

  return data;
}

@Injectable()
export class DateSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => serializeDates(data)));
  }
}