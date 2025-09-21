import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilePost } from '../../shared/models/post.model';
import { UserProfile } from '../../shared/models/user.model';
import { PostService } from '../../core/services/post.service';
import { ProfileService } from '../../core/services/profile.service';
import { FollowService } from '../../core/services/follow.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportDialogComponent } from '../report/report-dialog';
import { MatDialog } from '@angular/material/dialog';

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
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  isFollowing = signal(false);
  userPosts = signal<ProfilePost[]>([]);
  username = '';

  constructor(
    private router: Router,
    private postService: PostService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
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

  loadProfile() {
    this.profileService.getProfileDetails(this.username).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isFollowing.set(profile.isFollowed);
      },
      error: (error) => console.log(error),
    });
  }

  loadUserPosts() {
    this.postService.getPosts(this.username).subscribe({
      next: (posts) => {
        this.userPosts.set(posts);
      },
      error: (error) => console.log(error),
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }

  followUser() {
    if (!this.isFollowing()) {
      this.followService.follow(this.profile()!.username).subscribe({
        next: () => {
          this.isFollowing.set(!this.isFollowing());
          if (this.profile()) {
            this.profile()!.followers += this.isFollowing() ? 1 : -1;
          }
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    } else {
      this.followService.unfollow(this.profile()!.username).subscribe({
        next: () => {
          this.isFollowing.set(!this.isFollowing());
          if (this.profile()) {
            this.profile()!.followers += this.isFollowing() ? 1 : -1;
          }
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    }
  }

  reportPost() {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '505px',
      data: { postId: null, postTitle: null, username: this.profile()?.username },
    });
  }

  editProfile() {
    console.log('Edit profile');
  }

  editAvatar() {
    console.log('Edit avatar');
  }

  showFollowers() {
    console.log('Show followers');
  }

  showFollowing() {
    console.log('Show following');
  }

  openPost(post: ProfilePost) {
    this.router.navigate(['/post', post.id]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
