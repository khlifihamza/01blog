import { Component, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from '../../../core/services/post.service';
import { CreatePostPayload, MediaItem, UploadResponse } from '../../../shared/models/post.model';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DndUploadDirective,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent {
  @ViewChild('editorDiv') editorDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  blogForm: FormGroup;
  isLoading = false;
  mediaFiles = signal<MediaItem[]>([]);
  thumbnailFile: File | null = null;
  thumbnailPreview: string | null = null;

  showAddButton = false;
  buttonPosition = { top: 28, left: -45 };
  isContentEmpty = true;
  contentPlaceholder =
    'Share your journey, insights, and experiences with the 01Student community...';
  showValidationError = false;
  private currentContent = '';
  private mediaCounter = 0;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      thumbnail: ['', [Validators.required]],
    });
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.currentContent = target.innerText || '';
    this.isContentEmpty = this.currentContent.trim().length === 0;

    this.blogForm.patchValue({ content: this.currentContent });

    this.showValidationError = this.currentContent.length > 0 && this.currentContent.length < 100;

    this.updateCursorPosition();
  }

  updateCursorPosition() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // this.showAddButton = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = this.editorDiv.nativeElement.getBoundingClientRect();

    if (rect.width === 0 && rect.height > 0) {
      this.buttonPosition = {
        top: rect.top - editorRect.top + 4,
        left: -45,
      };
      this.showAddButton = true;
    } else {
      // this.showAddButton = false;
    }
  }

  onFocus() {
    this.showAddButton = true;
    this.updateCursorPosition();
  }

  @HostListener('document:selectionchange')
  onSelectionChange() {
    if (document.activeElement === this.editorDiv?.nativeElement) {
      this.updateCursorPosition();
    }
  }

  onFilesDropped(files: File[]): void {
    this.addFiles(files);
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    this.editorDiv?.nativeElement.focus();
  }

  onThumbnailSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];
    if (file) {
      this.thumbnailFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    this.editorDiv?.nativeElement.focus();
  }

  removeThumbnail(event: Event) {
    event.stopPropagation();
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  triggerImageUpload() {
    this.imageInput.nativeElement.click();
  }

  triggerVideoUpload() {
    this.videoInput.nativeElement.click();
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        this.insertMedia('image', imageUrl, file.name);
        const type = 'image';
        this.mediaFiles.update((arr) => [...arr, { file, preview: String(reader.result), type }]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    input.value = '';
  }

  handleVideoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        this.insertMedia('video', videoUrl, file.name);
        const type = 'video';
        this.mediaFiles.update((arr) => [...arr, { file, preview: String(reader.result), type }]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    input.value = '';
  }

  insertMedia(type: 'image' | 'video', src: string, filename: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // const mediaId = `media-${++this.mediaCounter}`;

    // Create media container
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media-element';
    mediaDiv.contentEditable = 'false';

    // Create media element
    let mediaElement: HTMLImageElement | HTMLVideoElement;
    if (type === 'image') {
      mediaElement = document.createElement('img');
      mediaElement.src = src;
      mediaElement.alt = filename;
      mediaElement.style.maxWidth = '100%';
      mediaElement.style.height = 'auto';
    } else {
      mediaElement = document.createElement('video');
      mediaElement.src = src;
      mediaElement.controls = true;
      mediaElement.style.maxWidth = '100%';
      mediaElement.style.height = 'auto';
    }

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className =
      'delete-btn mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed';
    deleteBtn.setAttribute('mat-icon-button', '');
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', 'Delete');

    // Create mat-icon element
    const iconElement = document.createElement('mat-icon');
    iconElement.textContent = 'delete';
    iconElement.className =
      'mat-icon notranslate material-icons mat-ligature-font mat-icon-no-color';
    deleteBtn.appendChild(iconElement);

    deleteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      mediaDiv.remove();
      this.onContentChange({ target: this.editorDiv.nativeElement } as any);
      this.deleteMedia(this.mediaCounter);
      this.mediaCounter--;
    };

    mediaDiv.appendChild(mediaElement);
    mediaDiv.appendChild(deleteBtn);

    // Insert at cursor position
    range.deleteContents();
    range.insertNode(mediaDiv);

    // Add a line break after media for better UX
    const br = document.createElement('br');
    range.setStartAfter(mediaDiv);
    range.insertNode(br);

    // Move cursor after the media element and line break
    const newRange = document.createRange();
    newRange.setStartAfter(br);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Update content
    this.onContentChange({ target: this.editorDiv.nativeElement } as any);

    this.mediaCounter++;
  }

  isContentValid(): boolean {
    return this.currentContent.length >= 100;
  }

  publishPost() {
    if (this.isContentValid()) {
      this.isLoading = true;
      const createPost = (res: UploadResponse) => {
        let htmlString = this.editorDiv.nativeElement.innerHTML;
        let index = 0;

        let content = htmlString.replace(/src=["']([^"']+)["']/g, (match) => {
          if (index < res.fileNames.length) {
            const newUrl = res.fileNames[index++];
            return `src="http://localhost:8080/api/post/file/${newUrl}"`;
          }
          return match;
        });
        const createPostPayload: CreatePostPayload = {
          title: this.blogForm.value.title,
          excerpt: (this.currentContent.length > 120) ? this.currentContent.substring(0, 120) : this.currentContent,
          content: content,
          thumbnail: res.thumbnail,
          files: res.fileNames,
        };

        this.postService.createPost(createPostPayload).subscribe({
          next: () => {
            this.isLoading = false;
            this.snackBar.open('Blog created successful', 'Close', { duration: 5000 });
            this.goBack();
          },
          error: (error) => console.log(error),
        });
      };

      const formData = new FormData();
      if (this.thumbnailFile) formData.append('thumbnail', this.thumbnailFile);
      console.log(this.mediaFiles().length);
      if (this.mediaFiles().length > 0) {
        this.mediaFiles().forEach((f) => formData.append('files', f.file));
      }
      this.postService.uploadFiles(formData).subscribe({
        next: (response) => createPost(response),
        error: (error) => console.log(error),
      });
    }
  }

  private addFiles(files: File[]): void {
    const list = Array.from(files);
    for (const file of list) {
      const reader = new FileReader();
      reader.onload = () => {
        const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
        const imageUrl = String(reader.result);
        this.insertMedia(type, imageUrl, file.name);
        this.mediaFiles.update((arr) => [...arr, { file, preview: imageUrl, type }]);
      };
      reader.readAsDataURL(file);
    }
  }

  deleteMedia(index: number): void {
    this.mediaFiles.update((arr) => arr.filter((_, i) => i !== index));
  }
}
