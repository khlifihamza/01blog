import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { CreatePostPayload, MediaItem, UploadResponse } from '../../../shared/models/post.model';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { addLinkTosrc } from '../../../shared/utils/fromathtml';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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

  showAddButton = signal(false);
  buttonPosition = signal({ top: 20, left: -45 });
  isContentEmpty = true;
  jump = false;
  contentPlaceholder =
    'Share your journey, insights, and experiences with the 01Student community...';
  showValidationError = false;
  private currentContent = '';

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private errorService: ErrorService,
    private location: Location
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      thumbnail: ['', [Validators.required]],
    });
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    this.contentPlaceholder = '';
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    let imageProcessed = false;

    if (items) {
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
    }
    if (!imageProcessed) {
      let htmlContent = clipboardData.getData('text/html');
      const plainText = clipboardData.getData('text/plain');

      if (htmlContent) {
        htmlContent = this.getTextFromHtml(htmlContent);
      } else if (plainText) {
        htmlContent = `<span>${plainText}</span>`;
      } else {
        return;
      }
      this.currentContent = htmlContent;
      this.showValidationError = this.currentContent.length > 0 && this.currentContent.length < 100;
      this.insertHtmlAtCursor(htmlContent);
    }
  }

  private handleImagePaste(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        const imgSrc = e.target.result as string;
        const mediaId = this.generateMediaId();

        this.insertMedia('image', imgSrc, file.name, mediaId);

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
      }
    };

    reader.readAsDataURL(file);
  }

  private getTextFromHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
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
    tempDiv.innerHTML = html;

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
    const editor = this.editorDiv.nativeElement;
    const editorRect = editor.getBoundingClientRect();

    const editorHeight = editor.clientHeight;

    const buttonHeight = 32;

    const minTop = 16.5;
    const maxTop = editorHeight - buttonHeight;

    const rangeRect = range.getBoundingClientRect();

    let calculatedTop = 0;

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
          if (parent) {
            parent.removeChild(tempSpan);
          }

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

  isContentValid(): boolean {
    return this.thumbnailFile != null && this.currentContent.length >= 100;
  }

  publishPost() {
    if (this.isContentValid()) {
      this.isLoading.set(true);
      const createPost = (res: UploadResponse) => {
        let htmlString = this.editorDiv.nativeElement.innerHTML;

        let content = addLinkTosrc(htmlString, res.fileNames);

        const createPostPayload: CreatePostPayload = {
          title: this.blogForm.value.title,
          content: content,
          thumbnail: res.thumbnail,
          files: res.fileNames,
        };

        this.postService.createPost(createPostPayload).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.errorService.showSuccess('Blog created successfully');
            this.goBack();
          },
          error: (error) => this.errorService.handleError(error),
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
        error: (error) => this.errorService.handleError(error),
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
