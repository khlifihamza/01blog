import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CreatePostPayload, MediaItem } from '../../../shared/models/post.model';
import { MatMenuModule } from '@angular/material/menu';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { PostService } from '../../../core/services/post.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog.model';
import { NavbarComponent } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-edit-post',
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
    NavbarComponent,
  ],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPostComponent{
  @ViewChild('editorDiv') editorDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  editForm: FormGroup;
  isLoading = signal(false);
  thumbnailFile: File | null = null;
  thumbnailPreview = signal<string | null>(null);
  existingThumbnail: boolean = true;
  oldThumbnail: string | null = null;
  oldFileNames: string[] = [];
  tags: string[] = [];
  postId: string = '';
  private currentContent = '';
  isContentEmpty = true;
  showValidationError = false;
  mediaFiles = signal<MediaItem[]>([]);
  buttonPosition = { top: 28, left: -45 };
  showAddButton = false;
  private mediaCounter = 0;
  safeContent: SafeHtml | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private location: Location,
    private dialog: MatDialog
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      thumbnail: ['', [this.thumbnailValidator.bind(this)]],
    });
  }

  ngOnInit() {
    let postId = this.route.snapshot.paramMap.get('id');
    if (postId != null) {
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
        this.editForm.patchValue({
          title: post.title,
          content: this.sanitizer.bypassSecurityTrustHtml(post.content),
        });
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content);
        setTimeout(() => {
          this.setupExistingMediaDeleteButtons();
          this.convertExistingMediaToMediaItems();
        }, 0);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
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

      if (imgElement && this.oldFileNames[index]) {
        const fileName = this.oldFileNames[index];
        const file = new File([''], fileName, { type: 'image/jpeg' });

        mediaItems.push({
          id: mediaId,
          file: file,
          preview: imgElement.src,
          type: 'image',
          position: index,
        });
      } else if (videoElement && this.oldFileNames[index]) {
        const fileName = this.oldFileNames[index];
        const file = new File([''], fileName, { type: 'video/mp4' });

        mediaItems.push({
          id: mediaId,
          file: file,
          preview: videoElement.src,
          type: 'video',
          position: index,
        });
      }
    });
    this.mediaFiles.set(mediaItems);
  }

  onFocus() {
    this.showAddButton = true;
    this.updateCursorPosition();
  }

  private updateMediaPositions() {
    const mediaElements = this.editorDiv?.nativeElement?.querySelectorAll('.media-element');

    if (!mediaElements || mediaElements.length === 0) {
      return;
    }

    this.mediaFiles.update((currentFiles) => {
      const updatedFiles = [...currentFiles];

      mediaElements.forEach((element, index) => {
        const mediaId = element.getAttribute('data-media-id');
        if (mediaId) {
          const fileIndex = updatedFiles.findIndex((item) => item.id === mediaId);
          if (fileIndex !== -1) {
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              position: index,
            };
          }
        }
      });

      return updatedFiles.sort((a, b) => a.position - b.position);
    });
  }

  private getOrderedMediaFiles(): { newFiles: File[]; allFileNames: string[] } {
    const sortedMediaItems = this.mediaFiles().sort((a, b) => a.position - b.position);
    const newFiles: File[] = [];
    const allFileNames: string[] = [];

    sortedMediaItems.forEach((item, index) => {
      if (item.file.size > 0) {
        newFiles.push(item.file);
        allFileNames.push(`new_file_${index}`);
      } else {
        allFileNames.push(item.file.name);
      }
    });

    return { newFiles, allFileNames };
  }

  private generateMediaId(): string {
    return 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updatePost() {
    if (this.editForm.valid) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: <ConfirmDialogData>{
          title: 'Update Post',
          message: 'Are you sure you want to Update this post?',
          confirmText: 'Update',
          cancelText: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.isLoading.set(true);
          const updatePost = () => {
            let htmlString = this.editorDiv.nativeElement.innerHTML;
            const updatePostPayload: CreatePostPayload = {
              title: this.editForm.value.title,
              content: htmlString,
              thumbnail: this.oldThumbnail!,
              files: this.oldFileNames,
            };
            this.postService.updatePost(updatePostPayload, this.postId).subscribe({
              next: (response) => {
                this.isLoading.set(false);
                this.snackBar.open(response.message, 'Close', { duration: 5000 });
                this.goBack();
              },
              error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
            });
          };

          if (!this.thumbnailFile) {
            const charIndex = this.oldThumbnail?.lastIndexOf('/');
            const fileName = this.oldThumbnail?.slice(charIndex! + 1);
            this.postService.getOldThumbnail(fileName!).subscribe({
              next: (blob) => {
                this.thumbnailFile = new File([blob], this.oldThumbnail!, { type: blob.type });
                this.uploadAndUpdate(updatePost);
              },
              error: (err) => console.error('Download failed:', err),
            });
          } else {
            this.uploadAndUpdate(updatePost);
          }
        }
      });
    }
  }

  private uploadAndUpdate(updatePost: () => void) {
    const formData = new FormData();
    const { newFiles, allFileNames } = this.getOrderedMediaFiles();

    if (this.thumbnailFile) {
      formData.append('thumbnail', this.thumbnailFile);
    }

    if (newFiles.length > 0) {
      newFiles.forEach((file) => formData.append('files', file));
    }

    if (formData.has('thumbnail') || formData.has('files')) {
      this.postService.uploadFiles(formData).subscribe({
        next: (response) => {
          if (this.thumbnailFile) {
            this.oldThumbnail = response.thumbnail;
          }
          if (newFiles.length > 0) {
            const newFileNames = response.fileNames;
            let newFileIndex = 0;

            this.oldFileNames = allFileNames.map((fileName) => {
              if (fileName.startsWith('new_file_')) {
                return newFileNames[newFileIndex++];
              }
              return fileName;
            });
          } else {
            this.oldFileNames = allFileNames;
          }
          updatePost();
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    } else {
      this.oldFileNames = allFileNames;
      updatePost();
    }
  }

  goBack() {
    this.location.back();
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
    this.existingThumbnail = true;
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.currentContent = target.innerText || '';
    this.isContentEmpty = this.currentContent.trim().length === 0;

    this.editForm.patchValue({ content: this.currentContent });

    this.showValidationError = this.currentContent.length > 0 && this.currentContent.length < 100;

    setTimeout(() => this.updateMediaPositions(), 0);
    this.updateCursorPosition();
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

  onFilesDropped(files: File[]): void {
    this.addFiles(files);
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

        setTimeout(() => this.updateMediaPositions(), 0);
      };
      reader.readAsDataURL(file);
    }
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    this.editorDiv?.nativeElement.focus();
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

        setTimeout(() => this.updateMediaPositions(), 0);
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

        setTimeout(() => this.updateMediaPositions(), 0);
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
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
      this.mediaCounter--;
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

    this.mediaCounter++;
  }

  deleteMedia(mediaId: string): void {
    this.mediaFiles.update((arr) => arr.filter((v) => v.id !== mediaId));
  }

  removeThumbnail(event: Event) {
    event.stopPropagation();
    this.thumbnailFile = null;
    this.thumbnailPreview.set(null);
    this.existingThumbnail = false;
  }

  isContentValid(): boolean {
    return this.currentContent.length >= 100;
  }

  private thumbnailValidator(control: any) {
    if (this.existingThumbnail) {
      return null;
    }
    return { required: true };
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
}
