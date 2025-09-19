import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Comment, CreateCommentPayload, DetailPost } from '../../../shared/models/post.model';
import { PostService } from '../../../core/services/post.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FollowService } from '../../../core/services/follow.service';
import { LikeService } from '../../../core/services/like.service';
import { CommentService } from '../../../core/services/comment.service';
import { FormsModule } from '@angular/forms';
// import { ReportDialogComponent } from './report-dialog.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetailComponent implements OnInit {
  post = signal<DetailPost | null>(null);
  isFollowing = signal(false);
  isLiked = signal(false);
  isAuthor = true;
  safeContent: SafeHtml | null = null;
  Comments = signal<Comment[] | null>(null);
  commentText: string = '';

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private followService: FollowService,
    private likeService: LikeService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    let postId = this.route.snapshot.paramMap.get('id');
    if (postId != null) {
      this.loadPost(postId);
      this.loadComments(postId);
    }
  }

  loadPost(postId: string) {
    this.postService.getPost(postId).subscribe({
      next: (post) => {
        this.isAuthor = post.isAuthor;
        this.isFollowing.set(post.author.isFollowed);
        this.isLiked.set(post.isLiked);
        this.post.set(post);
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(
          this.formatContent(this.post()!.content)
        );
      },
      error: (error) => console.log(error),
    });
  }

  loadComments(postId: string) {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.Comments.set(comments);
      },
      error: (error) => console.log(error),
    });
  }

  addComment() {
    const createCommentPayload: CreateCommentPayload = {
      content: this.commentText,
      postId: this.post()!.id,
    };
    this.commentService.addComment(createCommentPayload).subscribe({
      next: (response) =>
        this.snackBar.open(response.message.toString(), 'Close', { duration: 5000 }),
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
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
    if (this.isLiked()) {
      this.likeService.dislike(this.post()!.id).subscribe({
        next: () => {
          this.isLiked.set(!this.isLiked());
          this.post()!.likes += this.isLiked() ? 1 : -1;
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    } else {
      this.likeService.like(this.post()!.id).subscribe({
        next: () => {
          this.isLiked.set(!this.isLiked());
          this.post()!.likes += this.isLiked() ? 1 : -1;
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    }
  }

  toggleBookmark() {
    if (this.post()) {
      this.post()!.isBookmarked = !this.post()!.isBookmarked;
    }
  }

  followUser() {
    if (!this.isFollowing()) {
      this.followService.follow(this.post()!.author.username).subscribe({
        next: () => {
          this.isFollowing.set(!this.isFollowing());
          if (this.post()!.author) {
            this.post()!.author.followers += this.isFollowing() ? 1 : -1;
          }
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    } else {
      this.followService.unfollow(this.post()!.author.username).subscribe({
        next: () => {
          this.isFollowing.set(!this.isFollowing());
          if (this.post()!.author) {
            this.post()!.author.followers += this.isFollowing() ? 1 : -1;
          }
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    }
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
    this.router.navigate(['/edit-post', this.post()!.id]);
  }

  viewProfile() {
    this.router.navigate(['/profile', this.post()!.author.username]);
  }
}
