import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { PROJECT_NOTIFICATIONS_ICONS } from '@shared/data';
import { ConfirmationService } from '@shared/services/confirmation';
import { INotification, IProject } from '@shared/models';
import { UiButton, UiConfirmDialog, UiSelect, SelectOption } from '@shared/ui';
import { PhasesStore } from '../../store/phases.store';
import { FilterProjectNotificationsDto, NotificationsStore } from '../../store/notifications.store';
import { NotificationCompose } from './notification-compose/notification-compose';
import { NotificationsHistoryList } from './notifications-list/notifications-list';
import { NotificationState, NotificationsState, NotificationStatus, SubmitNotification } from '../../types';

@Component({
  selector: 'app-project-notifications',
  templateUrl: './project-notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsStore, PhasesStore],
  imports: [UiButton, UiConfirmDialog, UiSelect, LucideAngularModule, NotificationsHistoryList, NotificationCompose]
})
export class ProjectNotifications {
  icons = PROJECT_NOTIFICATIONS_ICONS;
  project = input.required<IProject>();
  private readonly confirmationService = inject(ConfirmationService);
  notificationsStore = inject(NotificationsStore);
  phasesStore = inject(PhasesStore);
  filterPhaseId = signal('');
  filterStatus = signal<NotificationStatus | ''>('');
  currentPage = signal(1);
  phaseOptions = computed<SelectOption[]>(() => [
    { label: 'Tous les participants', value: '' },
    ...this.phasesStore.sortedPhases().map((phase) => ({ label: phase.name, value: phase.id }))
  ]);
  phaseFilterOptions = computed<SelectOption[]>(() => [
    { label: 'Toutes les phases', value: '' },
    ...this.phasesStore.sortedPhases().map((phase) => ({ label: phase.name, value: phase.id }))
  ]);
  statusFilterOptions: SelectOption[] = [
    { label: 'Tous les statuts', value: '' },
    { label: 'Brouillons', value: NotificationStatus.DRAFT },
    { label: 'Envoyées', value: NotificationStatus.SENT }
  ];
  filters = computed<FilterProjectNotificationsDto>(() => ({
    phaseId: this.filterPhaseId() || null,
    status: this.filterStatus() || null,
    page: this.currentPage() === 1 ? null : this.currentPage()
  }));
  activeNotification = computed(() => this.notificationsStore.activeNotification());

  historyState = computed<NotificationsState>(() => ({
    notifications: this.notificationsStore.list(),
    total: this.notificationsStore.total(),
    activeNotificationId: this.activeNotification()?.id ?? null,
    currentPage: this.currentPage(),
    itemsPerPage: 10
  }));

  composeState = computed<NotificationState>(() => ({
    activeNotification: this.activeNotification(),
    phaseOptions: this.phaseOptions(),
    isLoading: this.notificationsStore.isLoading(),
    isSaving: this.notificationsStore.isSaving(),
    error: this.notificationsStore.error(),
    isEditable: this.activeNotification()?.status !== NotificationStatus.SENT,
    project: this.project()
  }));

  constructor() {
    effect(() => {
      const projectId = this.project().id;
      this.phasesStore.loadAll(projectId);
      this.notificationsStore.loadAll({ projectId, filters: this.filters() });
    });
  }

  onFilterPhaseChange(value: unknown): void {
    this.filterPhaseId.set(String(value ?? ''));
    this.currentPage.set(1);
  }

  onFilterStatusChange(value: unknown): void {
    this.filterStatus.set((value as NotificationStatus | '') ?? '');
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onComposeNew(): void {
    this.notificationsStore.setActiveNotification(null);
  }

  onSelectNotification(notification: INotification): void {
    this.notificationsStore.setActiveNotification(notification);
  }

  onSaveDraft(payload: SubmitNotification): void {
    const notification = this.activeNotification();
    if (notification) {
      this.notificationsStore.update({
        notificationId: notification.id,
        dto: payload.dto,
        attachments: payload.attachments,
        onSuccess: (updated) => this.notificationsStore.setActiveNotification(updated)
      });
      return;
    }

    this.notificationsStore.create({
      projectId: this.project().id,
      dto: payload.dto,
      attachments: payload.attachments,
      onSuccess: (created) => this.notificationsStore.setActiveNotification(created)
    });
  }

  onSend(payload: SubmitNotification): void {
    const notification = this.activeNotification();

    if (notification?.status === NotificationStatus.SENT) {
      this.notificationsStore.send({
        notificationId: notification.id,
        onSuccess: (sent) => this.notificationsStore.setActiveNotification(sent)
      });
      return;
    }

    if (notification) {
      this.notificationsStore.update({
        notificationId: notification.id,
        dto: payload.dto,
        attachments: payload.attachments,
        onSuccess: (updated) =>
          this.notificationsStore.send({
            notificationId: updated.id,
            onSuccess: (sent) => this.notificationsStore.setActiveNotification(sent)
          })
      });
      return;
    }

    this.notificationsStore.create({
      projectId: this.project().id,
      dto: payload.dto,
      attachments: payload.attachments,
      onSuccess: (created) =>
        this.notificationsStore.send({
          notificationId: created.id,
          onSuccess: (sent) => this.notificationsStore.setActiveNotification(sent)
        })
    });
  }

  onDelete(notification: INotification): void {
    this.confirmationService.confirm({
      header: 'Supprimer la notification',
      message: `Êtes-vous sûr de vouloir supprimer « ${notification.title} » ?`,
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => this.notificationsStore.delete({ notificationId: notification.id })
    });
  }
}
