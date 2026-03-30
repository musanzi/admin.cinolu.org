import { Component, effect, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgramsStore } from '../../store/programs.store';
import { ProgramCategoriesStore } from '../../store/program-categories.store';
import { ProgramSectorsStore } from '../../store/program-sectors.store';
import { SquarePen, Trash2, Funnel, Tag, Star, Eye } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { UiTabs, FileUpload, UiInput } from '@shared/ui';
import { Program } from '@shared/models';
import { ListSubprograms } from '../../components/subprograms/subprograms';
import { UiButton, UiSelect, UiTextarea } from '@shared/ui';

@Component({
  selector: 'app-update-program',
  providers: [ProgramsStore, ProgramCategoriesStore, ProgramSectorsStore],
  imports: [
    UiTabs,
    ReactiveFormsModule,
    UiButton,
    FormsModule,
    UiSelect,
    FileUpload,
    LucideAngularModule,
    ListSubprograms,
    UiTextarea,
    UiInput
  ],
  templateUrl: './update-program.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateProgram implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  store = inject(ProgramsStore);
  categoriesStore = inject(ProgramCategoriesStore);
  sectorsStore = inject(ProgramSectorsStore);
  activeTab = signal('edit');
  icons = { Trash2, Funnel, Tag, Star, Eye };
  tabs = [
    { label: 'Modifier le programme', name: 'edit', icon: SquarePen },
    { label: 'Sous programmes', name: 'subprograms', icon: Tag }
  ];
  updateForm: FormGroup = this.fb.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    sector: ['', Validators.required]
  });
  slug = this.route.snapshot.params['slug'];

  constructor() {
    effect(() => {
      const program = this.store.program();
      if (program) this.patchForm(program);
    });
  }

  ngOnInit(): void {
    if (this.slug) this.store.loadOne(this.slug);
    this.store.loadUnpaginated();
    this.categoriesStore.loadUnpaginated();
    this.sectorsStore.loadAll();
  }

  private patchForm(program: Program | null): void {
    if (!program) return;
    this.updateForm.patchValue({
      ...program,
      category: program.category?.id,
      sector: program.sector?.id ?? ''
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  onSubmit(): void {
    const program = this.store.program();
    if (this.updateForm.invalid || !program) return;
    this.store.update({
      programId: program.id,
      payload: this.updateForm.value
    });
  }

  onCreateSector(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existingSector = this.sectorsStore
      .sectors()
      .find((sector) => sector.name.trim().toLowerCase() === trimmedName.toLowerCase());

    if (existingSector) {
      this.updateForm.patchValue({ sector: existingSector.id });
      return;
    }

    this.sectorsStore.create({
      payload: { name: trimmedName },
      onSuccess: (sector) => {
        this.updateForm.patchValue({ sector: sector.id });
      }
    });
  }

  onShowcase(): void {
    const program = this.store.program();
    if (program) this.store.highlight(program.id);
  }

  onPublish(): void {
    const program = this.store.program();
    if (program) this.store.publishProgram(program.id);
  }
}
