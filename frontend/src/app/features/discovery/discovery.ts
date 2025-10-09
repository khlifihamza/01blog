import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { DiscoveryPost } from '../../shared/models/post.model';
import { DiscoveryUser } from '../../shared/models/user.model';
import { DiscoveryService } from '../../core/services/discovery.service';
import { FollowComponent } from '../../shared/follow/follow';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { calculReadTime } from '../../shared/utils/readtime';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTabsModule,
    MatToolbarModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    FollowComponent,
    NavbarComponent,
  ],
  templateUrl: './discovery.html',
  styleUrl: './discovery.css',
})
export class DiscoveryComponent implements OnInit {
  searchQuery = new FormControl('');
  selectedFilter = 'all';
  searchedPosts = signal<DiscoveryPost[]>([]);
  searchedUsers = signal<DiscoveryUser[]>([]);
  suggestedUsers = signal<DiscoveryUser[]>([]);
  suggestedPosts = signal<DiscoveryPost[]>([]);

  searchPage = 0;
  searchPageSize = 10;
  hasMoreSearchResults = true;
  isLoadingMoreSearchResults = false;

  constructor(
    private router: Router,
    private discoveryService: DiscoveryService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isLoadingMoreSearchResults) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= scrollThreshold) {
      if (this.searchQuery.value) {
        this.loadMoreSearchResults();
      }
    }
  }

  setupSearch() {
    this.searchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.searchPage = 0;
        this.hasMoreSearchResults = true;
        this.discoveryService
          .getSearchedData(searchValue!.toLowerCase(), this.searchPage, this.searchPageSize)
          .subscribe({
            next: (response) => {
              this.searchedUsers.set(response.discoveryUsers);
              this.searchedPosts.set(response.discoveryPosts);
              this.hasMoreSearchResults =
                response.discoveryPosts.length >= this.searchPageSize ||
                response.discoveryUsers.length >= this.searchPageSize;
            },
            error: (error) => this.errorService.handleError(error),
          });
      });
  }

  loadData() {
    this.discoveryService.getDiscoveryData().subscribe({
      next: (response) => {
        this.suggestedPosts.set(response.discoveryPosts);
        this.suggestedUsers.set(response.discoveryUsers);
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  onFilterChange() {}

  loadMoreSearchResults() {
    if (this.isLoadingMoreSearchResults || !this.hasMoreSearchResults) return;

    this.isLoadingMoreSearchResults = true;
    this.searchPage++;

    this.discoveryService
      .getSearchedData(this.searchQuery.value!.toLowerCase(), this.searchPage, this.searchPageSize)
      .subscribe({
        next: (response) => {
          if (
            response.discoveryPosts.length < this.searchPageSize &&
            response.discoveryUsers.length < this.searchPageSize
          ) {
            this.hasMoreSearchResults = false;
          }
          if (response.discoveryPosts.length > 0) {
            this.searchedPosts.update((currentPosts) => [
              ...currentPosts,
              ...response.discoveryPosts,
            ]);
          }
          if (response.discoveryUsers.length > 0) {
            this.searchedUsers.update((currentUsers) => [
              ...currentUsers,
              ...response.discoveryUsers,
            ]);
          }
          this.isLoadingMoreSearchResults = false;
        },
        error: (error) => {
          this.errorService.handleError(error);
          this.isLoadingMoreSearchResults = false;
          this.searchPage--;
        },
      });
  }

  getReadTime(htmlString: string): number {
    return calculReadTime(htmlString);
  }

  formatDate(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins < 1 ? 'Just now' : `${diffMins} minutes ago`;
    }

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }

    if (diffDays === 1) return 'Yesterday';

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  openPost(post: DiscoveryPost) {
    this.router.navigate(['/post', post.id]);
  }

  viewProfile(user: DiscoveryUser) {
    this.router.navigate(['/profile', user.username]);
  }

  onFollowChange(user: DiscoveryUser) {
    user.isFollowing = !user.isFollowing;
    user.followers += user.isFollowing ? 1 : -1;
  }
}
