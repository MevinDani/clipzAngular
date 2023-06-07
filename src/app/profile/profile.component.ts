import { Component, OnInit, DoCheck, OnChanges, SimpleChanges, AfterViewChecked, AfterContentInit, AfterContentChecked, EventEmitter} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { PostService } from '../post/post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
[x: string]: any;
  userName:any
  userId:any
  userPost: any= [];
  isLoading=true
  isAuth = false
  locUserId:any
  followArr:any = []
  creatorId:any
  followCheck: any;
  newFollowArr:any = []
  newCreator:any
  name:any
  private followSub!: Subscription;
  private creatorSub!:Subscription

  followStatusChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  followId:any
  unfollowId:any

  constructor(private route:ActivatedRoute,private ds:DataService,private ps:PostService,private router:Router) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id']
    this.userName = this.route.snapshot.params['name']

    this.ds.getProfPost(this.userId).subscribe((result:any) => {
      // console.log(result);
      this.userPost = result
      this.isLoading = false
      // console.log(this.creatorId);
    })

    // this.newCreator = this.ds.getCreatorId(this.userId)
    // console.log(this.newCreator,'newCret');
    
    // this.creatorSub = this.ds.getUpdatedCreator()
    //   .subscribe((result:any) => {
    //     console.log(result,'creatorSub');
    //   })

    // console.log(this.ds.getCreatorId(this.userId));
    

    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

    if(this.locUserId) this.isAuth = true

    // Observable way to get updated followings list
    this.ds.getFollowersList(this.locUserId)
    this.followSub = this.ds.getUpdatedFollowListener()
      .subscribe((result:any) => {
        // console.log(result,"obsway");
        this.newFollowArr = result
          for(let i of this.newFollowArr) {
            // console.log(i,this.userId);
            if(i == this.userId) {
              this.followCheck = true
              return
            }
          }
      })


    // this.ps.getFollowersList(this.locUserId).subscribe((result:any) => {
    //   this.followArr = result
    //   console.log(this.followArr,"myway");
    //   for(let i of this.followArr) {
    //     // console.log(i,this.creatorId);
    //     if(i == this.creatorId) {
    //       this.followCheck = true
    //     } else {
    //       this.followCheck = false
    //     }
    //   }
      
    //   if(this.followArr.includes[this.creatorId]) {
    //     console.log(true);
    //   }
    // })
    
  }


  followUser(id:any) {
    // console.log(id);
    this.ps.apifollowUser(id)
    // this.followId = id
    // console.log(this.followId);
    // console.log(typeof(this.followId));

    // this.ds.apifollowUser(id)
    // console.log(this.followArr);
    // window.location.reload()
    this.followCheck = true
    this.followStatusChange.emit(true)
    // this.followClick = !this.followClick
    // this.ngOnInit()
  }

  unfollowUser(id:any) {
    // console.log(id);  
    this.ps.apiunfollowUser(id)
    // this.unfollowId = id
    // console.log(this.unfollowId);
    // console.log(typeof(this.unfollowId));

    // this.ds.apiunfollowUser(id)
    // console.log(this.followArr);
    // window.location.reload()
    this.followCheck = false
    this.followStatusChange.emit(false)
    // const index = this.followArr.indexOf(id)
    // console.log(index);
    // this.followArr = this.followArr.splice(index,1)
    // console.log(this.followArr,"splice");
    // this.unfollowClick = !this.unfollowClick
    // this.ngOnInit()
  }


  deletePost(postId:any) {
    this.ps.deletePost(postId)
    this.userPost = this.userPost.filter((post:any) => post._id !== postId)
  }

  ngOnDestroy(): void {
    this.followSub.unsubscribe()
    // this.creatorSub.unsubscribe()
  }

}
