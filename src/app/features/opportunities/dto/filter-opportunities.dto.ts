import type { OpportunityLanguage } from '@shared/models';

export interface FilterOpportunitiesDto {
  from: string | null;
  to: string | null;
  language: OpportunityLanguage | null;
}
