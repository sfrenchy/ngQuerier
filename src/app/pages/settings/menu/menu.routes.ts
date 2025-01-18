import { Routes } from '@angular/router';
import { MenuListComponent } from './menu-list/menu-list.component';
import { MenuFormComponent } from './menu-form/menu-form.component';
import { LayoutEditorComponent } from './pages/layout-editor/layout-editor.component';
import { PageListComponent } from './pages/page-list/page-list.component';
import { PageFormComponent } from './pages/page-form/page-form.component';

export const routes: Routes = [
  {
    path: '',
    component: MenuListComponent
  },
  {
    path: 'new',
    component: MenuFormComponent
  },
  {
    path: 'edit/:id',
    component: MenuFormComponent
  },
  {
    path: ':id/pages',
    component: PageListComponent
  },
  {
    path: ':id/pages/new',
    component: PageFormComponent
  },
  {
    path: ':id/pages/:pageId',
    component: PageFormComponent
  },
  {
    path: ':id/pages/:pageId/layout',
    component: LayoutEditorComponent
  }
];

export default routes;
