import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-profile',
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
    TimeAgoPipe,
    InfiniteScrollDirective
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css', '../../errors/not-found/not-found.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  isFollowing = signal(false);
  userPosts = signal<ProfilePost[]>([]);
  username = '';
  userNotFound = signal(false);

  hasMore = signal(false);
  isLoadingMore = signal(false);

  constructor(
    private router: Router,
    private postService: PostService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private errorService: ErrorService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.params.subscribe(() => {
      let username = this.route.snapshot.paramMap.get('username');
      if (username != null) {
        this.username = username;
      }
      this.loadProfile();
    });
  }

  onScroll() {
    if (this.isLoadingMore() || !this.hasMore()) return;
    this.loadMorePosts();
  }

  loadProfile() {
    this.profileService.getProfileDetails(this.username).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isFollowing.set(profile.isFollowing);
        this.loadUserPosts();
      },
      error: (error) => {
        if (error.status === 404) {
          this.userNotFound.set(true);
        }
      },
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

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

