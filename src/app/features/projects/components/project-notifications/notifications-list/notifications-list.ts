import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NotificationsState } from '@features/projects/types/notifications.types';
import { INotification } from '@shared/models';
import { UiPagination } from '@shared/ui';
import { Inbox, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UiPagination, LucideAngularModule]
})
export class NotificationsHistoryList {
  readonly state = input.required<NotificationsState>();
  readonly selectNotification = output<INotification>();
  readonly pageChange = output<number>();
  readonly icons = { Inbox };

  onSelectNotification(notification: INotification): void {
    this.selectNotification.emit(notification);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  isActive(notification: INotification): boolean {
    return this.state().activeNotificationId === notification.id;
  }

  phaseLabel(notification: INotification): string {
    if (notification.notify_staff) return 'Tous les participants';
    if (!notification.phase?.name) return 'Destinataires: staff';
    return notification.phase.name;
  }

  bodyPreview(notification: INotification): string {
    return notification.body ?? '';
  }
}
