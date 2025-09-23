import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Report } from '../../shared/models/report.model';
import { User } from '../../shared/models/user.model';
import { Post } from '../../shared/models/post.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  // Stats
  totalUsers = 1247;
  totalPosts = 3456;
  pendingReports = 12;
  totalEngagement = 15678;
  monthlyGrowth = 156;
  weeklyGrowth = 34;

  // Table columns
  reportColumns = ['post/user', 'reason', 'reportedBy', 'status', 'date', 'actions'];
  userColumns = ['user', 'role', 'posts', 'joinDate', 'status', 'actions'];
  postColumns = ['title', 'author', 'engagement', 'date', 'status', 'actions'];

  // Data
  reports: Report[] = [];
  users: User[] = [];
  posts: Post[] = [];
  
  // Filtered data
  filteredReports: Report[] = [];
  filteredUsers: User[] = [];
  filteredPosts: Post[] = [];

  // Filters
  selectedReportStatus = '';
  selectedPostCategory = '';
  userSearchQuery = '';

  // Insights
  popularCategories = [
    { name: 'Coding Journey', count: 145 },
    { name: 'Projects', count: 98 },
    { name: 'Learning Tips', count: 76 },
    { name: 'Career Advice', count: 54 }
  ];

  topContributors = [
    { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', posts: 23 },
    { name: 'Marcus Johnson', avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', posts: 18 },
    { name: 'Emma Rodriguez', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', posts: 15 }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockData();
    this.filterReports();
    this.filterUsers();
    this.filterPosts();
  }

  loadMockData() {
    // Mock reports
    this.reports = [
      {
        id: "1",
        postId: "123",
        postTitle: 'My Journey from Zero to Full-Stack Developer',
        ReportedUser: null,
        reportedBy: 'Anonymous User',
        reason: 'spam',
        details: 'This post contains promotional content',
        status: 'pending',
        createdAt: "'2024-01-15'"
      },
      {
        id: "2",
        postId: "124",
        postTitle: 'Building My First React App',
        ReportedUser: null,
        reportedBy: 'Anonymous User',
        reason: 'inappropriate',
        details: 'Contains inappropriate language',
        status: 'resolved',
        createdAt: "'2024-01-14'"
      }
    ];

    // Mock users
    this.users = [
      {
        id: "1",
        username: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        role: 'USER',
        joinDate: "2023-06-15",
        postsCount: 23,
        status: 'active'
      },
      {
        id: "2",
        username: 'Marcus Johnson',
        email: 'marcus@example.com',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        role: 'USER',
        joinDate: '2023-08-20',
        postsCount: 18,
        status: 'active'
      }
    ];

    // Mock posts
    this.posts = [
      {
        id: "1",
        title: 'My Journey from Zero to Full-Stack Developer in 6 Months',
        author: 'Sarah Chen',
        publishedDate: '2024-01-15',
        likes: 234,
        comments: 45,
        status: 'published'
      },
      {
        id: "2",
        title: 'Building My First React App: Lessons Learned',
        author: 'Marcus Johnson',
        publishedDate: '2024-01-12',
        likes: 189,
        comments: 32,
        status: 'published'
      }
    ];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  // Filter methods
  filterReports() {
    this.filteredReports = this.selectedReportStatus 
      ? this.reports.filter(r => r.status === this.selectedReportStatus)
      : this.reports;
  }

  filterUsers() {
    this.filteredUsers = this.userSearchQuery
      ? this.users.filter(u => 
          u.username.toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(this.userSearchQuery.toLowerCase())
        )
      : this.users;
  }

  filterPosts() {
    // this.filteredPosts = this.selectedPostCategory
    //   ? this.posts.filter(p => p.category === this.selectedPostCategory)
    //   : this.posts;
  }

  // Action methods
  viewReport(report: Report) {
    console.log('View report:', report);
  }

  resolveReport(report: Report) {
    report.status = 'resolved';
    this.pendingReports--;
  }

  viewUser(user: User) {
    this.router.navigate(['/profile', user.id]);
  }

  suspendUser(user: User) {
    // user.status = 'suspended';
  }

  deleteUser(user: User) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.filterUsers();
    }
  }

  viewPost(post: Post) {
    this.router.navigate(['/post', post.id]);
  }

  editPost(post: Post) {
    this.router.navigate(['/edit-post', post.id]);
  }

  hidePost(postId: number) {
    // const post = this.posts.find(p => p.id === postId);
    // if (post) {
    //   post.status = 'hidden';
    // }
  }

  deletePost(post: Post) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.posts = this.posts.filter(p => p.id !== post.id);
      this.filterPosts();
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}