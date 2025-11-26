import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Post } from '../../../../shared/models/post.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TimeAgoPipe,
    InfiniteScrollDirective
  ],
  templateUrl: './admin-posts.html',
  styleUrls: ['../../admin.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPostsComponent {
  @Input() posts: Post[] = [];
  @Input() hasMorePosts = false;
  @Input() isLoadingMorePosts = false;
  @Input() isMobile = false;

  @Output() loadMore = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() viewPost = new EventEmitter<string>();
  @Output() hidePost = new EventEmitter<string>();
  @Output() unhidePost = new EventEmitter<string>();
  @Output() deletePost = new EventEmitter<Post>();

  postColumns = ['title', 'author', 'engagement', 'date', 'status', 'actions'];
  postSearchQuery = new FormControl('');

  constructor() {
    this.postSearchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search.emit(value || '');
      });
  }
}
