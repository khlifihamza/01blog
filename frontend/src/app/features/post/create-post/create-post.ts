import { Component, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { NavbarComponent } from '../../../shared/navbar/navbar';

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
    NavbarComponent
  ],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css'],
})
export class CreatePostComponent {
  @ViewChild('editorDiv') editorDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  blogForm: FormGroup;
  isLoading = signal(false);
  mediaFiles = signal<MediaItem[]>([]);
  thumbnailFile: File | null = null;
  thumbnailPreview = signal<string | null>(null);

  showAddButton = false;
  buttonPosition = { top: 28, left: -45 };
  isContentEmpty = true;
  contentPlaceholder =
    'Share your journey, insights, and experiences with the 01Student community...';
  showValidationError = false;
  private currentContent = '';

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private location: Location,
    private dialog: MatDialog
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

    this.updateMediaPositions();
    this.updateCursorPosition();
  }

  private updateMediaPositions() {
    const mediaElements = this.editorDiv.nativeElement.querySelectorAll('.media-element');
    const updatedMediaFiles: MediaItem[] = [];

    mediaElements.forEach((element, index) => {
      const mediaId = element.getAttribute('data-media-id');
      if (mediaId) {
        const mediaItem = this.mediaFiles().find((item) => item.id === mediaId);
        if (mediaItem) {
          updatedMediaFiles.push({
            ...mediaItem,
            position: index,
          });
        }
      }
    });

    updatedMediaFiles.sort((a, b) => a.position - b.position);
    this.mediaFiles.set(updatedMediaFiles);
  }

  private getOrderedMediaFiles(): File[] {
    return this.mediaFiles()
      .sort((a, b) => a.position - b.position)
      .map((item) => item.file);
  }

  updateCursorPosition() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    const rangeRect = range.getBoundingClientRect();
    const editorRect = this.editorDiv.nativeElement.getBoundingClientRect();

    if (rangeRect.height > 0) {
      this.buttonPosition = {
        top: rangeRect.top - editorRect.top + rangeRect.height / 2 - 16,
        left: -45,
      };
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
  }

  onThumbnailSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];
    if (file) {
      this.thumbnailFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    this.editorDiv?.nativeElement.focus();
  }

  removeThumbnail(event: Event) {
    event.stopPropagation();
    this.thumbnailFile = null;
    this.thumbnailPreview.set(null);
  }

  goBack() {
    this.location.back();
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
        const mediaId = this.generateMediaId();

        this.insertMedia('image', imageUrl, file.name, mediaId);

        const type = 'image';
        this.mediaFiles.update((arr) => [
          ...arr,
          {
            id: mediaId,
            file,
            preview: String(reader.result),
            type,
            position: 0,
          },
        ]);

        this.updateMediaPositions();
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  handleVideoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        const mediaId = this.generateMediaId();

        this.insertMedia('video', videoUrl, file.name, mediaId);

        const type = 'video';
        this.mediaFiles.update((arr) => [
          ...arr,
          {
            id: mediaId,
            file,
            preview: String(reader.result),
            type,
            position: 0,
          },
        ]);
        this.updateMediaPositions();
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  private generateMediaId(): string {
    return 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  insertMedia(type: 'image' | 'video', src: string, filename: string, mediaId: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (this.editorDiv.nativeElement == range.commonAncestorContainer) {
      this.snackBar.open("can't insert media in the start of the story", 'Close', {
        duration: 5000,
      });
      return;
    }

    if (range.commonAncestorContainer.nodeName == '#text') {
      this.snackBar.open("can't insert media next to text or other media", 'Close', {
        duration: 5000,
      });
      return;
    }

    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media-element';
    mediaDiv.contentEditable = 'false';
    mediaDiv.setAttribute('data-media-id', mediaId);

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

    const deleteBtn = document.createElement('button');
    deleteBtn.className =
      'delete-btn mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed';
    deleteBtn.setAttribute('mat-icon-button', '');
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', 'Delete');
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
      this.deleteMedia(mediaId);
    };

    mediaDiv.appendChild(mediaElement);
    mediaDiv.appendChild(deleteBtn);
    range.deleteContents();
    range.insertNode(mediaDiv);
    const br = document.createElement('br');
    range.setStartAfter(mediaDiv);
    range.insertNode(br);
    const newRange = document.createRange();
    newRange.setStartAfter(br);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    this.onContentChange({ target: this.editorDiv.nativeElement } as any);
  }

  isContentValid(): boolean {
    return this.thumbnailFile != null && this.currentContent.length >= 100;
  }

  publishPost() {
    if (this.isContentValid()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: <ConfirmDialogData>{
          title: 'Create Post',
          message: 'Are you sure you want to Create this post?',
          confirmText: 'Create',
          cancelText: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.isLoading.set(true);
          const createPost = (res: UploadResponse) => {
            let htmlString = this.editorDiv.nativeElement.innerHTML;

            const createPostPayload: CreatePostPayload = {
              title: this.blogForm.value.title,
              content: htmlString,
              thumbnail: res.thumbnail,
              files: res.fileNames,
            };

            this.postService.createPost(createPostPayload).subscribe({
              next: () => {
                this.isLoading.set(false);
                this.snackBar.open('Blog created successful', 'Close', { duration: 5000 });
                this.goBack();
              },
              error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
            });
          };

          const formData = new FormData();
          if (this.thumbnailFile) formData.append('thumbnail', this.thumbnailFile);

          const orderedFiles = this.getOrderedMediaFiles();
          if (orderedFiles.length > 0) {
            orderedFiles.forEach((file) => formData.append('files', file));
          }

          this.postService.uploadFiles(formData).subscribe({
            next: (response) => createPost(response),
            error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
          });
        }
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
        const mediaId = this.generateMediaId();
        this.insertMedia(type, imageUrl, file.name, mediaId);

        this.mediaFiles.update((arr) => [
          ...arr,
          {
            id: mediaId,
            file,
            preview: imageUrl,
            type,
            position: 0,
          },
        ]);
        this.updateMediaPositions();
      };
      reader.readAsDataURL(file);
    }
  }

  deleteMedia(mediaId: string): void {
    this.mediaFiles.update((arr) => arr.filter((v) => v.id !== mediaId));
  }
}
