import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('linkAnimation', [
      state('normal', style({
        transform: 'scale(1)',
      })),
      state('hovered', style({
        transform: 'scale(1.05)',
      })),
      transition('normal <=> hovered', animate('150ms ease-in-out')),
    ]),
    trigger('buttonAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class NavbarComponent {
  private linkStates: { [key: string]: string } = {
    dashboard: 'normal',
    summary: 'normal',
    reports: 'normal'
  };

  constructor(private tokenService: TokenService, private router: Router) {}

  onHover(link: string): void {
    this.linkStates[link] = this.linkStates[link] === 'normal' ? 'hovered' : 'normal';
  }

  getLinkState(link: string): string {
    return this.linkStates[link];
  }

  handleLogout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/']);
  }
  routeToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  routeToSummary(): void {
    this.router.navigate(['/summary']);
  }
  routeToReports(): void {
    this.router.navigate(['/reports']);
  }
}

