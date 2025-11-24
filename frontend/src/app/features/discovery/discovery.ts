import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-discover',
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
    TimeAgoPipe,
    InfiniteScrollDirective
  ],
  templateUrl: './discovery.html',
  styleUrl: './discovery.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  hasMoreSearchResults = signal(false);
  isLoadingMoreSearchResults = signal(false);

  constructor(
    private router: Router,
    private discoveryService: DiscoveryService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  onScroll() {
    if (this.isLoadingMoreSearchResults()) return;

    if (this.searchQuery.value) {
      this.loadMoreSearchResults();
    }
  }

  setupSearch() {
    this.searchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.searchPage = 0;
        this.discoveryService
          .getSearchedData(searchValue!.toLowerCase(), this.searchPage, this.searchPageSize)
          .subscribe({
            next: (response) => {
              this.searchedUsers.set(response.discoveryUsers);
              this.searchedPosts.set(response.discoveryPosts);
              this.updateSearchReadtime();
              this.hasMoreSearchResults.set(
                response.discoveryPosts.length >= this.searchPageSize ||
                  response.discoveryUsers.length >= this.searchPageSize
              );
            },
            error: (error) => this.errorService.handleError(error),
          });
      });
  }

  updateSearchReadtime() {
    this.searchedPosts().map((p) => (p.readTime = this.getReadTime(p.content)));
  }

  updateDiscoveryReadtime() {
    this.suggestedPosts().map((p) => (p.readTime = this.getReadTime(p.content)));
  }

  loadData() {
    this.discoveryService.getDiscoveryData().subscribe({
      next: (response) => {
        this.suggestedPosts.set(response.discoveryPosts);
        this.suggestedUsers.set(response.discoveryUsers);
        this.updateDiscoveryReadtime();
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  loadMoreSearchResults() {
    if (this.isLoadingMoreSearchResults() || !this.hasMoreSearchResults()) return;

    this.isLoadingMoreSearchResults.set(true);
    this.searchPage++;

    this.discoveryService
      .getSearchedData(this.searchQuery.value!.toLowerCase(), this.searchPage, this.searchPageSize)
      .subscribe({
        next: (response) => {
          if (
            response.discoveryPosts.length < this.searchPageSize &&
            response.discoveryUsers.length < this.searchPageSize
          ) {
            this.hasMoreSearchResults.set(false);
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
          this.isLoadingMoreSearchResults.set(false);
          this.updateSearchReadtime();
        },
        error: (error) => {
          this.errorService.handleError(error);
          this.isLoadingMoreSearchResults.set(false);
          this.searchPage--;
        },
      });
  }

  getReadTime(htmlString: string): number {
    return calculReadTime(htmlString);
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

