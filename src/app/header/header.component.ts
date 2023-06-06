import { Component,OnInit,DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,DoCheck {
  constructor(private route:Router,private toastr:ToastrService){}
  isAuth:any
  ngOnInit(): void {
    if(localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }
  }

  ngDoCheck(): void {
    if(localStorage.getItem('token')) {
      this.isAuth = true
      // console.log(true);
    } else {
      this.isAuth = false
    }
  }

  

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('uid')
    this.toastr.warning('You have been logged out')
    this.route.navigateByUrl('/login')
    this.isAuth = false
  }
}
