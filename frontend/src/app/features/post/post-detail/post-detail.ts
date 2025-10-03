import { Component, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
import { LikeService } from '../../../core/services/like.service';
import { CommentService } from '../../../core/services/comment.service';
import { FormsModule } from '@angular/forms';
import { ReportDialogComponent } from '../../report/report-dialog/report-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog.model';
import { FollowComponent } from '../../../shared/follow/follow';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { calculReadTime } from '../../../shared/utils/readtime';

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
    FollowComponent,
    NavbarComponent,
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetailComponent {
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
    private likeService: LikeService,
    private commentService: CommentService,
    private dialog: MatDialog,
    private location: Location
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
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadComments(postId: string) {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.Comments.set(comments);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  addComment() {
    const createCommentPayload: CreateCommentPayload = {
      content: this.commentText,
      postId: this.post()!.id,
    };
    this.commentService.addComment(createCommentPayload).subscribe({
      next: (comment) => {
        this.Comments.update((comments) => {
          return [comment, ...comments!];
        });
        this.commentText = '';
        this.post()!.comments += 1;
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  deleteComment(commentId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.commentService.deleteComment(commentId).subscribe({
          next: (response) => {
            const index = this.Comments()!.findIndex((n) => n.id === commentId);
            this.Comments()!.splice(index, 1);
            this.snackBar.open(response.message.toString(), 'Close', { duration: 5000 });
          },
          error: (error) => {
            this.snackBar.open(error.error, 'Close', { duration: 5000 });
          },
        });
      }
    });
  }

  getReadTime(htmlString: string): number {
    return calculReadTime(htmlString);
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
    return content.replace(
      /(<(img|video)\b[^>]*>(?:<\/video>)?)\s*<button[\s\S]*?<\/button>/g,
      '$1'
    );
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

  onFollowChange(isFollowing: boolean) {
    this.isFollowing.set(isFollowing);
    this.post()!.author.followers += this.isFollowing() ? 1 : -1;
  }

  deletePost() {
    let postId = this.route.snapshot.paramMap.get('id');
    if (postId != null) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: <ConfirmDialogData>{
          title: 'Delete Post',
          message: 'Are you sure you want to delete this Post?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.postService.deletePost(postId).subscribe({
            next: (response) => {
              this.snackBar.open(response.message.toString(), 'Close', { duration: 5000 });
              this.goBack();
            },
            error: (error) => {
              this.snackBar.open(error.error, 'Close', { duration: 5000 });
            },
          });
        }
      });
    }
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href);
    // Show snackbar or toast
  }

  reportPost() {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '505px',
      data: { postId: this.post()?.id, postTitle: this.post()?.title, username: null },
    });
  }

  scrollToComments() {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  }

  goBack() {
    this.location.back();
  }

  editPost() {
    this.router.navigate(['/edit-post', this.post()!.id]);
  }

  viewProfile() {
    this.router.navigate(['/profile', this.post()!.author.username]);
  }
}
