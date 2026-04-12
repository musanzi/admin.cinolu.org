import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NOTIFICATIONS_HISTORY_LIST_ICONS } from '@shared/data';
import { NotificationsState } from '@features/projects/types';
import { INotification } from '@shared/models';
import { UiPagination } from '@shared/ui';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UiPagination, LucideAngularModule]
})
export class NotificationsHistoryList {
  icons = NOTIFICATIONS_HISTORY_LIST_ICONS;
  state = input.required<NotificationsState>();
  isLoading = input<boolean>(false);
  selectNotification = output<INotification>();
  pageChange = output<number>();

  onSelectNotification(notification: INotification): void {
    this.selectNotification.emit(notification);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  isActive(notification: INotification): boolean {
    return this.state().activeNotificationId === notification.id;
  }

  recipientsLabel(notification: INotification): string {
    if (notification.notify_staff) return 'Staff';
    if (notification.notify_mentors && notification.phase?.name) return `Mentors de ${notification.phase.name}`;
    if (notification.phase?.name) return notification.phase.name;
    return 'Tous les participants';
  }

  bodyPreview(body: string): string {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }
}
