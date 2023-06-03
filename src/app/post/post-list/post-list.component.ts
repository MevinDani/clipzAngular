import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit,OnDestroy {
  constructor(public ps:PostService) {}
  isLoading = false
  isAuth:any
  isAllowed:any
  locUserId:any
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
    })

    if(localStorage.getItem('token')) {
      this.isAuth = true
    } else {
      this.isAuth = false
    }
    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')
  }

  deletePost(postId:any) {
    this.ps.deletePost(postId)
  }

  creatorId(id: any) {
    console.log(id);
  }


  ngOnDestroy(): void {
    this.postSub.unsubscribe()
  }



}
