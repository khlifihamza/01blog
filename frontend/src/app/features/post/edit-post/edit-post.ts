import { Component, ElementRef, signal, ViewChild, OnDestroy } from '@angular/core';
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
export class EditPostComponent implements OnDestroy {
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
  isContentEmpty = signal(false);
  showValidationError = signal(false);
  mediaFiles = signal<MediaItem[]>([]);
  buttonPosition = signal({ top: 16, left: -45 });
  showAddButton = signal(false);
  jump = false;
  safeContent: SafeHtml | null = null;
  postNotFound = signal(false);

  private objectUrls = new Map<string, string>();

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    private errorService: ErrorService,
    private location: Location,
    private router: Router
  ) {
    this.editForm = new FormGroup({
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
      error: (error) => {
        if (error.status === 404 || error.status === 422) {
          this.postNotFound.set(true);
        }
      },
    });
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    let imageProcessed = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          this.handleImagePaste(file);
          imageProcessed = true;
        }
      }
    }

    if (!imageProcessed) {
      const plainText = clipboardData.getData('text/plain');
      if (!plainText) return;

      this.currentContent += plainText;
      this.showValidationError.set(
        (this.currentContent.length > 0 && this.currentContent.length < 100) ||
          this.currentContent.length > 50000
      );
      this.insertHtmlAtCursor(plainText);
    }
  }

  private handleImagePaste(file: File): void {
    const objectUrl = URL.createObjectURL(file);
    const mediaId = this.generateMediaId();

    this.insertMedia('image', objectUrl, file.name, mediaId);
    this.objectUrls.set(mediaId, objectUrl);

    this.mediaFiles.update((arr) => [
      ...arr,
      {
        id: mediaId,
        file,
        preview: objectUrl,
        type: 'image',
        position: 0,
      },
    ]);

    this.updateMediaPositions();
  }

  onThumbnailSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];
    if (file) {
      this.thumbnailFile = file;

      if (this.thumbnailPreview() && this.thumbnailPreview()?.startsWith('blob:')) {
        URL.revokeObjectURL(this.thumbnailPreview()!);
      }

      const objectUrl = URL.createObjectURL(file);
      this.thumbnailPreview.set(objectUrl);
      this.existingThumbnail = true;
    }
    this.editorDiv?.nativeElement.focus();
  }

  removeThumbnail(event: Event) {
    event.stopPropagation();
    if (this.thumbnailPreview() && this.thumbnailPreview()?.startsWith('blob:')) {
      URL.revokeObjectURL(this.thumbnailPreview()!);
    }
    this.thumbnailFile = null;
    this.thumbnailPreview.set(null);
    this.existingThumbnail = false;
  }

  onFilesDropped(files: File[]): void {
    this.addFiles(files);
  }

  private addFiles(files: File[]): void {
    const list = Array.from(files);
    for (const file of list) {
      const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
      const objectUrl = URL.createObjectURL(file);
      const mediaId = this.generateMediaId();

      this.insertMedia(type, objectUrl, file.name, mediaId);
      this.objectUrls.set(mediaId, objectUrl);

      this.mediaFiles.update((arr) => [
        ...arr,
        {
          id: mediaId,
          file,
          preview: objectUrl,
          type,
          position: 0,
        },
      ]);

      setTimeout(() => this.updateMediaPositions(), 0);
    }
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
      const objectUrl = URL.createObjectURL(file);
      const mediaId = this.generateMediaId();

      this.insertMedia('image', objectUrl, file.name, mediaId);
      this.objectUrls.set(mediaId, objectUrl);

      this.mediaFiles.update((arr) => [
        ...arr,
        {
          id: mediaId,
          file,
          preview: objectUrl,
          type: 'image',
          position: 0,
        },
      ]);

      setTimeout(() => this.updateMediaPositions(), 0);
    }

    input.value = '';
  }

  handleVideoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('video/')) {
      const objectUrl = URL.createObjectURL(file);
      const mediaId = this.generateMediaId();

      this.insertMedia('video', objectUrl, file.name, mediaId);
      this.objectUrls.set(mediaId, objectUrl);

      this.mediaFiles.update((arr) => [
        ...arr,
        {
          id: mediaId,
          file,
          preview: objectUrl,
          type: 'video',
          position: 0,
        },
      ]);

      setTimeout(() => this.updateMediaPositions(), 0);
    }

    input.value = '';
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
        type: imgElement ? 'image' : 'video',
        position: index,
      });
    });

    this.mediaFiles.set(mediaItems);
  }

  private generateMediaId(): string {
    return 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  insertMedia(type: 'image' | 'video', src: string, filename: string, mediaId: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer as HTMLElement;

    const editor = this.editorDiv.nativeElement;
    let isInsideEditor = false;

    if (container.nodeType === Node.ELEMENT_NODE) {
      isInsideEditor = editor.contains(container) || editor === container;
    } else if (container.parentElement) {
      isInsideEditor =
        editor.contains(container.parentElement) || editor === container.parentElement;
    }

    if (!isInsideEditor) {
      this.errorService.showWarning('Cannot insert media outside the editor');
      return;
    }

    let mediaParent: HTMLElement | null = null;
    if (container.nodeType === Node.ELEMENT_NODE) {
      mediaParent = (container as HTMLElement).closest('.media-element');
    } else if (container.parentElement) {
      mediaParent = container.parentElement.closest('.media-element');
    }

    if (mediaParent) {
      const afterMediaRange = document.createRange();
      afterMediaRange.setStartAfter(mediaParent);
      afterMediaRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(afterMediaRange);
      range = afterMediaRange;
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

  private updateMediaPositions() {
    const mediaElements = this.editorDiv?.nativeElement?.querySelectorAll('.media-element');
    if (!mediaElements || mediaElements.length === 0) return;

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

  private insertHtmlAtCursor(html: string): void {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer as HTMLElement;

    const mediaParent =
      container.nodeType === Node.ELEMENT_NODE
        ? (container as HTMLElement).closest('.media-element')
        : container.parentElement?.closest('.media-element');

    if (mediaParent) {
      const afterMediaRange = document.createRange();
      afterMediaRange.setStartAfter(mediaParent);
      afterMediaRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(afterMediaRange);
    }

    range.deleteContents();

    const tempDiv = document.createElement('div');
    tempDiv.innerText = html;

    const fragment = document.createDocumentFragment();
    let lastNode: Node | null = null;

    while (tempDiv.firstChild) {
      lastNode = fragment.appendChild(tempDiv.firstChild);
    }

    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.currentContent = target.innerText || '';
    this.isContentEmpty.set(this.currentContent.trim().length === 0);

    this.editForm.patchValue({ content: this.currentContent });

    this.showValidationError.set(
      (this.currentContent.length > 0 && this.currentContent.length < 100) ||
        this.currentContent.length > 50000
    );

    this.updateMediaPositions();
    this.updateCursorPosition();
  }

  updateCursorPosition() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const editor = this.editorDiv.nativeElement;
    const editorRect = editor.getBoundingClientRect();
    const editorHeight = editor.clientHeight;
    const buttonHeight = 32;
    const minTop = 16.5;
    const maxTop = editorHeight - buttonHeight;

    let calculatedTop = 0;
    const rangeRect = range.getBoundingClientRect();

    if (rangeRect.height > 0 && rangeRect.width > 0) {
      calculatedTop = Math.floor(rangeRect.top - editorRect.top + rangeRect.height / 2 - 16);
    } else {
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect = rects[0];
        calculatedTop = Math.ceil(rect.top - editorRect.top - 8);
      } else {
        const computedStyle = window.getComputedStyle(editor);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 24;

        try {
          const tempSpan = document.createElement('span');
          tempSpan.innerHTML = '\u200B';
          range.insertNode(tempSpan);
          const spanRect = tempSpan.getBoundingClientRect();
          calculatedTop = Math.floor(spanRect.top - editorRect.top + lineHeight / 2 - 20);

          const parent = tempSpan.parentNode;
          if (parent) parent.removeChild(tempSpan);

          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          calculatedTop = this.buttonPosition().top;
        }
      }
    }

    const clampedTop = Math.max(minTop, Math.min(calculatedTop, maxTop));

    this.buttonPosition.set({
      top:
        Math.abs(clampedTop - this.buttonPosition().top) > 20 && !this.jump
          ? clampedTop
          : this.buttonPosition().top,
      left: -45,
    });
  }

  onFocus() {
    this.showAddButton.set(true);
    this.updateCursorPosition();
    this.jump = false;
  }

  onBlur() {
    this.jump = true;
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    this.editorDiv?.nativeElement.focus();
  }

  updatePost() {
    if (this.editForm.valid) {
      this.isLoading.set(true);
      const content = this.editorDiv.nativeElement.innerHTML;

      const formData = new FormData();
      formData.append('title', this.editForm.value.title.trim());
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

  deleteMedia(mediaId: string): void {
    const url = this.objectUrls.get(mediaId);
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(mediaId);
    }

    this.mediaFiles.update((arr) => arr.filter((v) => v.id !== mediaId));
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
      this.editForm.value.title.trim().length >= 5 &&
      this.thumbnailPreview() != null &&
      this.currentContent.length >= 100 &&
      this.currentContent.length <= 50000
    );
  }

  thumbnailValidator = (control: AbstractControl): ValidationErrors | null => {
    return this.existingThumbnail ? null : { required: true };
  };

  ngOnDestroy(): void {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls.clear();

    if (this.thumbnailPreview() && this.thumbnailPreview()?.startsWith('blob:')) {
      URL.revokeObjectURL(this.thumbnailPreview()!);
    }
  }
}
