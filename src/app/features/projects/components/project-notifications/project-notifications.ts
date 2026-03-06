import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Plus, LucideAngularModule } from 'lucide-angular';
import { UiButton, UiSelect, UiConfirmDialog, SelectOption } from '@shared/ui';
import { ConfirmationService } from '@shared/services/confirmation';
import { INotification, IProject } from '@shared/models';
import { NotificationsStore } from '../../store/notifications.store';
import { PhasesStore } from '@features/projects/store/phases.store';
import { AuthStore } from '@core/auth/auth.store';
import { NotificationCompose } from './notification-compose/notification-compose';
import { NotificationsHistoryList } from './notifications-list/notifications-list';
import { NotifyParticipantsDto } from '../../dto/notifications/notify-participants.dto';
import {
  NotificationStatus,
  NotificationsState,
  NotificationState,
  SubmitNotification
} from '@features/projects/types';

@Component({
  selector: 'app-project-notifications',
  templateUrl: './project-notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsStore, PhasesStore],
  imports: [
    FormsModule,
    UiButton,
    UiSelect,
    UiConfirmDialog,
    LucideAngularModule,
    NotificationsHistoryList,
    NotificationCompose
  ]
})
export class ProjectNotifications {
  project = input.required<IProject>();
  #confirmationService = inject(ConfirmationService);
  authStore = inject(AuthStore);
  notificationsStore = inject(NotificationsStore);
  phasesStore = inject(PhasesStore);
  isComposing = signal(true);
  filterPhaseId = signal('');
  filterStatus = signal<NotificationStatus | null>(null);
  filterPage = signal<number | null>(null);
  queryParams = computed(() => ({
    phaseId: this.filterPhaseId(),
    status: this.filterStatus(),
    page: this.filterPage() === null ? null : String(this.filterPage())
  }));
  currentPage = computed(() => this.filterPage() ?? 1);
  itemsPerPage = 10;
  icons = { Plus };
  phaseOptions = computed(() => this.#buildPhaseOptions('Tous les participants'));
  phaseFilterOptions = computed(() => this.#buildPhaseOptions('Toutes les phases'));
  statusFilterOptions: SelectOption[] = [
    { label: 'Tous', value: '' },
    { label: 'Brouillon', value: 'draft' },
    { label: 'Envoyée', value: 'sent' }
  ];
  activeNotification = computed(() => this.notificationsStore.activeNotification());
  historyState = computed<NotificationsState>(() => ({
    notifications: this.notificationsStore.list(),
    total: this.notificationsStore.total(),
    activeNotificationId: this.activeNotification()?.id ?? null,
    currentPage: this.currentPage(),
    itemsPerPage: this.itemsPerPage
  }));
  composeState = computed<NotificationState>(() => ({
    activeNotification: this.activeNotification(),
    phaseOptions: this.phaseOptions(),
    isSaving: this.notificationsStore.isSaving(),
    error: this.notificationsStore.error(),
    project: this.project()
  }));

  constructor() {
    this.#setupEffects();
  }

  #setupEffects(): void {
    effect(() => {
      const projectId = this.project()?.id;
      if (!projectId) return;
      this.notificationsStore.loadAll({ projectId, filters: this.queryParams() });
      this.phasesStore.loadAll(projectId);
    });
  }

  #buildPhaseOptions(defaultLabel: string): SelectOption[] {
    return [
      { label: defaultLabel, value: '' },
      ...this.phasesStore.sortedPhases().map((phase) => ({ label: phase.name, value: phase.id }))
    ];
  }

  onFilterPhaseChange(value: string): void {
    this.filterPhaseId.set(value ?? '');
    this.filterPage.set(null);
  }

  onFilterStatusChange(value: NotificationStatus | '' | null): void {
    this.filterStatus.set((value || null) as NotificationStatus | null);
    this.filterPage.set(null);
  }

  onSelectNotification(notification: INotification): void {
    this.notificationsStore.setActiveNotification(notification);
    this.#startCompose();
  }

  onComposeNew(): void {
    this.notificationsStore.setActiveNotification(null);
    this.notificationsStore.clearError();
    this.#startCompose();
  }

  onEditNotification(): void {
    this.notificationsStore.clearError();
    this.#startCompose();
  }

  onCancelCompose(): void {
    this.isComposing.set(false);
    this.notificationsStore.clearError();
  }

  onPageChange(page: number): void {
    this.filterPage.set(page === 1 ? null : page);
  }

  onSaveDraft(payload: SubmitNotification): void {
    const current = this.activeNotification();
    this.#upsertDraft({
      currentNotificationId: current?.id,
      dto: payload.dto,
      attachments: payload.attachments
    });
  }

  onSend(payload: SubmitNotification): void {
    const current = this.activeNotification();
    if (!current) return;
    const hasAttachments = payload.attachments.length > 0;
    this.notificationsStore.updateWithAttachments({
      id: current.id,
      dto: payload.dto,
      attachments: hasAttachments ? payload.attachments : undefined,
      onSuccess: () => {
        this.notificationsStore.send({
          notificationId: current.id,
          onSuccess: () => this.#handleComposeSuccess({ notificationId: current.id, hasAttachments })
        });
      }
    });
  }

  resendNotification(notification: INotification): void {
    if (this.notificationsStore.isSaving()) return;
    this.notificationsStore.send({ notificationId: notification.id });
  }

  deleteNotification(notification: INotification): void {
    this.#confirmationService.confirm({
      header: 'Supprimer la notification',
      message: `Supprimer « ${notification.title} » ?`,
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.notificationsStore.delete({ id: notification.id });
      }
    });
  }

  #startCompose(): void {
    this.isComposing.set(true);
  }

  #upsertDraft(params: { currentNotificationId?: string; dto: NotifyParticipantsDto; attachments: File[] }): void {
    const hasAttachments = params.attachments.length > 0;
    if (!params.currentNotificationId) {
      this.notificationsStore.create({
        projectId: this.project()?.id,
        dto: params.dto,
        attachments: hasAttachments ? params.attachments : undefined,
        onSuccess: (createdNotification) => {
          this.#handleComposeSuccess({
            notificationId: createdNotification.id,
            hasAttachments,
            activeNotification: hasAttachments ? undefined : createdNotification
          });
        }
      });
      return;
    }
    this.notificationsStore.updateWithAttachments({
      id: params.currentNotificationId,
      dto: params.dto,
      attachments: hasAttachments ? params.attachments : undefined,
      onSuccess: () => this.#handleComposeSuccess({ notificationId: params.currentNotificationId, hasAttachments })
    });
  }

  #handleComposeSuccess(params: {
    hasAttachments: boolean;
    activeNotification?: INotification;
    notificationId?: string;
  }): void {
    this.isComposing.set(false);
    if (!params.hasAttachments) {
      if (params.activeNotification) this.notificationsStore.setActiveNotification(params.activeNotification);
      return;
    }
    this.notificationsStore.loadAllAndSelectNotification({
      projectId: this.project()?.id,
      filters: this.queryParams(),
      notificationId: params.notificationId || ''
    });
  }
}
