import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  locUserId: any
  constructor(private route: Router, private ds: DataService) { }
  isAuth: any
  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }

  }

  logout() {
    localStorage.removeItem('token')
    alert('User logged out')
    this.route.navigateByUrl('/login')
  }
}
