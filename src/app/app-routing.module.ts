import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { LogGuard } from './auth/log.guard';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: '', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LogGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [LogGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'editUser', component: EditProfileComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'profile/user/:id/:name', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
  providers: [AuthGuard, LogGuard]
})
export class AppRoutingModule { }
