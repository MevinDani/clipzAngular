import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  constructor(private ps:PostService, private ds:DataService) {}
  isLoading = false
  isAuth:any
  isAllowed:any
  locUserId:any
  followArr:any = []
  postCreators:any = []
  postProfPic:any = {}
  likes:any = {}


  userName:any
  logUserProPic:any

  likeCheck:any
  logUserLikes:any = {}


  posts:Post[] = []
  private postSub!: Subscription;

  ngOnInit(): void {

    this.isLoading = true
    this.ps.getPosts()
    this.postSub =  this.ps.getUpdatedPostListener()
    .subscribe((posts:Post[]) => {
      this.isLoading = false
      this.posts = posts  
      // console.log(posts);

      for(let n of this.posts) {
        // console.log(n.name);
        this.postCreators.push(n.name)
      }
      // console.log(this.postCreators);
      this.postCreators = [...new Set(this.postCreators)];
      // console.log(this.postCreators);

      for(let u of this.postCreators) {
        this.ds.getProfPic(u).subscribe((result:any) => {
          // console.log(u,result);
          this.postProfPic[u] = result
          // console.log(this.postProfPic);
        })
      }

      for(let l of this.posts) {
        // console.log(l);
        this.likes[l.id] = l.likes
      }
      // console.log(this.likes);

      this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

      Object.entries(this.likes).forEach(([key, value]) => {
        // console.log(key,value);
        if(value == this.locUserId) {
          this.logUserLikes[key] = true
        }
      })

      // console.log(this.logUserLikes);
      
 
    })

    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')


    if(localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }

    // console.log(this.locUserId);
    
    this.ds.getUser(this.locUserId).subscribe((result:any) => {
      // console.log(this.locUserId);
      // console.log(result);
      this.userName = result.username
      this.logUserProPic = result.profilePic
    })

    this.ps.getFollowersList(this.locUserId).subscribe((result:any) => {
      // console.log(result);
      this.followArr = result
      // console.log(this.followArr);
      
    })

  }

  deletePost(postId:any) {
    this.ps.deletePost(postId)
  }

  creatorId(id: any) {
    // console.log(id);
  }

  followUser(id:any) {
    this.ps.apifollowUser(id)
  }

  likePost(id:any) {
    // this.likeCheck = true
    console.log(this.logUserLikes[id]);
    if(this.logUserLikes[id] == true) {
      // dislike
      console.log('dislike code have to run');
      
    } else {
      console.log(id,'like');
      this.ps.likePost(id)
    }
  }

  disLikePost(id:any) {
    this.likeCheck = false
    console.log(id,'dislike');
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
