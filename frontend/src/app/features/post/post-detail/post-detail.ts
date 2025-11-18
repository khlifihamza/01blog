import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Comment, CreateCommentPayload, DetailPost } from '../../../shared/models/post.model';
import { PostService } from '../../../core/services/post.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LikeService } from '../../../core/services/like.service';
import { CommentService } from '../../../core/services/comment.service';
import { FormsModule } from '@angular/forms';
import { ReportDialogComponent } from '../../report/report-dialog/report-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog.model';
import { FollowComponent } from '../../../shared/follow/follow';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { calculReadTime } from '../../../shared/utils/readtime';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-post-detail',
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
    MatProgressSpinnerModule,
    FollowComponent,
    NavbarComponent,
  ],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css', '../../errors/not-found/not-found.css'],
})
export class PostDetailComponent implements OnInit {
  post = signal<DetailPost | null>(null);
  isFollowing = signal(false);
  isLiked = signal(false);
  isAuthor = signal(false);
  safeContent: SafeHtml | null = null;
  Comments = signal<Comment[]>([]);
  newCommentText: string = '';
  commentText: string = '';
  editingCommentId: string | null = null;
  readTime = signal<number>(0);
  postNotFound = signal(false);

  hasMore = signal(false);
  isLoadingMore = signal(false);

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private errorService: ErrorService,
    private likeService: LikeService,
    private commentService: CommentService,
    private dialog: MatDialog,
    private location: Location
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
        this.isAuthor.set(post.isAuthor);
        this.isFollowing.set(post.author.isFollowed);
        this.isLiked.set(post.isLiked);
        post.publishedDate = this.formatDate(post.publishedDate);
        this.post.set(post);
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(
          this.formatContent(this.post()!.content)
        );
        this.readTime.set(this.getReadTime(post.content));
        this.loadComments(postId);
      },
      error: (error) => {
        if (error.status === 404 || error.status === 422) {
          this.postNotFound.set(true);
        }
      },
    });
  }

  loadComments(postId: string) {
    if (this.postNotFound()) return;
    this.commentService.getComments(postId, '').subscribe({
      next: (comments) => {
        this.Comments.set(this.formatCommentsDate(comments));
        this.hasMore.set(comments.length === 10);
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isLoadingMore() || !this.hasMore()) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight - 200) {
      this.loadMoreComments();
    }
  }

  loadMoreComments() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId || this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);

    const lastComment = this.Comments()[this.Comments().length - 1];
    if (!lastComment) return;

    this.commentService.getComments(postId, lastComment.createAt).subscribe({
      next: (newComments) => {
        this.Comments.set([...this.Comments(), ...this.formatCommentsDate(newComments)]);
        this.hasMore.set(newComments.length === 10);
        this.isLoadingMore.set(false);
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.isLoadingMore.set(false);
      },
    });
  }

  formatCommentsDate(comments: Comment[]): Comment[] {
    return comments.map((c) => {
      return {
        ...c,
        formatedCreatedAt: this.formatDate(c.createAt),
      };
    });
  }

  editComment(commentId: string, currentContent: string) {
    this.editingCommentId = commentId;
    this.commentText = currentContent;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.commentText = '';
  }

  updateComment() {
    if (!this.editingCommentId) return;

    this.commentService.updateComment(this.editingCommentId, this.commentText).subscribe({
      next: (updatedComment) => {
        const comments = this.Comments();
        if (comments) {
          const index = comments.findIndex((c) => c.id === this.editingCommentId);
          if (index !== -1) {
            comments[index] = updatedComment;
            this.Comments.set([...comments]);
          }
        }
        this.editingCommentId = null;
        this.commentText = '';
        this.errorService.showSuccess('Comment updated successfully');
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  addComment() {
    if (!this.newCommentText.trim()) return;

    const createCommentPayload: CreateCommentPayload = {
      content: this.newCommentText,
      postId: this.post()!.id,
    };

    this.commentService.addComment(createCommentPayload).subscribe({
      next: (comment) => {
        comment.createAt = this.formatDate(comment.createAt);
        const comments = this.Comments() || [];
        this.Comments.set([comment, ...comments]);
        this.newCommentText = '';
        this.post()!.comments++;
      },
      error: (error) => this.errorService.handleError(error),
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
            const comments = this.Comments();
            if (comments) {
              const filteredComments = comments.filter((c) => c.id !== commentId);
              this.Comments.set(filteredComments);
            }
            this.post()!.comments--;
            this.errorService.showSuccess(response.message.toString());
          },
          error: (error) => {
            this.errorService.handleError(error);
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

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        error: (error) => this.errorService.handleError(error),
      });
    } else {
      this.likeService.like(this.post()!.id).subscribe({
        next: () => {
          this.isLiked.set(!this.isLiked());
          this.post()!.likes += this.isLiked() ? 1 : -1;
        },
        error: (error) => this.errorService.handleError(error),
      });
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
              this.errorService.showSuccess(response.message.toString());
              this.goBack();
            },
            error: (error) => {
              this.errorService.handleError(error);
            },
          });
        }
      });
    }
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href);
    this.errorService.showSuccess('Link copied');
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

  goHome() {
    this.router.navigate(['/']);
  }

  editPost() {
    this.router.navigate(['/edit-post', this.post()!.id]);
  }

  viewProfile(username: string) {
    this.router.navigate(['/profile', username]);
  }
}
