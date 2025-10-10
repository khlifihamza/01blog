import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedPost } from '../../shared/models/post.model';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { PostService } from '../../core/services/post.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { calculReadTime } from '../../shared/utils/readtime';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    NavbarComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  isLoading = false;
  allPosts = signal<FeedPost[]>([]);
  page = 0;
  pageSize = 10;
  hasMore = false;
  isLoadingMore = false;

  constructor(
    private router: Router,
    private postService: PostService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadFeedPosts();
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isLoadingMore || !this.hasMore) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold) {
      this.loadMorePosts();
    }
  }

  getReadTime(htmlString: string): number {
    return calculReadTime(htmlString);
  }

  loadFeedPosts() {
    this.isLoading = true;
    this.postService.getFeedPosts(this.page, this.pageSize).subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.hasMore = posts.length >= this.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.isLoading = false;
      },
    });
  }

  loadMorePosts() {
    if (this.isLoadingMore || !this.hasMore) return;

    this.isLoadingMore = true;
    this.page++;

    this.postService.getFeedPosts(this.page, this.pageSize).subscribe({
      next: (posts) => {
        if (posts.length < this.pageSize) {
          this.hasMore = false;
        }
        if (posts.length > 0) {
          this.allPosts.update((currentPosts) => [...currentPosts, ...posts]);
        }
        this.isLoadingMore = false;
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.isLoadingMore = false;
        this.page--;
      },
    });
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

  openPost(post: FeedPost) {
    this.router.navigate(['/post', post.id]);
  }
}
