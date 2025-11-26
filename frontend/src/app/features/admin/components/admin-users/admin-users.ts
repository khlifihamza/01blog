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
import { User } from '../../../../shared/models/user.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserRole } from '../../../../shared/models/enums.model';

@Component({
  selector: 'app-admin-users',
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
  templateUrl: './admin-users.html',
  styleUrls: ['../../admin.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersComponent {
  @Input() users: User[] = [];
  @Input() hasMoreUsers = false;
  @Input() isLoadingMoreUsers = false;
  @Input() isMobile = false;

  @Output() loadMore = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() viewUser = new EventEmitter<string>();
  @Output() banUser = new EventEmitter<string>();
  @Output() unbanUser = new EventEmitter<string>();
  @Output() deleteUser = new EventEmitter<User>();

  userColumns = ['user', 'role', 'posts', 'joinDate', 'status', 'actions'];
  userSearchQuery = new FormControl('');
  UserRole = UserRole;

  constructor() {
    this.userSearchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search.emit(value || '');
      });
  }
}
