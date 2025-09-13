import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const token = localStorage.getItem("token");
    const authorizedRequest = request.url.includes("/login") || request.url.includes("/register")
    ? request
    : request.clone({
      headers: request.headers.set("Authorization", `Bearer ${token}`)
    });

    return next(authorizedRequest);
}