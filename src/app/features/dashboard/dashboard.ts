import { Component, inject } from '@angular/core';
import { Router }            from '@angular/router';

import { MatButtonModule }   from '@angular/material/button';
import { MatCardModule }     from '@angular/material/card';
import { MatIconModule }     from '@angular/material/icon';
import { MatChipsModule }    from '@angular/material/chips';

import { AuthService } from '@core/auth/services/auth.service';
import { UserRole }    from '@core/auth/models/auth.models';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatChipsModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly router = inject(Router);
  readonly auth           = inject(AuthService);
  readonly UserRole       = UserRole;

  logout(): void {
    this.auth.logout();
  }
}