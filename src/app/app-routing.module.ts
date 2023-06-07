import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

const routes: Routes = [
  { path:'', component:PostListComponent},
  { path:'create', component:PostCreateComponent,canActivate:[AuthGuard]},
  { path:'login', component:LoginComponent},
  { path:'signup', component:SignupComponent},
  { path:'editUser', component:EditProfileComponent},
  { path:'edit/:postId', component:PostCreateComponent,canActivate:[AuthGuard]},
  { path:'profile/user/:id/:name', component:ProfileComponent,canActivate:[AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthGuard]
})
export class AppRoutingModule { }
