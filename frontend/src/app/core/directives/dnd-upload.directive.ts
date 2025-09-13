import { Directive, signal, output } from '@angular/core';

@Directive({
  selector: '[appDndUpload]',
  host: {
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
    '[class.dragover]': 'dragging()'
  }
})
export class DndUploadDirective {
  dragging = signal(false);
  filesDropped = output<File[]>();

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
    if (files.length) {
      this.filesDropped.emit(files);
    }
  }
}
