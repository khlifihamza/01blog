import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PostService } from '../../../core/services/post.service';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { ErrorService } from '../../../core/services/error.service';
import { PostEditorBase } from '../post-editor/post-editor.base';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DndUploadDirective,
    MatMenuModule,
    MatToolbarModule,
    NavbarComponent,
  ],
  templateUrl: './create-post.html',
  styleUrls: ['../post.css'],
})
export class CreatePostComponent extends PostEditorBase {
  postForm: FormGroup;
  contentPlaceholder =
    'Share your journey, insights, and experiences with the 01Student community...';

  constructor(
    private postService: PostService,
    errorService: ErrorService,
    private router: Router
  ) {
    super(errorService);
    this.postForm = new FormGroup({
      title: new FormControl('', {
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(200)],
      }),
      content: new FormControl('', {
        validators: [Validators.required, Validators.minLength(100), Validators.maxLength(50000)],
      }),
      thumbnail: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  override onPaste(event: ClipboardEvent): void {
    this.contentPlaceholder = '';
    super.onPaste(event);
  }

  override handleImageUpload(event: Event) {
    this.contentPlaceholder = '';
    super.handleImageUpload(event);
  }

  override handleVideoUpload(event: Event) {
    this.contentPlaceholder = '';
    super.handleVideoUpload(event);
  }

  private getOrderedMediaFiles(): File[] {
    return this.mediaFiles()
      .sort((a, b) => a.position - b.position)
      .map((item) => item.file);
  }

  isContentValid(): boolean {
    return (
      this.postForm.value.title.trim().length >= 5 &&
      this.thumbnailFile != null &&
      this.currentContent.length >= 100 &&
      this.currentContent.length <= 50000
    );
  }

  publishPost() {
    if (this.isContentValid()) {
      this.isLoading.set(true);
      let content = this.editorDiv.nativeElement.innerHTML;

      const formData = new FormData();
      formData.append('title', this.postForm.value.title.trim());
      formData.append('content', content);
      if (this.thumbnailFile) formData.append('thumbnail', this.thumbnailFile);

      const orderedFiles = this.getOrderedMediaFiles();
      orderedFiles.forEach((file) => formData.append('files', file));

      this.postService.createPost(formData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.errorService.showSuccess('Blog created successfully');
          this.router.navigate(['/post', response.message])
        },
        error: (error) => {
          this.errorService.handleError(error);
          this.isLoading.set(false);
        },
      });
    }
  }
}
