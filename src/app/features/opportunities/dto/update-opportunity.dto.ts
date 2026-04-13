import type { OpportunityLanguage } from '@shared/models';

export interface UpdateOpportunityDto {
  title?: string;
  description?: string;
  due_date?: string;
  link?: string;
  language?: OpportunityLanguage;
}
