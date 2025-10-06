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
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  profile = signal<UserProfile | null>(null);
  isFollowing = signal(false);
  userPosts = signal<ProfilePost[]>([]);
  username = '';

  page = 0;
  pageSize = 10;
  hasMore = true;
  isLoadingMore = false;

  constructor(
    private router: Router,
    private postService: PostService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private errorService: ErrorService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    let username = this.route.snapshot.paramMap.get('username');
    if (username != null) {
      this.username = username;
    }
    this.loadProfile();
    this.loadUserPosts();
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

  loadProfile() {
    this.profileService.getProfileDetails(this.username).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isFollowing.set(profile.isFollowing);
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  loadUserPosts() {
    this.postService.getProfilePosts(this.username, this.page, this.pageSize).subscribe({
      next: (posts) => {
        this.userPosts.set(posts);
        this.hasMore = posts.length >= this.pageSize;
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  loadMorePosts() {
    if (this.isLoadingMore || !this.hasMore) return;

    this.isLoadingMore = true;
    this.page++;

    this.postService.getProfilePosts(this.username, this.page, this.pageSize).subscribe({
      next: (posts) => {
        if (posts.length < this.pageSize) {
          this.hasMore = false;
        }
        if (posts.length > 0) {
          this.userPosts.update((currentPosts) => [...currentPosts, ...posts]);
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
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
