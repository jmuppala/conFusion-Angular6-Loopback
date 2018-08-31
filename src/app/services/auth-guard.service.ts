import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Customer, AccessToken } from '../shared/sdk/models';
import { CustomerApi } from '../shared/sdk/services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {


  constructor(public authService: CustomerApi,
    public router: Router) { }

  canActivate(): boolean {
    if (!this.authService.getCachedCurrent()) {
      this.router.navigate(['home']);
      return false;
    }
    return true;
  }
}
