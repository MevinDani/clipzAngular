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

  userName:any

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
