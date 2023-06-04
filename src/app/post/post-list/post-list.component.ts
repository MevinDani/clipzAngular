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
export class PostListComponent implements OnInit,OnDestroy {
  constructor(private ps:PostService, private ds:DataService) {}
  isLoading = false
  isAuth:any
  isAllowed:any
  locUserId:any
  followArr:any = []
  // post = [
  //   {no:1,title:'First Post', content:'this is first post'},
  //   {no:2,title:'second Post', content:'this is second post'},
  //   {no:3,title:'third Post', content:'this is third post'}
  // ]
  posts:Post[] = []
  private postSub!: Subscription;

  ngOnInit(): void {
    this.isLoading = true
    this.ps.getPosts()
    this.postSub =  this.ps.getUpdatedPostListener()
    .subscribe((posts:Post[]) => {
      this.isLoading = false
      this.posts = posts  
      console.log(posts);
          
    })

    if(localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }
    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

    // this.ds.getProfile(this.locUserId).subscribe((result:any) => {
    //   console.log(this.locUserId);
    //   console.log(result);
    // })

    this.ps.getFollowersList(this.locUserId).subscribe((result:any) => {
      // console.log(result);
      this.followArr = result
      console.log(this.followArr);
      
    })
  }

  deletePost(postId:any) {
    this.ps.deletePost(postId)
  }

  creatorId(id: any) {
    console.log(id);
  }

  followUser(id:any) {
    this.ps.apifollowUser(id)
  }

  followerCheck() {
    
  }


  ngOnDestroy(): void {
    this.postSub.unsubscribe()
  }



}
