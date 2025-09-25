import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private profileService: ProfileService, private router: Router) {}
  async canActivate(): Promise<boolean> {
    try {
      const user = await this.profileService.getUserInfo().pipe().toPromise();
      const isAdmin = user?.role === 'ADMIN';
      if (!isAdmin) {
        this.router.navigate(['']);
        return false;
      }
      return true;
    } catch (error) {
      this.router.navigate(['']);
      return false;
    }
  }
}
