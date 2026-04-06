import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.isHttpException(exception) ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.isHttpException(exception) ? exception.getResponse() : 'Internal server error';
    response.status(status).json({ statusCode: status, timestamp: new Date().toISOString(), path: request.url, message });
  }
  private isHttpException(exception: unknown): exception is HttpException { return exception instanceof HttpException; }
}