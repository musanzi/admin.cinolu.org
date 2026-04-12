import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { UI_PAGINATION_ICONS } from '@shared/data';

export type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-ui-pagination',
  imports: [LucideAngularModule],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiPagination {
  icons = UI_PAGINATION_ICONS;
  currentPage = input<number>(1);
  totalItems = input<number>(0);
  itemsPerPage = input<number>(40);
  maxVisiblePages = input<number>(5);
  pageChange = output<number>();

  protected totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())));

  protected startItem = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);

  protected endItem = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()));

  /** Page numbers and ellipsis to display; ellipsis when there are more than maxVisiblePages. */
  protected visibleItems = computed((): PaginationItem[] => {
    const total = this.totalPages();
    const max = this.maxVisiblePages();
    const current = this.currentPage();
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const result: PaginationItem[] = [1];
    const half = Math.floor((max - 2) / 2);
    const start = Math.max(2, current - half);
    const end = Math.min(total - 1, current + half);
    if (start > 2) result.push('ellipsis');
    for (let p = start; p <= end; p++) result.push(p);
    if (end < total - 1) result.push('ellipsis');
    if (total > 1) result.push(total);
    return result;
  });

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  protected trackPaginationItem(index: number, item: PaginationItem): string {
    if (item === 'ellipsis') {
      return `ellipsis-${index}`;
    }
    return `page-${item}`;
  }
}
