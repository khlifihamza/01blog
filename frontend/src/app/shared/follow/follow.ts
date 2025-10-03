import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FollowService } from '../../core/services/follow.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogData } from '../models/confirm-dialog.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-follow',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './follow.html',
  styleUrls: ['./follow.css'],
})
export class FollowComponent {
  @Input() username!: string;
  @Input() isFollowing = false;
  @Output() followChange = new EventEmitter<boolean>();

  loading = signal(false);

  constructor(
    private dialog: MatDialog,
    private followService: FollowService,
    private snackBar: MatSnackBar
  ) {}

  toggleFollow() {
    const action = this.isFollowing ? 'unfollow' : 'follow';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: this.isFollowing ? 'Unfollow User' : 'Follow User',
        message: `Are you sure you want to ${action} this user?`,
        confirmText: this.isFollowing ? 'Unfollow' : 'Follow',
        cancelText: 'Cancel',
      },
    });

    this.loading.set(true);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.followService.follow(this.username, action).subscribe({
          next: () => {
            this.isFollowing = !this.isFollowing;
            this.followChange.emit(this.isFollowing);
            this.loading.set(false);
          },
          error: (error) => {
            this.snackBar.open(error.message, 'Close', { duration: 5000 });
            this.loading.set(true);
          },
        });
      }
    });
  }
}
