import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PostService } from "../../core/services/post.service";
import { CreatePostComponent } from "../post/createpost/create-post.component";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  // posts: Post[] = [];
  loading = false;
  hasMorePosts = true;
  currentPage = 1;
  pageSize = 5;

  trendingTopics = [
    { name: "angular", count: 156 },
    { name: "typescript", count: 89 },
    { name: "learning", count: 234 },
    { name: "webdev", count: 167 },
    { name: "frontend", count: 145 },
  ];

  suggestedUsers = [
    {
      id: "3",
      username: "sarah_wilson",
      firstName: "Sarah",
      lastName: "Wilson",
      avatar:
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=150",
    },
    {
      id: "4",
      username: "mike_chen",
      firstName: "Mike",
      lastName: "Chen",
      avatar:
        "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=150",
    },
  ];

  constructor(
    private postService: PostService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // this.loadPosts();
  }

  // loadPosts(): void {
  //   this.loading = true;
  //   this.postService.getAllPosts().subscribe({
  //     next: (posts) => {
  //       this.posts = posts.slice(0, this.pageSize);
  //       this.loading = false;
  //       this.hasMorePosts = posts.length > this.pageSize;
  //       this.hasMorePosts = posts.length > this.pageSize;
  //     },
  //     error: (error) => {
  //       this.loading = false;
  //       this.snackBar.open("Failed to load posts", "Close", { duration: 3000 });
  //     },
  //   });
  // }

  // loadMorePosts(): void {
  //   if (this.loading || !this.hasMorePosts) return;

  //   this.loading = true;
  //   this.currentPage++;

  //   // Simulate API call with delay
  //   this.postService.getAllPosts().subscribe({
  //     next: (allPosts) => {
  //       const startIndex = (this.currentPage - 1) * this.pageSize;
  //       const endIndex = startIndex + this.pageSize;
  //       const newPosts = allPosts.slice(startIndex, endIndex);

  //       if (newPosts.length > 0) {
  //         this.posts = [...this.posts, ...newPosts];
  //       }

  //       this.hasMorePosts = endIndex < allPosts.length;
  //       this.loading = false;

  //       if (!this.hasMorePosts) {
  //         this.snackBar.open("You're all caught up!", "Close", {
  //           duration: 2000,
  //         });
  //       }
  //     },
  //     error: (error) => {
  //       this.loading = false;
  //       this.currentPage--; // Revert page increment on error
  //       this.snackBar.open("Failed to load more posts", "Close", {
  //         duration: 3000,
  //       });
  //     },
  //   });
  // }

  openCreatePost(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: "1000px",
      maxWidth: "90vw",
      data: {},
    });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     // Reset and reload posts after creation
    //     this.currentPage = 1;
    //     this.hasMorePosts = true;
    //     this.loadPosts();
    //     this.currentPage = 1;
    //     this.hasMorePosts = true;
    //     this.loadPosts();
    //   }
    // });
  }
}
