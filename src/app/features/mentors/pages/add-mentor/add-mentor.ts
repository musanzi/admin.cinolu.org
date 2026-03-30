import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { markAllAsTouched } from '@shared/helpers';
import { IExpertise } from '@shared/models';
import { SelectOption, UiButton, UiCheckbox, UiDatepicker, UiInput, UiMultiSelect, UiSelect } from '@shared/ui';
import { MentorsStore } from '../../store/mentors.store';
import { ExpertisesStore } from '../../store/expertises.store';
import { MentorType } from '../../enums/mentor.enum';
import { CreateExperienceDto, CreateMentorDto } from '../../dto/mentors/create-mentor.dto';

@Component({
  selector: 'app-add-mentor',
  templateUrl: './add-mentor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MentorsStore, ExpertisesStore],
  imports: [UiInput, UiDatepicker, UiSelect, UiMultiSelect, UiCheckbox, UiButton, ReactiveFormsModule]
})
export class AddMentor {
  private readonly fb = inject(FormBuilder);
  store = inject(MentorsStore);
  expertisesStore = inject(ExpertisesStore);

  mentorTypeOptions: SelectOption[] = [
    { label: 'Coach', value: MentorType.COACH },
    { label: 'Facilitator', value: MentorType.FACILITATOR }
  ];
  isSearchingUsers = this.store.isSearchingUsers;
  currentUserSearchTerm = this.store.userSearchTerm;
  userSearchOptions = computed<SelectOption[]>(() => this.store.userSearchOptions());
  form = this.initForm();

  constructor() {
    this.expertisesStore.loadUnpaginated();
  }

  get experiences(): FormArray<FormGroup> {
    return this.form.get('experiences') as FormArray<FormGroup>;
  }

  addExperience(): void {
    this.experiences.push(this.buildExperienceForm());
  }

  removeExperience(index: number): void {
    if (this.experiences.length <= 1) return;
    this.experiences.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markAllAsTouched(this.form);
      return;
    }
    this.store.create(this.buildPayload());
  }

  onCreateExpertise(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const existingExpertise = this.expertisesStore
      .allExpertises()
      .find((expertise) => expertise.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (existingExpertise) {
      const currentValue = ((this.form.get('expertises')?.value as string[] | null) ?? []).filter(Boolean);
      if (!currentValue.includes(existingExpertise.id)) {
        this.form.patchValue({ expertises: [...currentValue, existingExpertise.id] });
      }
      return;
    }
    this.expertisesStore.create({
      payload: { name: trimmedName },
      onSuccess: (expertise: IExpertise) => {
        const currentValue = ((this.form.get('expertises')?.value as string[] | null) ?? []).filter(Boolean);
        if (!currentValue.includes(expertise.id)) {
          this.form.patchValue({ expertises: [...currentValue, expertise.id] });
        }
      }
    });
  }

  private initForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      years_experience: [0, [Validators.required, Validators.min(0)]],
      expertises: [[], Validators.required],
      type: [''],
      experiences: this.fb.array([this.buildExperienceForm()])
    });
  }

  private buildExperienceForm(
    experience?: Partial<{
      id: string;
      company_name: string;
      job_title: string;
      is_current: boolean;
      start_date: Date | string;
      end_date?: Date | string;
    }>
  ): FormGroup {
    return this.fb.group({
      id: [experience?.id ?? ''],
      company_name: [experience?.company_name ?? '', Validators.required],
      job_title: [experience?.job_title ?? '', Validators.required],
      is_current: [experience?.is_current ?? false],
      start_date: [experience?.start_date ? new Date(String(experience.start_date)) : new Date(), Validators.required],
      end_date: [experience?.end_date ? new Date(String(experience.end_date)) : null]
    });
  }

  private buildPayload(): CreateMentorDto {
    const value = this.form.value;
    const toApiDate = (val: unknown): string | undefined => {
      if (!val) return undefined;
      const date = val instanceof Date ? val : new Date(String(val));
      if (Number.isNaN(date.getTime())) return undefined;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const experiences = this.experiences.controls.map((control) => {
      const row = control.value;
      const isCurrent = Boolean(row['is_current']);
      const id = typeof row['id'] === 'string' ? row['id'].trim() : undefined;
      return {
        id: id || undefined,
        company_name: String(row['company_name']),
        job_title: String(row['job_title']),
        is_current: isCurrent,
        start_date: toApiDate(row['start_date']) || toApiDate(new Date()) || '',
        end_date: isCurrent ? undefined : toApiDate(row['end_date'])
      } satisfies CreateExperienceDto;
    });

    const mentorType = value['type'];
    return {
      email: String(value['email']),
      mentor: {
        years_experience: Number(value['years_experience']),
        expertises: (value['expertises'] as string[]) ?? [],
        type: mentorType === MentorType.COACH || mentorType === MentorType.FACILITATOR ? mentorType : undefined,
        experiences
      }
    };
  }
}
