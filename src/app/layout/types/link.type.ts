import type { LucideIconData } from '@shared/data';

export interface ILink {
  name: string;
  external?: boolean;
  description?: string;
  fragment?: string;
  icon?: LucideIconData;
  path?: string;
  exactUrl?: boolean;
  children?: ILink[];
  open?: boolean;
}

export interface ILinkGroup {
  title: string;
  links: ILink[];
}
