import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/data.service';
import { PostService } from '../post/post.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  imagePreview:any
  imageCheck = false
  locUserId:any
  isLoading = false

  constructor(private fb:FormBuilder,private route:ActivatedRoute,private ds:DataService,private ps:PostService) {}

  ngOnInit(): void {
    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')
    this.ds.getUser(this.locUserId).subscribe((result:any) => {
      // console.log(result);
      this.editProForm.controls['uname'].setValue(result.username)
      this.editProForm.controls['about'].setValue(result.about)
      this.editProForm.controls['image'].setValue(result.profilePic)
      this.imagePreview = this.editProForm.value.image
      // console.log(this.editProForm.value);
    })
  }

  editProForm = this.fb.group({
    uname:['',[Validators.required,Validators.minLength(3),Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
    about:['',[Validators.required,Validators.minLength(4),Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
    image:['']
  })

  onImagePicked(event:Event) {
    const file:any = (<HTMLInputElement>event.target).files
    const img = file[0]
    if(img.type === 'image/jpeg' || img.type === 'image/png' || img.type ==='image/jpg' || img.type === 'image/x-png' || img.type === 'image/gif') {
      this.editProForm.patchValue({image: img})
      this.editProForm.get('image')?.updateValueAndValidity()
      const reader = new FileReader()
      reader.onload = () => {
        this.imagePreview = reader.result
      }
      reader.readAsDataURL(img)
      this.imageCheck = true
    } else {
      this.imageCheck = false
      this.editProForm.get('image')?.updateValueAndValidity()
      this.imagePreview = ''
      
    }
  }

  editProFormSubmit() {
    if(this.editProForm.invalid) {
      // console.log('form invalid');
      // console.log(this.editProForm);
      return
    }
    this.isLoading = true
    const editPath = this.editProForm.value
    // console.log(editPath);
    this.ps.editProfile(this.locUserId,editPath.uname,editPath.about,editPath.image)
    this.editProForm.reset()
    
  }
}
