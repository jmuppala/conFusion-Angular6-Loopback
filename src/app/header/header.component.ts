import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { Subscription } from 'rxjs';
import { LoopBackConfig } from '../shared/sdk';
import { Customer, AccessToken } from '../shared/sdk/models';
import { CustomerApi } from '../shared/sdk/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  username: string = undefined;
  customer: Customer = undefined;

  constructor(public dialog: MatDialog,
    private authService: CustomerApi ) { }

    ngOnInit() {
      this.customer = this.authService.getCachedCurrent();
      console.log('Header ngonInit ', this.customer);
      if (this.customer) {
        this.username = this.customer.username;
      }
    }

    openLoginForm() {
      const loginRef = this.dialog.open(LoginComponent, {width: '500px', height: '450px'});

      loginRef.afterClosed()
      .subscribe(result => {
        console.log('Login result ', result);
        this.customer = this.authService.getCachedCurrent();
        console.log('After Login ', this.customer);
        if (this.customer)  {
          this.username = this.customer.username;
        }
      });
    }

    logOut() {
      this.username = undefined;
      this.customer = undefined;
      this.authService.logout();
    }
}
