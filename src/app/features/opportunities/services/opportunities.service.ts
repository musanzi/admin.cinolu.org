import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { buildQueryParams, extractApiErrorMessage } from '@shared/helpers';
import { IOpportunity } from '@shared/models';
import { ToastrService } from '@shared/services/toast/toastr.service';
import { CreateOpportunityDto } from '../dto/create-opportunity.dto';
import { FilterOpportunitiesDto } from '../dto/filter-opportunities.dto';
import { UpdateOpportunityDto } from '../dto/update-opportunity.dto';

export type UpdateOpportunityPayload = UpdateOpportunityDto & { id: string };

@Injectable({ providedIn: 'root' })
export class OpportunitiesService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  getAll(filters: FilterOpportunitiesDto): Observable<IOpportunity[]> {
    const params = buildQueryParams(filters);
    return this.http.get<{ data: IOpportunity[] }>('opportunities', { params }).pipe(
      map(({ data }) => data),
      catchError((error) => {
        const message = extractApiErrorMessage(error, 'Impossible de charger les opportunités');
        this.toast.showError(message);
        return throwError(() => message);
      })
    );
  }

  getOne(slug: string): Observable<IOpportunity> {
    return this.http.get<{ data: IOpportunity }>(`opportunities/by-slug/${slug}`).pipe(
      map(({ data }) => data),
      catchError((error) => {
        const message = extractApiErrorMessage(error, "Impossible de charger l'opportunité");
        this.toast.showError(message);
        return throwError(() => message);
      })
    );
  }

  create(payload: CreateOpportunityDto): Observable<IOpportunity> {
    return this.http.post<{ data: IOpportunity }>('opportunities', payload).pipe(
      map(({ data }) => {
        this.toast.showSuccess("L'opportunité a été créée avec succès");
        this.router.navigate(['/opportunities']);
        return data;
      }),
      catchError((error) => {
        const message = extractApiErrorMessage(error, "Une erreur s'est produite lors de la création");
        this.toast.showError(message);
        return throwError(() => message);
      })
    );
  }

  update(payload: UpdateOpportunityPayload): Observable<IOpportunity> {
    const { id, ...body } = payload;
    return this.http.patch<{ data: IOpportunity }>(`opportunities/id/${id}`, body).pipe(
      map(({ data }) => {
        this.toast.showSuccess("L'opportunité a été mise à jour avec succès");
        this.router.navigate(['/opportunities']);
        return data;
      }),
      catchError((error) => {
        const message = extractApiErrorMessage(error, "Une erreur s'est produite lors de la mise à jour");
        this.toast.showError(message);
        return throwError(() => message);
      })
    );
  }

  delete(opportunityId: string): Observable<void> {
    return this.http.delete<void>(`opportunities/id/${opportunityId}`).pipe(
      map(() => {
        this.toast.showSuccess("L'opportunité a été supprimée avec succès");
      }),
      catchError((error) => {
        const message = extractApiErrorMessage(error, "Une erreur s'est produite lors de la suppression");
        this.toast.showError(message);
        return throwError(() => message);
      })
    );
  }
}
