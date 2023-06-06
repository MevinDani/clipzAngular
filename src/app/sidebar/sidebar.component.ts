import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  locUserId:any
  followers:any = []
  followings:any = []

  constructor(private ds:DataService) {}

  ngOnInit(): void {
    if(localStorage.getItem('uid')) {
      this.locUserId = JSON.parse(localStorage.getItem('uid') || '')
    }
    this.ds.getUser(this.locUserId).subscribe((result:any) => {
      // console.log(result);
      this.followers = result.followersName
      this.followings = result.followingsName
      // console.log(this.followers,this.followings);
    })
  }

}
