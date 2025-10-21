import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilePost } from '../../../shared/models/post.model';
import { UserProfile } from '../../../shared/models/user.model';
import { PostService } from '../../../core/services/post.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ReportDialogComponent } from '../../report/report-dialog/report-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FollowComponent } from '../../../shared/follow/follow';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { calculReadTime } from '../../../shared/utils/readtime';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ErrorService } from '../../../core/services/error.service';
import { PostCardComponent } from '../../../shared/post-card/post-card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    FollowComponent,
    NavbarComponent,
    MatProgressSpinner,
    PostCardComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  profile = signal<UserProfile | null>(null);
  isFollowing = signal(false);
  userPosts = signal<ProfilePost[]>([]);
  username = '';

  hasMore = signal(false);
  isLoadingMore = signal(false);

  constructor(
    private router: Router,
    private postService: PostService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private errorService: ErrorService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe(() => {
      let username = this.route.snapshot.paramMap.get('username');
      if (username != null) {
        this.username = username;
      }
      this.loadProfile();
      this.loadUserPosts();
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isLoadingMore() || !this.hasMore()) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold) {
      this.loadMorePosts();
    }
  }

  loadProfile() {
    this.profileService.getProfileDetails(this.username).subscribe({
      next: (profile) => {
        profile.joinDate = this.formatDate(profile.joinDate);
        this.profile.set(profile);
        this.isFollowing.set(profile.isFollowing);
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  loadUserPosts() {
    this.postService.getProfilePosts(this.username, '').subscribe({
      next: (posts) => {
        this.userPosts.set(posts);
        this.hasMore.set(posts.length >= 10);
        this.updateReadtime();
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  loadMorePosts() {
    if (this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);

    const lastPost = this.userPosts()[this.userPosts().length - 1];
    if (!lastPost) return;

    this.postService.getProfilePosts(this.username, lastPost.createdAt).subscribe({
      next: (newPosts) => {
        this.userPosts.update((currentPosts) => [...currentPosts, ...newPosts]);
        this.isLoadingMore.set(false);
        this.updateReadtime();
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.isLoadingMore.set(false);
      },
    });
  }

  updateReadtime() {
    this.userPosts().map((p) => (p.readTime = this.getReadTime(p.content)));
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

  getReadTime(htmlString: string): number {
    return calculReadTime(htmlString);
  }

  onFollowChange(isFollowing: boolean) {
    this.isFollowing.set(isFollowing);
    this.profile()!.followers += this.isFollowing() ? 1 : -1;
  }

  reportPost() {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '505px',
      data: { postId: null, postTitle: null, username: this.profile()?.username },
    });
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
  }

  openPost(post: ProfilePost) {
    this.router.navigate(['/post', post.id]);
  }
}
