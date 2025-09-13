import { Component, OnInit, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from '../../../core/services/post.service';
import { CreatePostPayload, MediaItem } from '../../../shared/models/post.model';
import { MatCard } from '@angular/material/card';
import { DndUploadDirective } from '../../../core/directives/dnd-upload.directive';

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
    MatCard,
    DndUploadDirective,
  ],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent implements OnInit {
  postForm!: FormGroup;
  loading = false;
  mediaFiles = signal<MediaItem[]>([]);
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreatePostComponent> // @Inject(MAT_DIALOG_DATA) public data: { post?: Post }
  ) {
    // this.isEditing = !!data?.post;
  }

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });

    // If editing, populate form with existing data
    // if (this.isEditing && this.data.post) {
    //   this.postForm.patchValue({
    //     title: this.data.post.title,
    //     content: this.data.post.content,
    //   });
    // }
  }

  onFilesDropped(files: File[]): void {
    this.addFiles(files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  private addFiles(files: File[] | FileList): void {
    const list = Array.from(files as File[]);
    for (const file of list) {
      const reader = new FileReader();
      reader.onload = () => {
        const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
        this.mediaFiles.update((arr) => [...arr, { file, preview: String(reader.result), type }]);
      };
      reader.readAsDataURL(file);
    }
  }

  deleteMedia(index: number): void {
    this.mediaFiles.update((arr) => arr.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    const formData = new FormData();
    this.mediaFiles().forEach((f) => formData.append('files', f.file));
    this.postService.uploadFiles(formData).subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
    const createPostPayload: CreatePostPayload = {
      title: this.postForm.value.title,
      content: this.postForm.value.content,
    };

    this.postService.createPost(createPostPayload).subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
    console.log('Publish payload:', createPostPayload);
  }
}
