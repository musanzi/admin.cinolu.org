import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { extractApiErrorMessage } from '@shared/helpers';
import { ToastrService } from '@shared/services/toast/toastr.service';
import { ISector } from '@shared/models';
import { ProgramSectorDto } from '../dto/sectors/program-sector.dto';

interface IProgramSectorsStore {
  isLoading: boolean;
  sectors: ISector[];
}

export const ProgramSectorsStore = signalStore(
  withState<IProgramSectorsStore>({
    isLoading: false,
    sectors: []
  }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _toast, ...store }) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          _http.get<{ data: ISector[] }>('program-sectors').pipe(
            map(({ data }) => {
              patchState(store, { isLoading: false, sectors: data });
            }),
            catchError(() => {
              patchState(store, { isLoading: false, sectors: [] });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<{ payload: ProgramSectorDto; onSuccess: (sector: ISector) => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ payload, onSuccess }) =>
          _http.post<{ data: ISector }>('program-sectors', payload).pipe(
            map(({ data }) => {
              patchState(store, { isLoading: false, sectors: [data, ...store.sectors()] });
              _toast.showSuccess('Secteur ajouté avec succès');
              onSuccess(data);
            }),
            catchError((error) => {
              _toast.showError(extractApiErrorMessage(error, "Échec de l'ajout du secteur"));
              patchState(store, { isLoading: false });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; payload: ProgramSectorDto; onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload, onSuccess }) =>
          _http.patch<{ data: ISector }>(`program-sectors/id/${id}`, payload).pipe(
            map(({ data }) => {
              const updated = store.sectors().map((sector) => (sector.id === data.id ? data : sector));
              patchState(store, { isLoading: false, sectors: updated });
              _toast.showSuccess('Secteur mis à jour');
              onSuccess();
            }),
            catchError((error) => {
              _toast.showError(extractApiErrorMessage(error, 'Échec de la mise à jour du secteur'));
              patchState(store, { isLoading: false });
              return of(null);
            })
          )
        )
      )
    ),
    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          _http.delete<void>(`program-sectors/id/${id}`).pipe(
            map(() => {
              const filtered = store.sectors().filter((sector) => sector.id !== id);
              patchState(store, { isLoading: false, sectors: filtered });
              _toast.showSuccess('Secteur supprimé avec succès');
            }),
            catchError((error) => {
              _toast.showError(extractApiErrorMessage(error, 'Échec de la suppression du secteur'));
              patchState(store, { isLoading: false });
              return of(null);
            })
          )
        )
      )
    )
  }))
);
