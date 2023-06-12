import { Component, OnInit, DoCheck, OnChanges, SimpleChanges, AfterViewChecked, AfterContentInit, AfterContentChecked, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DataService } from '../data.service';
import { PostService } from '../post/post.service';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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

  openCmtBox: { [postId: number]: boolean } = {}

  isCmtLoading = false

  comments: any = []

  toggleCmtBtn: any = {}



  constructor(private toastr: ToastrService, private route: ActivatedRoute, private ds: DataService, private ps: PostService, private router: Router, private fb: FormBuilder) { }
  @ViewChild('commentContainer', { static: false }) commentContainer: ElementRef | undefined;

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id']
    this.userName = this.route.snapshot.params['name']

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.location.reload();
      }
    });

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


    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

    if (this.locUserId) this.isAuth = true

  }


  followUser(id: any) {
    // console.log(id);
    this.ps.apifollowUser(id)
    this.followCheck = true
    this.followStatusChange.emit(true)
  }

  unfollowUser(id: any) {
    // console.log(id);  
    this.ps.apiunfollowUser(id)
    this.followCheck = false
    this.followStatusChange.emit(false)
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

  private scrollToBottom() {
    if (this.commentContainer) {
      const containerElement = this.commentContainer.nativeElement;
      containerElement.scrollTop = containerElement.scrollHeight;
    }
  }

  commentForm = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
  })

  commFormSubmit(id: any) {
    if (this.commentForm.invalid) {
      console.log('form invalid');
      return
    }
    const commPath = this.commentForm.value
    // console.log(id, commPath.comment, this.locUserId, this.userName);
    this.ps.addComment(id, commPath.comment, this.locUserId, this.userName).subscribe((result: any) => {
      // console.log(result);
      if (result.message == 'Comment added successfully') {
        this.toastr.success('Comment added successfully')
      }
    })
    const newComm = { postId: id, content: commPath.comment, userId: this.locUserId, name: this.userName, createdAt: new Date() }
    this.comments.push(newComm)
    setTimeout(() => {
      this.scrollToBottom();
    });
    // this.scrollToBottom();
    this.commentForm.reset()
  }

  getTimeElapsed(createdAt: string): string {
    const commentDate = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - commentDate.getTime()) / 1000);  // Calculate the time difference in seconds

    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minutes ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  }

  getComments(id: any) {
    this.isCmtLoading = true
    this.comments = []
    this.ps.getComments(id).subscribe((result: any) => {
      // console.log(result);
      // console.log(this.postProfPic);
      // this.comments = result
      this.comments = result.map((comment: any) => {
        return {
          ...comment,
          createdAt: new Date(comment.createdAt)
        };
      })
      this.isCmtLoading = false
      // console.log(this.comments, 'comm');
    })
  }

  showLatestComments(id: any) {
    this.toggleCmtBtn[id] = true
    // console.log(id);
    this.ps.getLatestComments(id).subscribe((result: any) => {
      // console.log(result);
      this.comments = result.map((comment: any) => {
        return {
          ...comment,
          createdAt: new Date(comment.createdAt)
        };
      })
    })
  }

  showOldestComments(id: any) {
    this.toggleCmtBtn[id] = false
    // this.getComments(id)
    this.ps.getComments(id).subscribe((result: any) => {
      // console.log(result);
      // console.log(this.postProfPic);
      // this.comments = result
      this.comments = result.map((comment: any) => {
        return {
          ...comment,
          createdAt: new Date(comment.createdAt)
        };
      })
      this.isCmtLoading = false
      // console.log(this.comments, 'comm');
    })
  }

  cmtDelete(postId: any, cmtId: any) {
    // console.log(postId, cmtId);
    this.ps.commentDelete(postId, cmtId)
    // console.log(result);
    // console.log(this.comments);
    this.comments = this.comments.filter((id: any) => id._id !== cmtId)
  }

  cmntBox(id: any) {
    this.openCmtBox[id] = !this.openCmtBox[id]
    // console.log(id);
    // console.log(this.openCmtBox);
  }

  userProf(id: any, name: any) {
    // console.log(id, name);
    if (id !== this.locUserId) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl('/profile/user/' + id + '/' + name);
      });
    }
  }


  ngOnDestroy(): void {
    this.followSub.unsubscribe()
    // this.creatorSub.unsubscribe()
  }

}
