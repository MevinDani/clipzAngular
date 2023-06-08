import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { FormBuilder, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, Params } from '@angular/router';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  post!:Post
  private postId!: string;
  mode = 'create'
  isLoading = false
  imagePreview:any
  imageCheck = true

  constructor(private fb:FormBuilder,public ps:PostService,private route:ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params:Params) => {
      if(params['postId']) {
        this.mode = 'edit'
        this.postId = params['postId']
        this.isLoading = true
        this.ps.getPostEdit(this.postId).subscribe(postData => {
          this.isLoading = false
          this.post = {id:postData._id,title:postData.title,content:postData.content,imagePath:postData.imagePath,creator:postData.creator,name:postData['name'],likes:undefined}
          this.postForm.controls['title'].setValue(this.post.title)
          this.postForm.controls['content'].setValue(this.post.content)
          this.postForm.controls['image'].setValue(this.post.imagePath)
          this.imagePreview = this.postForm.value.image
        })
      } else {
        this.mode = 'create'
      }
    })
  }

  postForm = this.fb.group({
    title:['',[Validators.required,Validators.minLength(3),Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
    content:['',[Validators.required,Validators.minLength(4),Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
    image:['',[Validators.required]]
  })

  onImagePicked(event:Event) {
    const file:any = (<HTMLInputElement>event.target).files
    const img = file[0]
    if(img.type === 'image/jpeg' || img.type === 'image/png' || img.type ==='image/jpg' || img.type === 'image/x-png' || img.type === 'image/gif') {
      this.postForm.patchValue({image: img})
      this.postForm.get('image')?.updateValueAndValidity()
      const reader = new FileReader()
      reader.onload = () => {
        this.imagePreview = reader.result
      }
      reader.readAsDataURL(img)
      this.imageCheck = true
    } else {
      this.imageCheck = false
      this.postForm.get('image')?.updateValueAndValidity()
      this.imagePreview = ''
      
    }
  }

  onAddPost() {

    if(this.postForm.invalid) {
      return
    }
    const postFormPath = this.postForm.value
    this.isLoading = true
    if(this.mode === 'create') {
      this.ps.addPost(postFormPath.title,postFormPath.content,postFormPath.image)
    } else {
      this.ps.updatePost(this.postId,postFormPath.title,postFormPath.content,postFormPath.image)
    }
    this.postForm.reset()
  }
}
