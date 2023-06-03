import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  constructor(private fb:FormBuilder,private ds:AuthService,private route:Router,private toastr:ToastrService){}

  registerForm = this.fb.group({
    uname:['',[Validators.required,Validators.minLength(3),Validators.pattern('[0-9a-zA-Z ]+')]],
    passwd:['',[Validators.required,Validators.minLength(4),Validators.pattern('[0-9a-zA-Z ]+')]],
    cpswd:['',[Validators.required,Validators.minLength(4),Validators.pattern('[0-9a-zA-Z ]+')]]
  })

  registerSubmit() {
    const regPath = this.registerForm.value
    if((regPath.passwd !== regPath.cpswd)) alert('Passwords dont Match!')

    if(this.registerForm.valid && (regPath.passwd == regPath.cpswd)) {
      this.ds.createUser(this.registerForm.value.uname,this.registerForm.value.passwd)
        .subscribe((response:any) => {
          if(response.message == 'User successfully created') {
            this.toastr.success(response.message)
            this.route.navigateByUrl('/login')
          } else {
            this.toastr.error(response.message)
          }
      })
    }

  }

}
