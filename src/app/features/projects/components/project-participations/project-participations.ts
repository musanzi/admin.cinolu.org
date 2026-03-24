import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  Download,
  RefreshCcw,
  Search,
  Upload,
  X
} from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiImgPipe } from '@shared/pipes';
import { IPhase, IProject, IProjectParticipation, ParticipationStatus } from '@shared/models';
import { ToastrService } from '@shared/services/toast/toastr.service';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { SelectOption, UiAvatar, UiBadge, UiButton, UiCheckbox, UiPagination, UiSelect, UiTextarea } from '@shared/ui';
import { ParticipationsStore } from '@features/projects/store/participations.store';
import { ProjectsStore } from '@features/projects/store/projects.store';
import { toPageQueryValue, toSearchQueryValue } from '@shared/helpers';

@Component({
  selector: 'app-project-participations',
  templateUrl: './project-participations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ParticipationsStore],
  imports: [
    DatePipe,
    ReactiveFormsModule,
    LucideAngularModule,
    UiAvatar,
    UiBadge,
    UiButton,
    UiCheckbox,
    UiPagination,
    UiSelect,
    UiTextarea,
    UiTableSkeleton,
    ApiImgPipe
  ]
})
export class ProjectParticipations {
  readonly project = input.required<IProject>();
  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly #toast = inject(ToastrService);
  readonly projectStore = inject(ProjectsStore);
  readonly store = inject(ParticipationsStore);
  readonly csvFileInput = viewChild<ElementRef<HTMLInputElement>>('csvFileInput');

  readonly queryParams = signal<{
    page: number | null;
    q: string | null;
    phaseId: string | null;
    status: ParticipationStatus | null;
  }>({
    page: null,
    q: null,
    phaseId: null,
    status: null
  });
  readonly selectedIds = signal<string[]>([]);
  readonly selectedParticipationId = signal<string | null>(null);

  readonly filtersForm = this.#fb.group({
    q: [''],
    phaseId: [''],
    status: ['']
  });
  readonly batchForm = this.#fb.group({
    phaseId: ['', Validators.required]
  });
  readonly reviewForm = this.#fb.group({
    status: ['pending' as ParticipationStatus, Validators.required],
    review_message: ['']
  });

  readonly itemsPerPage = 20;
  readonly icons = { Search, Upload, Download, ArrowRight, ArrowLeft, X, CheckCheck, RefreshCcw };
  readonly statusOptions: SelectOption[] = [
    { label: 'En attente', value: 'pending' },
    { label: 'En revue', value: 'in_review' },
    { label: 'Qualifié', value: 'qualified' },
    { label: 'Disqualifié', value: 'disqualified' },
    { label: 'Informations demandées', value: 'info_requested' }
  ];
  readonly currentPage = computed(() => this.queryParams().page || 1);
  readonly list = computed(() => this.store.list());
  readonly total = computed(() => this.store.total());
  readonly allSelectedOnPage = computed(() => {
    const ids = this.list().map((participation) => participation.id);
    return ids.length > 0 && ids.every((id) => this.selectedIds().includes(id));
  });
  readonly phaseOptions = computed<SelectOption[]>(() =>
    [...this.project().phases]
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      .map((phase) => ({ label: phase.name, value: phase.id }))
  );

  constructor() {
    effect(() => {
      this.store.loadAll({
        projectId: this.project().id,
        filters: this.queryParams()
      });
    });

    effect(() => {
      const pageIds = new Set(this.list().map((participation) => participation.id));
      this.selectedIds.update((ids) => ids.filter((id) => pageIds.has(id)));
    });

    effect(() => {
      const participation = this.store.participation();
      if (!participation) return;
      this.reviewForm.patchValue({
        status: participation.status ?? 'pending',
        review_message: participation.review_message ?? ''
      });
    });

    this.filtersForm
      .get('q')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        this.queryParams.update((query) => ({
          ...query,
          q: toSearchQueryValue(value),
          page: null
        }));
      });

    this.filtersForm
      .get('phaseId')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        this.queryParams.update((query) => ({
          ...query,
          phaseId: value || null,
          page: null
        }));
      });

    this.filtersForm
      .get('status')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        this.queryParams.update((query) => ({
          ...query,
          status: (value as ParticipationStatus) || null,
          page: null
        }));
      });

    this.reviewForm
      .get('status')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        const reviewMessageControl = this.reviewForm.get('review_message');
        if (value === 'info_requested') {
          reviewMessageControl?.addValidators([Validators.required, Validators.minLength(3)]);
        } else {
          reviewMessageControl?.removeValidators([Validators.required, Validators.minLength(3)]);
        }
        reviewMessageControl?.updateValueAndValidity({ emitEvent: false });
      });
  }

  statusLabel(status: ParticipationStatus | undefined): string {
    switch (status) {
      case 'in_review':
        return 'En revue';
      case 'qualified':
        return 'Qualifié';
      case 'disqualified':
        return 'Disqualifié';
      case 'info_requested':
        return 'Informations demandées';
      default:
        return 'En attente';
    }
  }

  statusVariant(status: ParticipationStatus | undefined): 'default' | 'info' | 'success' | 'danger' | 'warning' {
    switch (status) {
      case 'in_review':
        return 'info';
      case 'qualified':
        return 'success';
      case 'disqualified':
        return 'danger';
      case 'info_requested':
        return 'warning';
      default:
        return 'default';
    }
  }

  phaseSummary(participation: IProjectParticipation): string {
    if (!participation.phases.length) return 'Aucune phase';
    return participation.phases.map((phase) => phase.name).join(', ');
  }

  onPageChange(page: number): void {
    this.queryParams.update((query) => ({
      ...query,
      page: Number(toPageQueryValue(page) ?? 1)
    }));
  }

  onResetFilters(): void {
    this.filtersForm.patchValue({ q: '', phaseId: '', status: '' }, { emitEvent: false });
    this.queryParams.set({ page: null, q: null, phaseId: null, status: null });
  }

  onSelectParticipation(id: string): void {
    this.selectedParticipationId.set(id);
    this.store.loadOne(id);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  #readCheckboxValue(value: boolean | Event): boolean {
    if (typeof value === 'boolean') return value;
    const target = value.target as HTMLInputElement | null;
    return !!target?.checked;
  }

  toggleSelection(id: string, checked: boolean | Event): void {
    const nextChecked = this.#readCheckboxValue(checked);
    this.selectedIds.update((ids) => {
      if (nextChecked) {
        return ids.includes(id) ? ids : [...ids, id];
      }
      return ids.filter((item) => item !== id);
    });
  }

  toggleAll(checked: boolean | Event): void {
    const nextChecked = this.#readCheckboxValue(checked);
    const pageIds = this.list().map((participation) => participation.id);
    this.selectedIds.update((ids) => {
      if (nextChecked) {
        return Array.from(new Set([...ids, ...pageIds]));
      }
      return ids.filter((id) => !pageIds.includes(id));
    });
  }

  runBatchAction(mode: 'move' | 'remove'): void {
    if (!this.selectedIds().length) {
      this.#toast.showError('Sélectionnez au moins une participation');
      return;
    }

    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      return;
    }

    const phaseId = this.batchForm.getRawValue().phaseId!;
    const action = mode === 'move' ? this.store.moveToPhase : this.store.removeFromPhase;
    action({
      ids: this.selectedIds(),
      phaseId,
      onSuccess: () => {
        this.selectedIds.set([]);
        this.reloadCurrentData();
      }
    });
  }

  onSubmitReview(): void {
    const participationId = this.selectedParticipationId();
    if (!participationId) return;

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const value = this.reviewForm.getRawValue();
    const reviewMessage = value.review_message?.trim();
    this.store.review({
      participationId,
      dto: {
        status: value.status as ParticipationStatus,
        review_message: reviewMessage ? reviewMessage : undefined
      },
      onSuccess: () => this.reloadCurrentData()
    });
  }

  closeDetails(): void {
    this.selectedParticipationId.set(null);
    this.store.clearParticipation();
  }

  triggerCsvFileSelect(): void {
    this.csvFileInput()?.nativeElement?.click();
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.#toast.showError('Le fichier doit être au format CSV');
      input.value = '';
      return;
    }

    this.projectStore.importParticipantsCsv({
      projectId: this.project().id,
      file,
      onSuccess: () => {
        this.reloadCurrentData();
        this.projectStore.loadOne(this.project().slug);
      }
    });

    input.value = '';
  }

  reloadCurrentData(): void {
    this.store.loadAll({
      projectId: this.project().id,
      filters: this.queryParams()
    });

    if (this.selectedParticipationId()) {
      this.store.loadOne(this.selectedParticipationId()!);
    }
  }

  participantImage(participation: IProjectParticipation): { profile: string } {
    return { profile: participation.user.profile };
  }

  detailImage(): { profile: string } {
    return { profile: this.store.participation()?.user.profile ?? '' };
  }

  detailLoadError(): string | null {
    return this.store.participationError();
  }

  asPhaseTrack(phase: IPhase): string {
    return phase.id;
  }

  rowIsActive(id: string): boolean {
    return this.selectedParticipationId() === id;
  }

  detailReviewerLabel(): string {
    const reviewer = this.store.participation()?.reviewed_by;
    if (!reviewer) return 'Aucun avis enregistré';
    return `${reviewer.name} • ${reviewer.email}`;
  }

  reviewMessageRequired(): boolean {
    return this.reviewForm.get('status')?.value === 'info_requested';
  }
}
