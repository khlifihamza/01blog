import { Component, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaItem } from '../../../shared/models/post.model';
import { MatMenuModule } from '@angular/material/menu';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { PostService } from '../../../core/services/post.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { ErrorService } from '../../../core/services/error.service';
import { PostEditorBase } from '../post-editor/post-editor.base';
import { PostType } from '../../../shared/models/enums.model';

@Component({
  selector: 'app-edit-post',
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
  templateUrl: './edit-post.html',
  styleUrls: ['../post.css', '../../errors/not-found/not-found.css'],
})
export class EditPostComponent extends PostEditorBase {
  postForm: FormGroup;
  existingThumbnail: boolean = true;
  oldThumbnail: string | null = null;
  oldFileNames: string[] = [];
  tags: string[] = [];
  postId: string = '';
  safeContent: SafeHtml | null = null;
  postNotFound = signal(false);

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    errorService: ErrorService,
    private location: Location,
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
        validators: [this.thumbnailValidator.bind(this)],
      }),
    });
  }

  ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.postId = postId;
      this.loadPost();
    }
  }

  loadPost() {
    this.postService.getPostToEdit(this.postId).subscribe({
      next: (post) => {
        this.currentContent = post.content;
        this.oldThumbnail = post.thumbnail;
        this.oldFileNames = post.fileNames;
        this.thumbnailPreview.set(post.thumbnail);
        this.existingThumbnail = !!post.thumbnail;
        this.postForm.patchValue({
          title: post.title,
          content: this.sanitizer.bypassSecurityTrustHtml(post.content),
        });
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content);

        setTimeout(() => {
          this.setupExistingMediaDeleteButtons();
          this.convertExistingMediaToMediaItems();
        }, 0);
      },
      error: (error) => {
        if (error.status === 404 || error.status === 422) {
          this.postNotFound.set(true);
        }
      },
    });
  }

  override onThumbnailSelect(event: Event) {
    super.onThumbnailSelect(event);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.existingThumbnail = true;
    }
  }

  override removeThumbnail(event: Event) {
    super.removeThumbnail(event);
    this.existingThumbnail = false;
  }

  private convertExistingMediaToMediaItems() {
    const mediaElements = this.editorDiv.nativeElement.querySelectorAll('.media-element');
    const mediaItems: MediaItem[] = [];

    mediaElements.forEach((element, index) => {
      let mediaId = element.getAttribute('data-media-id');
      if (!mediaId) {
        mediaId = this.generateMediaId();
        element.setAttribute('data-media-id', mediaId);
      }

      const imgElement = element.querySelector('img');
      const videoElement = element.querySelector('video');
      const fileName = this.oldFileNames[index];

      if (!fileName) return;

      const dummyFile = new File([''], fileName, {
        type: imgElement ? 'image/jpeg' : 'video/mp4',
      });

      Object.defineProperty(dummyFile, 'size', { value: 0 });

      mediaItems.push({
        id: mediaId,
        file: dummyFile,
        preview: (imgElement?.src || videoElement?.src)!,
        type: imgElement ? PostType.IMAGE : PostType.VIDEO,
        position: index,
      });
    });

    this.mediaFiles.set(mediaItems);
  }

  private getOrderedMediaFiles(): { newFiles: File[]; allFileNames: string[] } {
    const sortedMediaItems = this.mediaFiles().sort((a, b) => a.position - b.position);
    const newFiles: File[] = [];
    const allFileNames: string[] = [];

    sortedMediaItems.forEach((item) => {
      if (item.file.size > 0) {
        newFiles.push(item.file);
        allFileNames.push(`new_file_${newFiles.length - 1}`);
      } else {
        allFileNames.push(item.file.name);
      }
    });

    return { newFiles, allFileNames };
  }

  updatePost() {
    if (this.postForm.valid) {
      this.isLoading.set(true);
      const content = this.editorDiv.nativeElement.innerHTML;

      const formData = new FormData();
      formData.append('title', this.postForm.value.title.trim());
      formData.append('content', content);

      if (this.thumbnailFile) {
        formData.append('thumbnail', this.thumbnailFile);
      } else if (this.oldThumbnail) {
        formData.append('oldThumbnail', this.oldThumbnail);
      }

      const { newFiles, allFileNames } = this.getOrderedMediaFiles();
      newFiles.forEach((file) => formData.append('files', file));
      allFileNames.forEach((name) => formData.append('oldFileNames', name));

      this.postService.updatePost(formData, this.postId).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.errorService.showSuccess('Post updated successfully');
          this.goBack();
        },
        error: (error) => {
          this.errorService.handleError(error);
          this.isLoading.set(false);
        },
      });
    }
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  private setupExistingMediaDeleteButtons() {
    const deleteButtons = this.editorDiv.nativeElement.querySelectorAll(
      '.media-element .delete-btn'
    );
    deleteButtons.forEach((element: Element) => {
      const button = element as HTMLButtonElement;
      button.onclick = null;
      button.onclick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const mediaDiv = button.closest('.media-element') as HTMLElement;
        if (mediaDiv) {
          const mediaId = mediaDiv.getAttribute('data-media-id');
          mediaDiv.remove();
          if (mediaId) {
            this.deleteMedia(mediaId);
          }
          this.onContentChange({ target: this.editorDiv.nativeElement } as any);
        }
      };
    });
  }

  isContentValid(): boolean {
    return (
      this.postForm.value.title.trim().length >= 5 &&
      this.thumbnailPreview() != null &&
      this.currentContent.length >= 100 &&
      this.currentContent.length <= 50000
    );
  }

  thumbnailValidator = (control: AbstractControl): ValidationErrors | null => {
    return this.thumbnailPreview() == null ? null : { required: true };
  };
}
