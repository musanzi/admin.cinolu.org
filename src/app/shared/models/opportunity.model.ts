import { IBase } from './base.model';

export type OpportunityLanguage = 'fr' | 'en';

export interface IOpportunity extends IBase {
  title: string;
  slug: string;
  description: string;
  cover: string | null;
  due_date: string;
  link: string;
  language: OpportunityLanguage;
}
