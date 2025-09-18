import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  profile: UserProfile | null = null;
  isFollowing = false;
  userPosts: ProfilePost[] = [];
  username = '';

  constructor(
    private router: Router,
    private postService: PostService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private profileService: ProfileService
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
        this.profile = profile;
        this.cd.detectChanges();
      },
      error: (error) => console.log(error),
    });
  }

  loadUserPosts() {
    this.postService.getPosts(this.username).subscribe({
      next: (posts) => {
        this.userPosts = posts;
        this.cd.detectChanges();
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
    this.isFollowing = !this.isFollowing;
    if (this.profile) {
      this.profile.followers += this.isFollowing ? 1 : -1;
    }
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
