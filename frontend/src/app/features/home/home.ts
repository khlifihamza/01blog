import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedPost } from '../../shared/models/post.model';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';

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
    MatMenuModule,
    MatLabel,
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  searchQuery = '';
  isLoading = false;
  notificationCount = 3;
  isAdmin = true;
  allPosts = signal<FeedPost[]>([]);
  filteredPosts = signal<FeedPost[]>([]);

  constructor(
    private router: Router,
    private authService: AuthService,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadFeedPosts();
  }

  loadFeedPosts() {
    this.postService.getFeedPosts().subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.filterPosts();
      },
      error: (error) => console.log(error),
    });
  }

  onSearch() {
    this.filterPosts();
  }

  filterPosts() {
    let filtered = [...this.allPosts()];
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.author.username.toLowerCase().includes(query)
      );
    }

    this.filteredPosts.set(filtered);
  }

  formatDate(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  openPost(post: FeedPost) {
    this.router.navigate(['/post', post.id]);
  }

  writeStory() {
    this.router.navigate(['/post/create']);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  viewProfile() {
    this.router.navigate(['/profile']);
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  openAdminDashboard() {
    this.router.navigate(['/admin']);
  }
}
