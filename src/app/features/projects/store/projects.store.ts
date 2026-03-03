import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from '@shared/services/toast/toastr.service';
import { IProject, IProjectParticipation } from '@shared/models';
import { buildQueryParams } from '@shared/helpers';
import { FilterProjectCategoriesDto } from '../dto/categories/filter-categories.dto';
import { ProjectDto } from '../dto/projects/project.dto';
import { MoveParticipationsDto } from '../dto/phases/move-participations.dto';
import { FilterParticipationsDto } from '../dto/phases/filter-participations.dto';

interface IProjectsStore {
  isLoading: boolean;
  isImportingCsv: boolean;
  isLoadingParticipations: boolean;
  isManagingParticipations: boolean;
  projects: [IProject[], number];
  project: IProject | null;
  participations: [IProjectParticipation[], number];
}

export const ProjectsStore = signalStore(
  withState<IProjectsStore>({
    isLoading: false,
    isImportingCsv: false,
    isLoadingParticipations: false,
    isManagingParticipations: false,
    projects: [[], 0],
    project: null,
    participations: [[], 0]
  }),
  withProps(() => ({
    _http: inject(HttpClient),
    _router: inject(Router),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _router, _toast, ...store }) => ({
    loadAll: rxMethod<FilterProjectCategoriesDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((queryParams) => {
          const params = buildQueryParams(queryParams);
          return _http.get<{ data: [IProject[], number] }>('projects', { params }).pipe(
            map(({ data }) => {
              patchState(store, { isLoading: false, projects: data });
            }),
            catchError(() => {
              patchState(store, { isLoading: false, projects: [[], 0] });
              return of(null);
            })
          );
        })
      )
    ),
    loadOne: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((slug) => {
          return _http.get<{ data: IProject }>(`projects/by-slug/${slug}`).pipe(
            tap(({ data }) => {
              patchState(store, { isLoading: false, project: data });
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              return of(null);
            })
          );
        })
      )
    ),
    loadParticipations: rxMethod<{ projectId: string; dto: FilterParticipationsDto }>(
      pipe(
        tap(() => patchState(store, { isLoadingParticipations: true, participations: [[], 0] })),
        switchMap(({ projectId, dto }) => {
          const params = buildQueryParams(dto);
          return _http.get<{ data: [IProjectParticipation[], number] }>(`projects/${projectId}/participations`, {
            params
          }).pipe(
            map(({ data }) => patchState(store, { participations: data ?? [[], 0], isLoadingParticipations: false })),
            catchError(() => {
              patchState(store, { participations: [[], 0], isLoadingParticipations: false });
              return of(null);
            })
          );
        })
      )
    ),
    moveParticipations: rxMethod<{ dto: MoveParticipationsDto; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isManagingParticipations: true })),
        switchMap(({ dto, onSuccess }) =>
          _http.post<void>('projects/participants/move', dto).pipe(
            map(() => {
              _toast.showSuccess('Les participants ont été déplacés avec succès');
              patchState(store, { isManagingParticipations: false });
              onSuccess();
            }),
            catchError(() => {
              _toast.showError("Une erreur s'est produite lors du déplacement des participants");
              patchState(store, { isManagingParticipations: false });
              return of(null);
            })
          )
        )
      )
    ),
    removeParticipations: rxMethod<{ dto: MoveParticipationsDto; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isManagingParticipations: true })),
        switchMap(({ dto, onSuccess }) =>
          _http.post<void>('projects/participants/remove', dto).pipe(
            map(() => {
              _toast.showSuccess('Les participants ont été retirés avec succès');
              patchState(store, { isManagingParticipations: false });
              onSuccess();
            }),
            catchError(() => {
              _toast.showError("Une erreur s'est produite lors du retrait des participants");
              patchState(store, { isManagingParticipations: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<ProjectDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((project) => {
          return _http.post<{ data: IProject }>('projects', project).pipe(
            map(({ data }) => {
              _toast.showSuccess('Le projet a été ajouté avec succès');
              _router.navigate(['/projects']);
              patchState(store, { isLoading: false, project: data });
            }),
            catchError(() => {
              _toast.showError("Une erreur s'est produite lors de l'ajout du projet");
              patchState(store, { isLoading: false, project: null });
              return of(null);
            })
          );
        })
      )
    ),
    update: rxMethod<ProjectDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((project) => {
          return _http.patch<{ data: IProject }>(`projects/${project.id}`, project).pipe(
            map(({ data }) => {
              _toast.showSuccess('Le projet a été mis à jour avec succès');
              _router.navigate(['/projects']);
              const [list, count] = store.projects();
              const updated = list.map((p) => (p.id === data.id ? data : p));
              patchState(store, { isLoading: false, project: data, projects: [updated, count] });
            }),
            catchError(() => {
              _toast.showError("Une erreur s'est produite lors de la mise à jour");
              patchState(store, { isLoading: false });
              return of(null);
            })
          );
        })
      )
    ),
    publish: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) => {
          return _http.patch<{ data: IProject }>(`projects/${id}/publish`, {}).pipe(
            map(({ data }) => {
              const [list, count] = store.projects();
              const updated = list.map((p) => (p.id === data.id ? data : p));
              patchState(store, { isLoading: false, projects: [updated, count], project: data });
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              return of(null);
            })
          );
        })
      )
    ),
    showcase: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) => {
          return _http.patch<{ data: IProject }>(`projects/${id}/highlight`, {}).pipe(
            map(({ data }) => {
              const [list, count] = store.projects();
              const updated = list.map((p) => (p.id === data.id ? data : p));
              _toast.showSuccess('Projet mis en avant avec succès');
              patchState(store, { isLoading: false, projects: [updated, count], project: data });
            }),
            catchError(() => {
              _toast.showError('Erreur lors de la mise en avant du projet');
              patchState(store, { isLoading: false });
              return of(null);
            })
          );
        })
      )
    ),
    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) => {
          return _http.delete<{ data: IProject }>(`projects/${id}`).pipe(
            tap(() => {
              const [list, count] = store.projects();
              const filtered = list.filter((p) => p.id !== id);
              _toast.showSuccess('Le projet a été supprimé avec succès');
              patchState(store, { isLoading: false, projects: [filtered, Math.max(0, count - 1)], project: null });
            }),
            catchError(() => {
              _toast.showError("Une erreur s'est produite lors de la suppression");
              patchState(store, { isLoading: false });
              return of(null);
            })
          );
        })
      )
    ),
    importParticipantsCsv: rxMethod<{ projectId: string; file: File; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isImportingCsv: true })),
        switchMap(({ projectId, file, onSuccess }) => {
          const formData = new FormData();
          formData.append('file', file);
          return _http.post<unknown>(`projects/${projectId}/participants/import-csv`, formData).pipe(
            map(() => {
              _toast.showSuccess('Les participants ont été importés avec succès');
              patchState(store, { isImportingCsv: false });
              onSuccess();
            }),
            catchError(() => {
              _toast.showError("Une erreur s'est produite lors de l'import des participants");
              patchState(store, { isImportingCsv: false });
              return of(null);
            })
          );
        })
      )
    )
  }))
);
