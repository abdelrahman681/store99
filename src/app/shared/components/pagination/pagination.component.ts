import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  @Input() pageIndex = 1;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  // 1 … 4 5 6 … 20 — keeps the bar short enough for a phone screen
  get pages(): (number | null)[] {
    const total = this.totalPages;
    const current = this.pageIndex;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const result: (number | null)[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) result.push(null);
    for (let p = start; p <= end; p++) result.push(p);
    if (end < total - 1) result.push(null);
    result.push(total);
    return result;
  }

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageIndex) return;
    this.pageChange.emit(page);
  }
}
