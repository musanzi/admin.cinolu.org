import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { buildQueryParams } from '@shared/helpers';
import { IResource } from '@shared/models';
import { ToastrService } from '@shared/services/toast/toastr.service';
import { CreateResourceDto, UpdateResourceDto } from '../dto/resources/create-resource.dto';
import { FilterResourcesDto } from '../dto/resources/filter-resources.dto';

interface ResourcesStoreState {
  isLoading: boolean;
  isSaving: boolean;
  resources: [IResource[], number];
}

export const ResourcesStore = signalStore(
  withState<ResourcesStoreState>({
    isLoading: false,
    isSaving: false,
    resources: [[], 0]
  }),
  withProps(() => ({
    http: inject(HttpClient),
    toast: inject(ToastrService)
  })),
  withComputed(({ resources }) => ({
    list: computed(() => resources()[0]),
    total: computed(() => resources()[1])
  })),
  withMethods(({ http, toast, ...store }) => {
    const upsert = (resource: IResource): void => {
      const [list, total] = store.resources();
      const exists = list.some((item) => item.id === resource.id);
      patchState(store, {
        resources: [
          exists ? list.map((item) => (item.id === resource.id ? resource : item)) : [resource, ...list],
          exists ? total : total + 1
        ]
      });
    };
    return {
      loadAll: rxMethod<{ projectId: string; filters: FilterResourcesDto }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((params) => {
            const queryParams = buildQueryParams(params.filters);
            return http
              .get<{ data: [IResource[], number] }>(`resources/project/${params.projectId}`, { params: queryParams })
              .pipe(
                tap(({ data }) => patchState(store, { isLoading: false, resources: data })),
                catchError(() => {
                  patchState(store, { isLoading: false, resources: [[], 0] });
                  return of(null);
                })
              );
          })
        )
      ),
      create: rxMethod<{ dto: CreateResourceDto; file: File; onSuccess?: () => void }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ dto, file, onSuccess }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', dto.title);
            formData.append('description', dto.description);
            formData.append('category', dto.category);
            if (dto.project_id) formData.append('project_id', dto.project_id);
            if (dto.phase_id) formData.append('phase_id', dto.phase_id);
            return http.post<{ data: IResource }>('resources', formData).pipe(
              tap(({ data }) => {
                upsert(data);
                patchState(store, { isSaving: false });
                toast.showSuccess('La ressource a été créée avec succès');
                onSuccess?.();
              }),
              catchError(() => {
                patchState(store, { isSaving: false });
                toast.showError("Une erreur s'est produite lors de la création de la ressource");
                return of(null);
              })
            );
          })
        )
      ),
      update: rxMethod<{ id: string; dto: UpdateResourceDto; onSuccess?: () => void }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, dto, onSuccess }) =>
            http.patch<{ data: IResource }>(`resources/${id}`, dto).pipe(
              tap(({ data }) => {
                upsert(data);
                patchState(store, { isSaving: false });
                toast.showSuccess('La ressource a été mise à jour');
                onSuccess?.();
              }),
              catchError(() => {
                patchState(store, { isSaving: false });
                toast.showError("Une erreur s'est produite lors de la mise à jour");
                return of(null);
              })
            )
          )
        )
      ),
      replaceFile: rxMethod<{ id: string; file: File }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, file }) => {
            const formData = new FormData();
            formData.append('file', file);
            return http.patch<{ data: IResource }>(`ressources/file/${id}`, formData).pipe(
              tap(({ data }) => {
                upsert(data);
                patchState(store, { isSaving: false });
                toast.showSuccess('Le fichier a été remplacé');
              }),
              catchError(() => {
                patchState(store, { isSaving: false });
                toast.showError("Une erreur s'est produite lors du remplacement du fichier");
                return of(null);
              })
            );
          })
        )
      ),
      delete: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((id) =>
            http.delete<void>(`resources/${id}`).pipe(
              tap(() => {
                const [list, total] = store.resources();
                patchState(store, {
                  isSaving: false,
                  resources: [list.filter((item) => item.id !== id), Math.max(0, total - 1)]
                });
                toast.showSuccess('La ressource a été supprimée');
              }),
              catchError(() => {
                patchState(store, { isSaving: false });
                toast.showError("Une erreur s'est produite lors de la suppression");
                return of(null);
              })
            )
          )
        )
      )
    };
  })
);
