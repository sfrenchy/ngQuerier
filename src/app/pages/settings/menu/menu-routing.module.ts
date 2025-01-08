import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuListComponent } from './menu-list/menu-list.component';
import { MenuFormComponent } from './menu-form/menu-form.component';
import { PageLayoutComponent } from './pages/page-layout/page-layout.component';

const routes: Routes = [
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
    path: 'pages/:id/layout',
    component: PageLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuRoutingModule { }
