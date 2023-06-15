import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../data.service';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
  locUserId: any
  profilePic: any
  userName: any
  showProfileSection = false;
  isAuth: any
  token: string | undefined;

  constructor(private route: Router, private toastr: ToastrService, private ds: DataService, private authService: AuthService) { }
  ngOnInit(): void {
    this.authService.getToken().subscribe((result: any) => {
      this.token = result;
      // console.log(this.token);
      this.ds.getUser(this.token).subscribe((result: any) => {
        // console.log(result);
        this.profilePic = result.profilePic
        this.userName = result.username
      })
    });
    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')
    // console.log(this.locUserId);
    if (this.locUserId) {
      this.ds.getUser(this.locUserId).subscribe((result: any) => {
        // console.log(result);
        this.profilePic = result.profilePic
        this.userName = result.username
      })
    }
    if (localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }
  }

  ngDoCheck(): void {

    if (localStorage.getItem('token')) {
      this.isAuth = true
      // console.log(true);
    } else {
      this.isAuth = false
    }
  }

  toggleProfileSection() {
    // console.log(this.showProfileSection);
    this.showProfileSection = !this.showProfileSection;
  }

  profile() {
    // this.route.navigateByUrl(`/profile/users/${this.token}/${this.userName}`)
    this.showProfileSection = !this.showProfileSection;
  }



  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('uid')
    this.toastr.warning('You have been logged out')
    this.route.navigateByUrl('/login')
    this.profilePic = ''
    this.userName = ''
    this.locUserId = ''
    this.showProfileSection = false;
    this.isAuth = false
  }
}
