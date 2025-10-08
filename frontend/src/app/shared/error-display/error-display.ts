import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ErrorState, ErrorType } from '../models/error.model';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './error-display.html',
})
export class ErrorDisplayComponent {
  @Input() error?: ErrorState;
}
