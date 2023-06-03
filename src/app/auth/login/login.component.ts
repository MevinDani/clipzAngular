import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  logUserId:any

  constructor(private fb:FormBuilder,private ds:AuthService,private route:Router,private toastr:ToastrService){}

  loginForm = this.fb.group({
    uname:['',[Validators.required,Validators.minLength(3),Validators.pattern('[0-9a-zA-Z ]+')]],
    passwd:['',[Validators.required,Validators.minLength(4),Validators.pattern('[0-9a-zA-Z ]+')]]
  })

  loginSubmit() {
    const loginPath = this.loginForm.value
    if(this.loginForm.valid) {
      this.ds.loginApi(loginPath.uname,loginPath.passwd).subscribe((response:any) => {
        if(response.result) {
          this.logUserId = response.result._id
          localStorage.setItem('token',JSON.stringify(response.token))
          localStorage.setItem('uid',JSON.stringify(response.result._id))
          this.toastr.success('Successfull Login')
          this.route.navigateByUrl('')
        } else {
          this.toastr.error(response.message)
        }
      })
    } else {
      this.toastr.error('Invalid Form')
    }
  }
}
