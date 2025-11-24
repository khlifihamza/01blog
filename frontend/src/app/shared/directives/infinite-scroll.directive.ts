import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective {
  @Output() scrolled = new EventEmitter<void>();

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= scrollThreshold) {
      this.scrolled.emit();
    }
  }
}
