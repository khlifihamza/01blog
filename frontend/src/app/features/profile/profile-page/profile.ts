import { Component, signal } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportDialogComponent } from '../../report/report-dialog/report-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FollowComponent } from '../../../shared/follow/follow';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { calculReadTime } from '../../../shared/utils/readtime';

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
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent{
  profile = signal<UserProfile | null>(null);
  isFollowing = signal(false);
  userPosts = signal<ProfilePost[]>([]);
  username = '';

  constructor(
    private router: Router,
    private postService: PostService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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
        this.isFollowing.set(profile.isFollowing);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadUserPosts() {
    this.postService.getPosts(this.username).subscribe({
      next: (posts) => {
        this.userPosts.set(posts);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    this.router.navigate(["/edit-profile"]);
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
}
