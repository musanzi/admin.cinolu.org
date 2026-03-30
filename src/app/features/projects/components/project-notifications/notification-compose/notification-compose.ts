import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { AttachmentPreview } from '@features/projects/types/attachments.type';
import { INotification } from '@shared/models';
import { UiButton, UiCheckbox, UiInput, UiSelect, UiTextEditor } from '@shared/ui';
import { CircleAlert, Paperclip, Send, Trash2, X, RotateCcw, LucideAngularModule } from 'lucide-angular';
import { NotificationState, SubmitNotification } from '@features/projects/types';

@Component({
  selector: 'app-notification-compose',
  templateUrl: './notification-compose.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiCheckbox, UiInput, UiSelect, UiTextEditor, LucideAngularModule]
})
export class NotificationCompose {
  state = input.required<NotificationState>();
  saveDraft = output<SubmitNotification>();
  sendNotification = output<SubmitNotification>();
  deleteNotification = output<INotification>();
  private readonly fb = inject(FormBuilder);
  attachments = signal<AttachmentPreview[]>([]);
  icons = { CircleAlert, Paperclip, Send, Trash2, X, RotateCcw };
  actionLoading = signal<'save' | 'send' | null>(null);
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    body: ['', [Validators.required, Validators.minLength(10)]],
    phase_id: [''],
    notify_mentors: [false],
    notify_staff: [false]
  });

  constructor() {
    this.form.controls.phase_id.valueChanges.pipe(takeUntilDestroyed()).subscribe((phaseId) => {
      this.syncRecipientControls(this.state().isEditable, !!phaseId);
    });

    effect(() => {
      const notification = this.state().activeNotification;
      this.attachments.set([]);
      this.form.reset(
        {
          title: notification?.title ?? '',
          body: notification?.body ?? '',
          phase_id: notification?.phase_id ?? '',
          notify_mentors: notification?.notify_mentors ?? false,
          notify_staff: notification?.notify_staff ?? false
        },
        { emitEvent: false }
      );
      this.syncRecipientControls(this.state().isEditable, !!this.form.controls.phase_id.getRawValue());
    });

    effect(() => {
      if (!this.state().isSaving) {
        this.actionLoading.set(null);
      }
    });
  }

  onSelectFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length || !this.state().isEditable) return;
    const current = this.attachments();
    const existing = new Set(current.map((item) => `${item.file.name}:${item.file.size}`));
    const next = files
      .filter((file) => !existing.has(`${file.name}:${file.size}`))
      .slice(0, Math.max(0, 10 - current.length))
      .map((file) => ({ id: crypto.randomUUID(), file }));
    this.attachments.set([...current, ...next]);
    (event.target as HTMLInputElement).value = '';
  }

  onRemoveAttachment(id: string): void {
    this.attachments.update((items) => items.filter((item) => item.id !== id));
  }

  onClearAttachments(): void {
    this.attachments.set([]);
  }

  onSaveDraft(): void {
    if (this.form.invalid || !this.state().isEditable) return;
    this.actionLoading.set('save');
    this.saveDraft.emit(this.buildPayload());
  }

  onSend(): void {
    const active = this.state().activeNotification;
    if (active?.status !== 'sent' && (this.form.invalid || !this.state().isEditable)) return;
    this.actionLoading.set('send');
    this.sendNotification.emit(this.buildPayload());
  }

  onDelete(): void {
    const notification = this.state().activeNotification;
    if (!notification || this.state().isSaving) return;
    this.deleteNotification.emit(notification);
  }

  attachmentUrl(filename: string, url?: string): string {
    if (url) return url;
    return `${environment.apiUrl}uploads/notifications/${filename}`;
  }

  private buildPayload(): SubmitNotification {
    const { title, body, phase_id, notify_mentors, notify_staff } = this.form.getRawValue();
    return {
      dto: {
        title,
        body,
        phase_id: phase_id || null,
        notify_mentors: !!phase_id && notify_mentors,
        notify_staff
      },
      attachments: this.attachments().map((item) => item.file)
    };
  }

  private syncRecipientControls(isEditable: boolean, hasPhase: boolean): void {
    if (!isEditable) {
      this.form.disable({ emitEvent: false });
      return;
    }

    this.form.enable({ emitEvent: false });

    if (hasPhase) {
      this.form.controls.notify_mentors.enable({ emitEvent: false });
      this.form.controls.notify_staff.disable({ emitEvent: false });
      this.form.controls.notify_staff.setValue(false, { emitEvent: false });
      return;
    }

    this.form.controls.notify_mentors.disable({ emitEvent: false });
    this.form.controls.notify_mentors.setValue(false, { emitEvent: false });
    this.form.controls.notify_staff.enable({ emitEvent: false });
  }
}
