import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArrowLeft, CheckCheck, LucideAngularModule } from 'lucide-angular';
import { ParticipationsStore } from '@features/projects/store/participations.store';
import { ApiImgPipe } from '@shared/pipes';
import { IPhase, IProjectParticipation } from '@shared/models';
import { SelectOption, UiAvatar, UiBadge, UiButton, UiCheckbox, UiInput, UiSelect, UiTextarea } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';

@Component({
  selector: 'app-project-participation-details',
  templateUrl: './project-participation-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    LucideAngularModule,
    UiAvatar,
    UiBadge,
    UiButton,
    UiCheckbox,
    UiInput,
    UiSelect,
    UiTextarea,
    UiTableSkeleton,
    ApiImgPipe
  ]
})
export class ProjectParticipationDetails implements OnDestroy {
  participationId = input.required<string>();
  #fb = inject(FormBuilder);
  store = inject(ParticipationsStore);
  back = output<void>();
  icons = { ArrowLeft, CheckCheck };
  reviewForm = this.#fb.group({
    phaseId: ['', Validators.required],
    score: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    message: [''],
    notifyParticipant: [false]
  });
  participation = computed<IProjectParticipation | null>(() => this.store.participation());
  isLoading = computed(() => this.store.isDetailLoading());
  isSaving = computed(() => this.store.isSaving());
  error = computed(() => this.store.participationError());
  latestPhase = computed(() => {
    const detail = this.participation();
    if (!detail?.phases.length) return null;
    return [...detail.phases].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
  });
  reviewPhaseOptions = computed<SelectOption[]>(() => {
    const detail = this.participation();
    if (!detail) return [];
    return [...detail.phases]
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      .map((phase) => ({ label: phase.name, value: phase.id }));
  });

  constructor() {
    effect(() => {
      this.store.loadOne(this.participationId());
    });

    effect(() => {
      const participation = this.participation();
      if (!participation) return;

      this.reviewForm.patchValue({
        phaseId: this.latestPhase()?.id ?? '',
        score: '',
        message: participation.review_message ?? '',
        notifyParticipant: false
      });
    });
  }

  ngOnDestroy(): void {
    this.store.clearParticipation();
  }

  reviewedPhaseName(): string {
    const phaseId = this.reviewForm.get('phaseId')?.value;
    return this.reviewPhaseOptions().find((option) => option.value === phaseId)?.label ?? 'Aucune phase sélectionnée';
  }

  trackPhase(phase: IPhase): string {
    return phase.id;
  }

  participantLocation(): string {
    const detail = this.participation();
    return [detail?.user.city, detail?.user.country].filter(Boolean).join(', ') || 'Non renseignée';
  }

  reviewerLabel(): string {
    const reviewer = this.participation()?.reviewed_by;
    if (!reviewer) return 'Aucune revue enregistrée';
    return `${reviewer.name} • ${reviewer.email}`;
  }

  onSubmitReview(): void {
    const participationId = this.participationId();
    if (!participationId) return;

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const value = this.reviewForm.getRawValue();
    const message = value.message?.trim();

    this.store.review({
      participationId,
      dto: {
        phaseId: value.phaseId!,
        score: Number(value.score),
        message: message || undefined,
        notifyParticipant: !!value.notifyParticipant
      },
      onSuccess: () => this.store.loadOne(participationId)
    });
  }
}
