import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {
  logUserId:any
  private followArr:any = []
  private followArrUpd = new Subject()
  private creator:any
  private creatorIdUpd = new Subject()

  constructor(private http:HttpClient,private router:Router,private toastr:ToastrService) { }
  
  ngOnInit(): void {
    this.logUserId = JSON.parse(localStorage.getItem("uid") || "")
  }

  getUpdatedFollowListener() {
    return this.followArrUpd.asObservable()
  }

  getUpdatedCreator() {
    return this.creatorIdUpd.asObservable()
  }

  getProfile(name:any) {
    return this.http.get('http://localhost:2000/api/users/profile/'+name)
  }

  getCreatorId(name:any) {
    this.http.get('http://localhost:2000/api/posts/profile/'+name)
      .subscribe((result:any) => {
        // console.log(result[0].creator);
        this.creator = result[0].creator
        this.creatorIdUpd.next(this.creator)
      })
  }

  getProfPost(id:any) {
    return this.http.get('http://localhost:2000/api/posts/profile/'+id)
  }

  getUser(id:any) {
    return this.http.get('http://localhost:2000/api/users/idtoName/'+id)
  }

  getFollowersList(id:any) {
    this.http.get('http://localhost:2000/api/users/followersList/'+id).subscribe((result:any) => {
      this.followArr = result
      this.followArrUpd.next([...this.followArr])
    })
  }

}
