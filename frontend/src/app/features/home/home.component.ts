import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedPost } from '../../shared/models/post.model';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatMenuModule,
    MatLabel,
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  searchQuery = '';
  selectedCategory = '';
  isLoading = false;
  notificationCount = 3;
  isAdmin = true; // Mock admin status
  allPosts: FeedPost[] = [];
  filteredPosts: FeedPost[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockData();
    this.filterPosts();
  }

  loadMockData() {
    // Mock data for demonstration
    this.allPosts = [
      {
        id: "1",
        title: 'My Journey from Zero to Full-Stack Developer in 6 Months',
        content: '',
        author: {
          username: 'Sarah Chen',
          avatar:
            'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        createdAt: new Date('2024-01-15'),
        readTime: 8,
        likes: 234,
        comments: 45,
        thumbnail:
          'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: "2",
        title: 'Building My First React App: Lessons Learned',
        content: '',
        author: {
          username: 'Marcus Johnson',
          avatar:
            'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        createdAt: new Date('2024-01-12'),
        readTime: 6,
        likes: 189,
        comments: 32,
        thumbnail:
          'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: "3",
        title: '5 Study Techniques That Actually Work for Programming',
        content: '',
        author: {
          username: 'Emma Rodriguez',
          avatar:
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        createdAt: new Date('2024-01-10'),
        readTime: 5,
        likes: 156,
        comments: 28,
        thumbnail:
          'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: "4",
        title: 'Landing My Dream Internship at a Tech Startup',
        content: '',
        author: {
          username: 'David Kim',
          avatar:
            'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        createdAt: new Date('2024-01-08'),
        readTime: 7,
        likes: 298,
        comments: 67,
        thumbnail:
          'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: "5",
        title: 'Why I Chose 01Student Over Traditional Computer Science',
        content: '',
        author: {
          username: 'Aisha Patel',
          avatar:
            'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        createdAt: new Date('2024-01-05'),
        readTime: 4,
        likes: 167,
        comments: 41,
        thumbnail:
          'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: "6",
        title: 'My First Hackathon Experience: What I Learned',
        content: '',
        author: {
          username: 'Alex Thompson',
          avatar:
            'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        createdAt: new Date('2024-01-03'),
        readTime: 6,
        likes: 203,
        comments: 35,
        thumbnail:
          'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ];
  }

  onSearch() {
    this.filterPosts();
  }

  filterPosts() {
    let filtered = [...this.allPosts];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.author.username.toLowerCase().includes(query)
      );
    }

    this.filteredPosts = filtered;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  openPost(post: FeedPost) {
    this.router.navigate(['/post', post.id]);
  }

  writeStory() {
    this.router.navigate(['/post/create']);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  viewProfile() {
    this.router.navigate(['/profile']);
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  openAdminDashboard() {
    this.router.navigate(['/admin']);
  }
}
