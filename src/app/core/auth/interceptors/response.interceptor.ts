import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        const body = event.body as Record<string, unknown>;
        if (body?.['data'] !== undefined) {
          return event.clone({ body: body['data'] });
        }
      }
      return event;
    })
  );
};