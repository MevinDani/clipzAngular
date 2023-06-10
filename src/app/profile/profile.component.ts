import { Component, OnInit, DoCheck, OnChanges, SimpleChanges, AfterViewChecked, AfterContentInit, AfterContentChecked, EventEmitter } from '@angular/core';
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
  userName: any
  userId: any
  userPost: any = [];
  isLoading = true
  isAuth = false
  locUserId: any
  followArr: any = []
  creatorId: any
  followCheck: any;
  newFollowArr: any = []
  newCreator: any
  name: any
  private followSub!: Subscription;
  private creatorSub!: Subscription

  about: any
  profPic: any

  logUserLikes: any = {}
  postLikesNum: any = {}

  postCreators: any = []
  postProfPic: any = {}


  followStatusChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  followId: any
  unfollowId: any

  inLikedPost = false

  constructor(private route: ActivatedRoute, private ds: DataService, private ps: PostService, private router: Router) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id']
    this.userName = this.route.snapshot.params['name']

    this.ds.getUser(this.userId).subscribe((result: any) => {
      // console.log(result);
      this.about = result.about
      this.profPic = result.profilePic
      this.postProfPic[result.username] = result.profilePic
      // console.log(this.postProfPic);

    })

    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

    // Observable way to get updated followings list
    this.ds.getFollowersList(this.locUserId)
    this.followSub = this.ds.getUpdatedFollowListener()
      .subscribe((result: any) => {
        // console.log(result,"obsway");
        this.newFollowArr = result
        for (let i of this.newFollowArr) {
          // console.log(i,this.userId);
          if (i == this.userId) {
            this.followCheck = true
            return
          }
        }
      })

    this.ds.getProfPost(this.userId).subscribe((result: any) => {
      console.log(result);
      this.userPost = result
      console.log(this.userPost);

      this.isLoading = false
      this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

      // console.log(this.creatorId);

      for (let l of result) {
        // console.log(l);
        this.postLikesNum[l._id] = l.likes.length
        for (let u of l.likes) {
          if (u == this.locUserId) {
            this.logUserLikes[l._id] = true
          }
        }
        // this.likes[l.id] = l.likes
      }
      // console.log(this.logUserLikes);
      // console.log(this.postLikesNum);

    })

    // console.log(this.likes);

    // Object.entries(this.likes).forEach(([key, value]) => {
    //   // console.log(key, value);
    //   // console.log(value);
    //   for (let u of value) {
    //     if (u == this.locUserId) {
    //       this.logUserLikes[key] = true
    //       this.postLikesNum[key] = value.length
    //     }
    //     this.postLikesNum[key] = value.length
    //   }
    // })


    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

    if (this.locUserId) this.isAuth = true

  }


  followUser(id: any) {
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

  unfollowUser(id: any) {
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


  likePost(id: any) {
    // this.likeCheck = true
    // console.log(this.logUserLikes);
    this.logUserLikes[id] = true
    if (this.postLikesNum[id]) this.postLikesNum[id]++
    if (!this.postLikesNum[id]) this.postLikesNum[id] = 1
    // console.log(this.userPost);

    // console.log(this.logUserLikes[id]);
    // console.log(id, 'like');
    this.ps.likePost(id)
    // this.likeCheck = false
  }

  disLikePost(id: any) {
    // console.log(this.logUserLikes);
    this.logUserLikes[id] = false
    // if (this.postLikesNum[id]) this.postLikesNum[id]--
    this.postLikesNum[id]--
    // console.log(this.userPost);
    if (this.inLikedPost) this.userPost = this.userPost.filter((obj: any) => obj._id !== id)
    this.ps.dislikePost(id)
    // this.likeCheck = true
    // console.log(id, 'dislike code have to run');
  }

  getYourPosts(id: any) {
    // console.log(this.inLikedPost);
    this.ds.getProfPost(this.userId).subscribe((result: any) => {
      // console.log(result);
      this.userPost = result
      // console.log(this.userPost);

      this.isLoading = false
      this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

      // console.log(this.creatorId);

      for (let l of result) {
        // console.log(l);
        this.postLikesNum[l._id] = l.likes.length
        for (let u of l.likes) {
          if (u == this.locUserId) {
            this.logUserLikes[l._id] = true
          }
        }
        // this.likes[l.id] = l.likes
      }
      // console.log(this.logUserLikes);
      // console.log(this.postLikesNum);

    })
  }

  getLikedPosts(id: any) {
    this.inLikedPost = true
    // console.log(this.inLikedPost);
    this.ps.getLikedPosts(id).subscribe((result: any) => {
      // console.log(result);

      for (let n of result) {
        // console.log(n.name);
        this.postCreators.push(n.name)
      }
      // console.log(this.postCreators);
      // unique(rm dupes)
      this.postCreators = [...new Set(this.postCreators)];
      // console.log(this.postCreators);

      for (let u of this.postCreators) {
        this.ds.getProfPic(u).subscribe((result: any) => {
          // console.log(u, result);
          this.postProfPic[u] = result
          // console.log(this.postProfPic);
        })
      }
      // console.log(this.postProfPic);


      this.userPost = result
      // console.log(this.logUserLikes);
      for (let l of result) {
        // console.log(l);
        this.postLikesNum[l._id] = l.likes.length
        for (let u of l.likes) {
          if (u == this.locUserId) {
            this.logUserLikes[l._id] = true
          }
        }
        // this.likes[l.id] = l.likes
      }
    })
  }

  getFollowingsPosts(id: any) {
    this.inLikedPost = false
    // console.log(this.inLikedPost);
    this.ps.getFollowingsPost(id).subscribe((result: any) => {
      // console.log(result);

      for (let n of result) {
        // console.log(n.name);
        this.postCreators.push(n.name)
      }
      // console.log(this.postCreators);
      // unique(rm dupes)
      this.postCreators = [...new Set(this.postCreators)];
      // console.log(this.postCreators);

      for (let u of this.postCreators) {
        this.ds.getProfPic(u).subscribe((result: any) => {
          // console.log(u, result);
          this.postProfPic[u] = result
          // console.log(this.postProfPic);
        })
      }
      // console.log(this.postProfPic);


      this.userPost = result
      // console.log(this.logUserLikes);
      for (let l of result) {
        // console.log(l);
        this.postLikesNum[l._id] = l.likes.length
        for (let u of l.likes) {
          if (u == this.locUserId) {
            this.logUserLikes[l._id] = true
          }
        }
        // this.likes[l.id] = l.likes
      }
    })
  }


  deletePost(postId: any) {
    this.ps.deletePost(postId)
    this.userPost = this.userPost.filter((post: any) => post._id !== postId)
  }

  ngOnDestroy(): void {
    this.followSub.unsubscribe()
    // this.creatorSub.unsubscribe()
  }

}
