import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { PostService } from '../post/post.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName:any
  userPost: any= [];
  isLoading=true
  isAuth = false
  locUserId:any

  constructor(private route:ActivatedRoute,private ds:DataService,private ps:PostService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      // console.log(params);
      this.userName = params['name']
      // console.log((this.userName));

      this.ds.getProfPost(this.userName).subscribe((result:any) => {
        // console.log(result);
        this.userPost = result
        // console.log(this.userPost);
        this.isLoading = false
        
      })
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
    this.userPost = this.userPost.filter((post:any) => post._id !== postId)
  }
}
