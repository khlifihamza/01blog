import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateNavbarVisibility(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavbarVisibility(event.urlAfterRedirects);
      });
  }

  private updateNavbarVisibility(url: string) {
    this.showNavbar = !url.includes('/auth/');
  }
}
