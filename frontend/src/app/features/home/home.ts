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
import { PostCardComponent } from '../../shared/post-card/post-card';

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
    PostCardComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  isLoading = signal(false);
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
    this.isLoading.set(true);
    this.postService.getFeedPosts(this.page, this.pageSize).subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.hasMore = posts.length >= this.pageSize;
        this.isLoading.set(false);
        this.updateReadtime();
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.isLoading.set(false);
      },
    });
  }

  updateReadtime() {
    this.allPosts().map((p) => (p.readTime = this.getReadTime(p.content)));
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
        this.updateReadtime();
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.isLoadingMore = false;
        this.page--;
      },
    });
  }

  openPost(post: FeedPost) {
    this.router.navigate(['/post', post.id]);
  }

  goToDiscovery() {
    this.router.navigate(['/discovery']);
  }
}
