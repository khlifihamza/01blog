import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FeedPost, ProfilePost } from '../models/post.model';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

@Component({
  selector: 'app-post-card',
  imports: [MatIconModule, MatCardModule, TimeAgoPipe],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
}

