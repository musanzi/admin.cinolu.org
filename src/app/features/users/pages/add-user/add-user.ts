import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersStore } from '../../store/users.store';
import { RolesStore } from '../../store/roles.store';
import { GENDERS } from '@shared/data/genders.data';
import { UiButton, UiDatepicker, UiInput, UiMultiSelect, UiSelect } from '@shared/ui';

@Component({
  selector: 'app-user-add',
  templateUrl: './add-user.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStore, RolesStore],
  imports: [UiButton, UiInput, ReactiveFormsModule, UiDatepicker, UiMultiSelect, UiSelect]
})
export class AddUserComponent {
  private readonly fb = inject(FormBuilder);
  addUserForm: FormGroup;
  store = inject(UsersStore);
  rolesStore = inject(RolesStore);
  genders = GENDERS;

  constructor() {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required]],
      name: ['', Validators.required],
      gender: ['', Validators.required],
      phone_number: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      birth_date: [new Date(), Validators.required],
      roles: [[], Validators.required]
    });
    this.rolesStore.loadUnpaginated();
  }

  onAddUser(): void {
    this.store.create(this.addUserForm.value);
  }
}
