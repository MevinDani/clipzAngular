import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(private route:Router){}
  isAuth:any
  ngOnInit(): void {
    if(localStorage.getItem('token')) {
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
