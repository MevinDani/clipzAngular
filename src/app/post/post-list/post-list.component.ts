import { Component, OnDestroy, OnInit } from '@angular/core';
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
      console.log(result);
      if (result.message == 'Comment added successfully') {
        this.toastr.success('Comment added successfully')
      }
    })
    const newComm = { postId: id, content: commPath.comment, userId: this.locUserId, name: this.userName }
    this.comments.push(newComm)
    this.commentForm.reset()
  }

  getComments(id: any) {
    this.comments = []
    this.ps.getComments(id).subscribe((result: any) => {
      console.log(result);
      console.log(this.postProfPic);
      this.comments = result
      console.log(this.comments, 'comm');
    })
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
