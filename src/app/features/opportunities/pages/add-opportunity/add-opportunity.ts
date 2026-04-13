import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { markAllAsTouched } from '@shared/helpers';
import { OpportunityLanguage } from '@shared/models';
import { SelectOption, UiButton, UiDatepicker, UiInput, UiSelect, UiTextarea } from '@shared/ui';
import { OpportunitiesStore } from '../../store/opportunities.store';

@Component({
  selector: 'app-add-opportunity',
  templateUrl: './add-opportunity.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OpportunitiesStore],
  imports: [ReactiveFormsModule, UiButton, UiDatepicker, UiInput, UiSelect, UiTextarea]
})
export class AddOpportunity {
  private readonly fb = inject(FormBuilder);
  store = inject(OpportunitiesStore);
  languageOptions: SelectOption[] = [
    { label: 'Français', value: 'fr' satisfies OpportunityLanguage },
    { label: 'English', value: 'en' satisfies OpportunityLanguage }
  ];
  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    due_date: [null as Date | null, Validators.required],
    link: ['', Validators.required],
    language: ['fr' as OpportunityLanguage, Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      markAllAsTouched(this.form);
      return;
    }

    const value = this.form.getRawValue();
    this.store.create({
      title: String(value.title),
      description: String(value.description),
      due_date: this.toApiDate(value.due_date),
      link: String(value.link),
      language: value.language as OpportunityLanguage
    });
  }

  private toApiDate(value: unknown): string {
    const date = value instanceof Date ? value : new Date(String(value));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
