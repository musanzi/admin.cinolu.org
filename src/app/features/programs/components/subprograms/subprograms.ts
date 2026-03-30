import { Component, inject, signal, ChangeDetectionStrategy, computed, input, OnInit } from '@angular/core';
import { LucideAngularModule, Pencil, Trash, Eye, Star, Plus } from 'lucide-angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubprogramsStore } from '../../store/subprograms.store';
import { ISubprogram } from '@shared/models';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { Program } from '@shared/models';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import {
  UiButton,
  UiInput,
  UiConfirmDialog,
  FileUpload,
  UiAvatar,
  UiTextarea,
  UiBadge,
  UiPagination,
  UiSelect
} from '@ui';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-list-subprograms',
  templateUrl: './subprograms.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubprogramsStore],
  imports: [
    LucideAngularModule,
    DatePipe,
    UiButton,
    UiInput,
    ReactiveFormsModule,
    UiConfirmDialog,
    FileUpload,
    ApiImgPipe,
    UiAvatar,
    UiTableSkeleton,
    UiTextarea,
    UiBadge,
    UiPagination,
    UiSelect
  ]
})
export class ListSubprograms implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  readonly store = inject(SubprogramsStore);
  programs = input<Program[]>([]);
  programId = input.required<string>();
  form = this.fb.nonNullable.group({
    programId: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required]
  });
  icons = { Pencil, Plus, Trash, Eye, Star };
  isCreating = signal(false);
  editingSubprogram = signal<ISubprogram | null>(null);
  isFormVisible = computed(() => this.isCreating() || !!this.editingSubprogram());
  currentPage = signal(1);
  itemsPerPage = 10;
  paginatedSubprograms = computed(() => {
    const subprograms = this.store.subprograms();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return subprograms.slice(start, end);
  });

  ngOnInit(): void {
    this.loadAll(this.programId());
  }

  loadAll(programId?: string): void {
    const id = programId;
    if (!id) return;
    this.store.loadAll(id);
  }

  onShowcase(id: string): void {
    this.store.showcase(id);
  }

  onPublishProgram(id: string): void {
    this.store.publish(id);
  }

  onToggleCreation(): void {
    if (this.isCreating()) {
      this.onCancelForm();
      return;
    }
    this.editingSubprogram.set(null);
    this.isCreating.set(true);
    this.resetForm();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onCancelForm(): void {
    this.isCreating.set(false);
    this.editingSubprogram.set(null);
    this.resetForm();
  }

  onEdit(subprogram: ISubprogram): void {
    this.editingSubprogram.set(subprogram);
    this.isCreating.set(true);
    this.form.patchValue({
      programId: subprogram.program?.id || '',
      name: subprogram.name,
      description: subprogram.description
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const values = this.form.getRawValue();
    const programId = values.programId || '';
    const editing = this.editingSubprogram();

    if (editing) {
      this.store.update({
        payload: {
          id: editing.id,
          programId,
          name: values.name,
          description: values.description
        },
        onSuccess: () => {
          this.onCancelForm();
          this.loadAll();
        }
      });
      return;
    }

    this.store.create({
      payload: {
        id: '',
        programId,
        name: values.name,
        description: values.description
      },
      onSuccess: () => {
        this.onCancelForm();
        this.loadAll();
      }
    });
  }

  onDelete(subprogramId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce sous-programme ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(subprogramId);
        this.loadAll();
      }
    });
  }

  private resetForm(): void {
    this.form.reset({ programId: '', name: '', description: '' });
  }
}
