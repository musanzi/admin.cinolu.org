import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { IOpportunity } from '@shared/models';
import { CreateOpportunityDto } from '../dto/create-opportunity.dto';
import { FilterOpportunitiesDto } from '../dto/filter-opportunities.dto';
import { OpportunitiesService, UpdateOpportunityPayload } from '../services/opportunities.service';

interface OpportunitiesState {
  isLoading: boolean;
  opportunities: IOpportunity[];
  opportunity: IOpportunity | null;
}

export const OpportunitiesStore = signalStore(
  withState<OpportunitiesState>({
    isLoading: false,
    opportunities: [],
    opportunity: null
  }),
  withMethods((store) => {
    const service = inject(OpportunitiesService);

    return {
      loadAll: rxMethod<FilterOpportunitiesDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((filters) =>
            service.getAll(filters).pipe(
              tap({
                next: (opportunities) => patchState(store, { isLoading: false, opportunities }),
                error: () => patchState(store, { isLoading: false, opportunities: [] })
              })
            )
          )
        )
      ),
      loadOne: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((opportunityId) =>
            service.getOne(opportunityId).pipe(
              tap({
                next: (opportunity) => patchState(store, { isLoading: false, opportunity }),
                error: () => patchState(store, { isLoading: false, opportunity: null })
              })
            )
          )
        )
      ),
      create: rxMethod<CreateOpportunityDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((payload) =>
            service.create(payload).pipe(
              tap({
                next: (opportunity) => patchState(store, { isLoading: false, opportunity }),
                error: () => patchState(store, { isLoading: false })
              })
            )
          )
        )
      ),
      update: rxMethod<UpdateOpportunityPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((payload) =>
            service.update(payload).pipe(
              tap({
                next: (opportunity) => {
                  const opportunities = store
                    .opportunities()
                    .map((item) => (item.id === opportunity.id ? opportunity : item));
                  patchState(store, { isLoading: false, opportunity, opportunities });
                },
                error: () => patchState(store, { isLoading: false })
              })
            )
          )
        )
      ),
      delete: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((opportunityId) =>
            service.delete(opportunityId).pipe(
              tap({
                next: () => {
                  const opportunities = store.opportunities().filter((item) => item.id !== opportunityId);
                  const current = store.opportunity();
                  patchState(store, {
                    isLoading: false,
                    opportunities,
                    opportunity: current?.id === opportunityId ? null : current
                  });
                },
                error: () => patchState(store, { isLoading: false })
              })
            )
          )
        )
      )
    };
  })
);
