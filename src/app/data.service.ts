import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {

  logUserId: any
  private followArr: any = []
  private followArrUpd = new Subject()
  private creator: any
  private creatorIdUpd = new Subject()

  private sidefollowArr: any = []
  private sideFollowUpd = new Subject()

  private sidefollowingArr: any = []
  private sidefollowingUpd = new Subject()

  backUrl = 'https://piczback.onrender.com/api'

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.logUserId = JSON.parse(localStorage.getItem("uid") || "")
  }

  getUpdatedFollowListener() {
    return this.followArrUpd.asObservable()
  }

  getUpdatedCreator() {
    return this.creatorIdUpd.asObservable()
  }

  getProfile(name: any) {
    return this.http.get(this.backUrl + '/users/profile/' + name)
  }

  getCreatorId(name: any) {
    this.http.get(this.backUrl + '/posts/profile/' + name)
      .subscribe((result: any) => {
        // console.log(result[0].creator);
        this.creator = result[0].creator
        this.creatorIdUpd.next(this.creator)
      })
  }

  getProfPost(id: any) {
    return this.http.get(this.backUrl + '/posts/profile/' + id)
  }

  getUser(id: any) {
    return this.http.get(this.backUrl + '/users/idtoName/' + id)
  }

  getUpdatedSideFollowArrListener() {
    return this.sideFollowUpd.asObservable()
  }

  getUpdatedSideFollowinArrListener() {
    return this.sidefollowingUpd.asObservable()
  }

  getSideFs(id: any) {
    this.http.get(this.backUrl + '/users/idtoName/' + id)
      .subscribe((result: any) => {
        // console.log(result)
        this.sidefollowArr = result.followers
        this.sideFollowUpd.next([...this.sidefollowArr])
        this.sidefollowingArr = result.followings
        this.sidefollowingUpd.next([...this.sidefollowingArr])
      })
  }

  getFollowersList(id: any) {
    this.http.get(this.backUrl + '/users/followersList/' + id).subscribe((result: any) => {
      // console.log(result);
      this.followArr = result
      this.followArrUpd.next([...this.followArr])
    })
  }

  apifollowUser(id: any) {
    const logUserId = JSON.parse(localStorage.getItem("uid") || "")
    const body = {
      id: logUserId
    }
    this.http.put(this.backUrl + '/users/follow/' + id, body).subscribe((result: any) => {
      if (result.message == 'User has been followed') {
        this.followArr.push(id)
        this.followArrUpd.next([...this.followArr])
        this.toastr.success('User has been followed')
      } else {
        this.toastr.error(result.message)
      }
    })
  }

  apiunfollowUser(id: any) {
    const logUserId = JSON.parse(localStorage.getItem("uid") || "")
    const body = {
      id: logUserId
    }
    this.http.put(this.backUrl + '/users/unfollow/' + id, body).subscribe((result: any) => {
      if (result.message == 'User has been unfollowed') {
        const updatedFollowArr = this.followArr.filter((fid: any) => fid.id !== id)
        this.followArr = updatedFollowArr
        this.followArrUpd.next([...this.followArr])
        this.toastr.warning('Unfollowed the User')
      } else {
        this.toastr.error(result.message)
        console.log(result);

      }
    })
  }

  getProfPic(name: any) {
    return this.http.get(this.backUrl + '/users/profilePics/' + name)
  }

}
