import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@env/environment';

@Pipe({
  name: 'apiIMG',
  pure: true
})
export class ApiImgPipe implements PipeTransform {
  transform(obj: unknown, type: string): string {
    const { apiUrl } = environment;
    const value = obj as Record<string, unknown>;
    switch (type) {
      case 'program':
        return typeof value['logo'] === 'string' && value['logo'] ? `${apiUrl}uploads/programs/${value['logo']}` : '';
      case 'gallery':
        return typeof value['image'] === 'string' && value['image']
          ? `${apiUrl}uploads/galleries/${value['image']}`
          : '';
      case 'subprogram':
        return typeof value['logo'] === 'string' && value['logo']
          ? `${apiUrl}uploads/subprograms/${value['logo']}`
          : '';
      case 'user':
        if (typeof value['profile'] === 'string' && value['profile']) {
          return `${apiUrl}uploads/profiles/${value['profile']}`;
        }
        if (typeof value['google_image'] === 'string' && value['google_image']) {
          return value['google_image'];
        }
        return '';
      case 'project':
        return typeof value['cover'] === 'string' && value['cover']
          ? `${apiUrl}uploads/projects/${value['cover']}`
          : '';
      case 'venture':
        return typeof value['logo'] === 'string' && value['logo']
          ? `${apiUrl}uploads/ventures/logos/${value['logo']}`
          : '';

      case 'ventureCover':
        return typeof value['cover'] === 'string' && value['cover']
          ? `${apiUrl}uploads/ventures/covers/${value['cover']}`
          : '';

      case 'article':
        return typeof value['image'] === 'string' && value['image']
          ? `${apiUrl}uploads/articles/${value['image']}`
          : '';

      case 'event':
        return typeof value['cover'] === 'string' && value['cover'] ? `${apiUrl}uploads/events/${value['cover']}` : '';
      case 'opportunity':
        return typeof value['cover'] === 'string' && value['cover']
          ? `${apiUrl}uploads/opportunities/${value['cover']}`
          : '';

      default:
        return '';
    }
  }
}
