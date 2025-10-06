import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FollowService } from '../../core/services/follow.service';
import { ErrorService } from '../../core/services/error.service';

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

  constructor(private followService: FollowService, private errorService: ErrorService) {}

  toggleFollow() {
    const action = this.isFollowing ? 'unfollow' : 'follow';
    this.loading.set(true);
    this.followService.follow(this.username, action).subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        this.followChange.emit(this.isFollowing);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.loading.set(true);
      },
    });
  }
}
