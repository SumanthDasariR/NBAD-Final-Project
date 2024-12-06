import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-20px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', [
        animate('0.8s ease-in-out')
      ])
    ]),
    trigger('fadeInDown', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', [
        animate('0.8s 0.2s ease-in-out')
      ])
    ]),
    trigger('hoverScale', [
      state('default', style({
        transform: 'scale(1)'
      })),
      state('hover', style({
        transform: 'scale(1.1)'
      })),
      transition('default <=> hover', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class WelcomeComponent implements OnInit {
  hoverState = 'default';
  animationState = 'hidden';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.animationState = 'visible';
  }

  onMouseEnter() {
    this.hoverState = 'hover';
  }

  onMouseLeave() {
    this.hoverState = 'default';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}