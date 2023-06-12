// import { Component, OnDestroy, OnInit } from '@angular/core';
import { Component, AfterViewChecked, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/data.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  @ViewChild('commentContainer', { static: false }) commentContainer: ElementRef | undefined;

  // Rest of your component code
  constructor(private toastr: ToastrService, private ps: PostService, private ds: DataService, private fb: FormBuilder) { }
  isLoading = false
  isAuth: any
  isAllowed: any
  locUserId: any
  followArr: any = []
  postCreators: any = []
  postProfPic: any = {}
  likes: { [key: string]: string[] } = {}


  userName: any
  logUserProPic: any

  likeCheck: any

  logUserLikes: any = {}
  postLikesNum: any = {}


  posts: Post[] = []
  private postSub!: Subscription;

  openCmtBox: { [postId: number]: boolean } = {}

  comments: any = []
  isCmtLoading = false

  toggleCmtBtn: any = {}

  ngOnInit(): void {

    this.isLoading = true
    this.ps.getPosts()
    this.postSub = this.ps.getUpdatedPostListener()
      .subscribe((posts: Post[]) => {
        this.isLoading = false
        this.posts = posts
        // console.log(posts);

        for (let n of this.posts) {
          // console.log(n.name);
          this.postCreators.push(n.name)
        }
        // console.log(this.postCreators);
        // unique(rm dupes)
        this.postCreators = [...new Set(this.postCreators)];
        // console.log(this.postCreators);

        for (let u of this.postCreators) {
          this.ds.getProfPic(u).subscribe((result: any) => {
            // console.log(u,result);
            this.postProfPic[u] = result
            // console.log(this.postProfPic);
          })
        }

        for (let l of this.posts) {
          // console.log(l);
          this.likes[l.id] = l.likes
        }
        // console.log(this.likes);

        this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

        Object.entries(this.likes).forEach(([key, value]) => {
          // console.log(key, value);
          // console.log(value);
          for (let u of value) {
            if (u == this.locUserId) {
              this.logUserLikes[key] = true
              this.postLikesNum[key] = value.length
            }
            this.postLikesNum[key] = value.length
          }
        })
        // console.log(this.logUserLikes);
        // console.log(this.postLikesNum);




      })

    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')


    if (localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }

    // console.log(this.locUserId);

    this.ds.getUser(this.locUserId).subscribe((result: any) => {
      // console.log(this.locUserId);
      // console.log(result);
      this.userName = result.username
      this.logUserProPic = result.profilePic
    })

    this.ps.getFollowersList(this.locUserId).subscribe((result: any) => {
      // console.log(result);
      this.followArr = result
      // console.log(this.followArr);

    })

  }

  // ngAfterViewChecked() {
  //   this.scrollToBottom();
  // }

  private scrollToBottom() {
    if (this.commentContainer) {
      const containerElement = this.commentContainer.nativeElement;
      containerElement.scrollTop = containerElement.scrollHeight;
    }
  }


  deletePost(postId: any) {
    this.ps.deletePost(postId)
  }

  creatorId(id: any) {
    // console.log(id);
  }

  followUser(id: any) {
    this.ps.apifollowUser(id)
  }

  likePost(id: any) {
    // this.likeCheck = true
    // console.log(this.logUserLikes);
    this.logUserLikes[id] = true
    if (this.postLikesNum[id]) this.postLikesNum[id]++
    if (!this.postLikesNum[id]) this.postLikesNum[id] = 1
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
    this.ps.dislikePost(id)
    // this.likeCheck = true
    // console.log('dislike code have to run');
  }


  cmntBox(id: any) {
    this.openCmtBox[id] = !this.openCmtBox[id]
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



  // ngOnDestroy(): void {
  //   this.postSub.unsubscribe()
  // }

  // followerCheck() {
  //   for(let i of this.posts) {
  //     if(this.locUserId == i.creator) {
  //       console.log(i.creator,'hit');
  //     }
  //   }
  // }

}
