import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BlogPost } from '../../../shared/models/post.model';
import { PostService } from '../../../core/services/post.service';
// import { ReportDialogComponent } from './report-dialog.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent implements OnInit {
  post: BlogPost | null = null;
  isFollowing = false;
  isAuthor = true; // Mock - check if current user is the author
  mockComments = [
    {
      author: 'Alex Chen',
      avatar:
        'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      date: '2 days ago',
      text: 'Great insights! I had a similar experience when I started my coding journey. The key is persistence.',
      likes: 12,
    },
    {
      author: 'Maria Garcia',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      date: '1 day ago',
      text: 'Thanks for sharing this! Really helpful for someone just starting out like me.',
      likes: 8,
    },
  ];

  constructor(private route: ActivatedRoute, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadPost();
  }

  loadPost() {
    // Mock post data - in real app, fetch from API using route params
    this.post = {
      id: "1",
      title: 'My Journey from Zero to Full-Stack Developer in 6 Months',
      excerpt:
        "How I transformed from a complete beginner to landing my first developer job. Here's everything I learned along the way, including the challenges I faced, the resources that helped me most, and the mindset shifts that made all the difference.",
      content: `
        <p>Six months ago, I had never written a single line of code. Today, I'm working as a full-stack developer at a tech startup. This is the story of my journey and everything I learned along the way.</p>
        
        <h2>The Beginning</h2>
        <p>Like many people, I was stuck in a job that didn't fulfill me. I had always been curious about technology, but I never thought I could actually become a developer. The turning point came when I discovered 01Student and realized that with the right approach, anyone could learn to code.</p>
        
        <h2>The Learning Process</h2>
        <p>The first month was the hardest. Everything felt overwhelming - HTML, CSS, JavaScript, frameworks, databases. I made every mistake you can imagine. But slowly, things started to click.</p>
        
        <p>Here are the key strategies that worked for me:</p>
        <ul>
          <li>Building projects from day one, not just following tutorials</li>
          <li>Joining the 01Student community and learning with peers</li>
          <li>Focusing on fundamentals before jumping to frameworks</li>
          <li>Practicing coding challenges daily</li>
          <li>Contributing to open source projects</li>
        </ul>
        
        <h2>The Breakthrough</h2>
        <p>Month 4 was when everything changed. I built my first full-stack application - a task management app with React and Node.js. Seeing it work end-to-end was incredible.</p>
        
        <h2>Landing the Job</h2>
        <p>The job search was intense, but my portfolio spoke for itself. I had 5 solid projects, contributions to open source, and most importantly, I could explain my code and thought process clearly.</p>
        
        <p>To anyone starting this journey: it's possible. It's hard, but it's possible. The key is consistency, community, and never giving up.</p>
      `,
      author: {
        username: 'Sarah Chen',
        avatar:
          'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        bio: 'Full-stack developer passionate about helping others learn to code. Currently working at a fintech startup building the future of payments.',
        followers: 1250,
        following: 340,
      },
      publishedDate: new Date('2024-01-15'),
      readTime: 8,
      likes: 234,
      comments: 45,
      thumbnail:
        'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      isLiked: false,
      isBookmarked: false,
    };
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

  formatContent(content: string): string {
    return content;
  }

  toggleLike() {
    if (this.post) {
      this.post.isLiked = !this.post.isLiked;
      this.post.likes += this.post.isLiked ? 1 : -1;
    }
  }

  toggleBookmark() {
    if (this.post) {
      this.post.isBookmarked = !this.post.isBookmarked;
    }
  }

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
  }

  sharePost() {
    if (navigator.share) {
      navigator.share({
        title: this.post?.title,
        url: window.location.href,
      });
    } else {
      this.copyLink();
    }
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href);
    // Show snackbar or toast
  }

  // reportPost() {
  //   const dialogRef = this.dialog.open(ReportDialogComponent, {
  //     width: '500px',
  //     data: { postId: this.post?.id, postTitle: this.post?.title },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       console.log('Post reported:', result);
  //     }
  //   });
  // }

  scrollToComments() {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  }

  goBack() {
    this.router.navigate(['/feed']);
  }

  editPost() {
    this.router.navigate(['/edit-post', this.post?.id]);
  }
}
