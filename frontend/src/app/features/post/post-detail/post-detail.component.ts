import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DetailPost } from '../../../shared/models/post.model';
import { PostService } from '../../../core/services/post.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { ReportDialogComponent } from './report-dialog.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent implements OnInit {
  post: DetailPost | null = null;
  isFollowing = false;
  isAuthor = true;
  safeContent: SafeHtml | null = null;
  mockComments = [
    {
      author: 'Alex Chen',
      avatar:
        'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      date: '2 days ago',
      text: 'Great insights! I had a similar experience when I started my coding journey. The key is persistence.',
      likes: 12,
    },
    {
      author: 'Maria Garcia',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      date: '1 day ago',
      text: 'Thanks for sharing this! Really helpful for someone just starting out like me.',
      likes: 8,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    let postId = this.route.snapshot.paramMap.get('id');
    if (postId != null) {
      this.loadPost(postId);
    }
  }

  loadPost(postId: string) {
    this.postService.getPost(postId).subscribe({
      next: (post) => {
        this.isAuthor = post.isAuthor;
        this.post = post;
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(
          this.formatContent(this.post.content)
        );
        this.cd.detectChanges();
      },
      error: (error) => console.log(error),
    });
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

  formatContent(content: string): string {
    return content.replace(/(<[img|video][^>]*>)\s*<button[\s\S]*?<\/button>/g, '$1');
  }

  toggleLike() {
    if (this.post) {
      this.post.isLiked = !this.post.isLiked;
      this.post.likes += this.post.isLiked ? 1 : -1;
    }
  }

  toggleBookmark() {
    if (this.post) {
      this.post.isBookmarked = !this.post.isBookmarked;
    }
  }

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
  }

  deletePost() {
    let postId = this.route.snapshot.paramMap.get('id');
    if (postId != null) {
      this.postService.deletePost(postId).subscribe({
        next: (reposnse) => {
          this.snackBar.open(reposnse.message.toString(), 'Close', { duration: 5000 });
          this.goBack();
        },
        error: (error) => {
          this.snackBar.open(error.error, 'Close', { duration: 5000 });
        },
      });
    }
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href);
    // Show snackbar or toast
  }

  // reportPost() {
  //   const dialogRef = this.dialog.open(ReportDialogComponent, {
  //     width: '500px',
  //     data: { postId: this.post?.id, postTitle: this.post?.title },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       console.log('Post reported:', result);
  //     }
  //   });
  // }

  scrollToComments() {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  editPost() {
    this.router.navigate(['/edit-post', this.post?.id]);
  }
}
