import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient,private router:Router,private toastr:ToastrService) { }

  getProfile(name:any) {
    return this.http.get('http://localhost:2000/api/users/profile/'+name)
  }

  getProfPost(name:any) {
    return this.http.get('http://localhost:2000/api/posts/profile/'+name)
  }

}
