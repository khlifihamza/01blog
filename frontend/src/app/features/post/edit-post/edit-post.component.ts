import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatePostPayload, MediaItem } from '../../../shared/models/post.model';
import { MatMenuModule } from '@angular/material/menu';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { PostService } from '../../../core/services/post.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { addLinkTosrc } from '../../../shared/utils/formathtml';

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
  ],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css',
})
export class EditPostComponent implements OnInit {
  @ViewChild('editorDiv') editorDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('addButton') addButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  editForm: FormGroup;
  isLoading = false;
  thumbnailFile: File | null = null;
  thumbnailPreview: string | null = null;
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
    private router: Router,
    private route: ActivatedRoute,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
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
        this.thumbnailPreview = 'http://localhost:8080/api/post/file/' + post.thumbnail;
        this.editForm.patchValue({
          title: post.title,
          content: this.sanitizer.bypassSecurityTrustHtml(post.content),
        });
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content);
        setTimeout(() => {
          this.setupExistingMediaDeleteButtons();
        }, 0);
      },
      error: (error) => console.log(error),
    });
  }

  onFocus() {
    this.showAddButton = true;
    this.updateCursorPosition();
  }

  updatePost() {
    if (this.editForm.valid) {
      this.isLoading = true;
      const updatePost = () => {
        let htmlString = this.editorDiv.nativeElement.innerHTML;

        let content = addLinkTosrc(htmlString, this.oldFileNames);
        const updatePostPayload: CreatePostPayload = {
          title: this.editForm.value.title,
          content: content,
          thumbnail: this.oldThumbnail!,
          files: this.oldFileNames,
        };
        this.postService.updatePost(updatePostPayload, this.postId).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open(response.message, 'Close', { duration: 5000 });
            this.goBack();
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      };

      const formData = new FormData();
      if (this.thumbnailFile) formData.append('thumbnail', this.thumbnailFile);
      if (this.mediaFiles().length > 0) {
        this.mediaFiles().forEach((f) => formData.append('files', f.file));
      }
      if (this.thumbnailFile || this.mediaFiles().length > 0) {
        this.postService.uploadFiles(formData).subscribe({
          next: (response) => {
            if (this.thumbnailFile) {
              this.oldThumbnail = response.thumbnail;
            }
            if (this.mediaFiles().length > 0) {
              this.oldFileNames = response.fileNames;
            }
            updatePost();
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      } else {
        updatePost();
      }
    }
  }

  goBack() {
    this.router.navigate(['/post', this.postId]);
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

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.currentContent = target.innerText || '';
    this.isContentEmpty = this.currentContent.trim().length === 0;

    this.editForm.patchValue({ content: this.currentContent });

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
        this.insertMedia(type, imageUrl, file.name);
        this.mediaFiles.update((arr) => [...arr, { file, preview: imageUrl, type }]);
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
        this.insertMedia('image', imageUrl, file.name);
        const type = 'image';
        this.mediaFiles.update((arr) => [...arr, { file, preview: String(reader.result), type }]);
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
        this.insertMedia('video', videoUrl, file.name);
        const type = 'video';
        this.mediaFiles.update((arr) => [...arr, { file, preview: String(reader.result), type }]);
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  insertMedia(type: 'image' | 'video', src: string, filename: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media-element';
    mediaDiv.contentEditable = 'false';
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
      this.deleteMedia(this.mediaCounter);
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

  deleteMedia(index: number): void {
    this.mediaFiles.update((arr) => arr.filter((_, i) => i !== index));
  }

  removeThumbnail(event: Event) {
    event.stopPropagation();
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
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
    const deleteButtons = this.editorDiv.nativeElement.querySelectorAll('.media-element .delete-btn');
    deleteButtons.forEach((element: Element) => {
      const button = element as HTMLButtonElement;
      button.onclick = null;
      button.onclick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const mediaDiv = button.closest('.media-element') as HTMLElement;
        if (mediaDiv) {
          mediaDiv.remove();
          this.onContentChange({ target: this.editorDiv.nativeElement } as any);
        }
      };
    });
  }
}
