import { Directive, signal, output } from '@angular/core';

@Directive({
  selector: '[appDndUpload]',
  host: {
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
    '[class.dragover]': 'dragging()',
  },
})
export class DndUploadDirective {
  dragging = signal(false);
  filesDropped = output<File[]>();

  private readonly acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging.set(false);
    if (!event.dataTransfer) return;

    const files = Array.from(event.dataTransfer.files || []);

    const mediaFiles = files.filter((file) => this.acceptedTypes.includes(file.type));

    if (mediaFiles.length) {
      this.filesDropped.emit(mediaFiles);
    }
  }
}
