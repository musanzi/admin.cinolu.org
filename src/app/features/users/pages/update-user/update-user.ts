import { Component, inject, OnInit, ChangeDetectionStrategy, computed, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersStore } from '../../store/users.store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GENDERS } from '@shared/data';
import { RolesStore } from '@features/users/store/roles.store';
import { parseDate } from '@shared/helpers';
import { IUser, IRole } from '@shared/models';
import { UiButton, UiDatepicker, UiInput, UiMultiSelect, UiSelect, UiTextarea } from '@ui';
import { UserUpdateFormSkeleton } from '../../ui/user-update-form-skeleton/user-update-form-skeleton';
import { UserNotFoundPlaceholder } from '../../ui/user-not-found-placeholder/user-not-found-placeholder';

@Component({
  selector: 'app-user-update',
  templateUrl: './update-user.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStore, RolesStore],
  imports: [
    UiInput,
    UiButton,
    UiSelect,
    UiDatepicker,
    UiTextarea,
    UiMultiSelect,
    ReactiveFormsModule,
    UserUpdateFormSkeleton,
    UserNotFoundPlaceholder
  ]
})
export class UpdateUser implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly email = this.route.snapshot.params['email'];
  usersStore = inject(UsersStore);
  private readonly fb = inject(FormBuilder);
  store = inject(UsersStore);
  rolesStore = inject(RolesStore);
  genders = GENDERS;
  form = this.initForm();
  user = computed(() => this.usersStore.user());

  ngOnInit(): void {
    this.usersStore.loadOne(this.email);
    this.rolesStore.loadUnpaginated();
  }

  constructor() {
    effect(() => {
      const user = this.user();
      if (!user) return;
      this.patchForm(user);
    });
  }

  private initForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required]],
      name: ['', Validators.required],
      phone_number: [''],
      gender: [''],
      city: [''],
      biography: [''],
      country: [''],
      birth_date: [''],
      roles: [[], Validators.required]
    });
  }

  private patchForm(user: IUser): void {
    this.form.reset({
      ...user,
      birth_date: parseDate(user.birth_date),
      roles: user.roles.map((role: IRole) => role.id)
    });
  }

  onSubmit(): void {
    const user = this.user();
    if (this.form.valid && user) this.store.update({ id: user.id, dto: this.form.value });
  }
}
