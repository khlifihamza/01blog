import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { FeedPost, ProfilePost } from '../models/post.model';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-post-card',
  imports: [MatIconModule, MatCardModule],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css'],
})
export class PostCardComponent {
  @Input() post!: FeedPost | ProfilePost;
  @Input() username!: string;
  @Input() avatar!: string | null;
  @Input() readTime!: number;

  @Output() open = new EventEmitter<any>();

  onOpenPost() {
    this.open.emit(this.post);
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

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
