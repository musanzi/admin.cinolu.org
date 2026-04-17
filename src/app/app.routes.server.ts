import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'programs/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'blog/articles/update/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'opportunities/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'events/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'mentors/update/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'mentors/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'ventures/view/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'projects/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'users/update/:email',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
