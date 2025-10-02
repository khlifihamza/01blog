import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiscoveryPost } from '../../shared/models/post.model';
import { DiscoveryUser } from '../../shared/models/user.model';
import { DiscoveryService } from '../../core/services/discovery.service';
import { FollowComponent } from '../../shared/follow/follow';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { calculReadTime } from '../../shared/utils/readtime';

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

  constructor(
    private router: Router,
    private discoveryService: DiscoveryService,
    private snackBar: MatSnackBar,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  setupSearch() {
    this.searchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.discoveryService.getSearchedData(searchValue!.toLowerCase()).subscribe({
          next: (response) => {
            this.searchedUsers.set(response.discoveryUsers);
            this.searchedPosts.set(response.discoveryPosts);
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      });
  }

  loadData() {
    this.discoveryService.getDiscoveryData().subscribe({
      next: (response) => {
        this.suggestedPosts.set(response.discoveryPosts);
        this.suggestedUsers.set(response.discoveryUsers);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  onFilterChange() {}

  getReadTime(htmlString: string): number {
    return calculReadTime(htmlString);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  openPost(post: DiscoveryPost) {
    this.router.navigate(['/post', post.id]);
  }

  viewProfile(user: DiscoveryUser) {
    this.router.navigate(['/profile', user.username]);
  }

  onFollowChange(user: DiscoveryUser, isFollowing: boolean) {
    user.isFollowing = !user.isFollowing;
    user.followers += user.isFollowing ? 1 : -1;
  }
}
