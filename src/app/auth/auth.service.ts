import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  // register
  createUser(uname: any,passwd: any) {
    const body = {
      username:uname,
      password:passwd,
    }
    return this.http.post('http://localhost:2000/api/users/signup',body)
  }

  // login
  loginApi(uname:any,passwd:any) {
    const body = {
      username:uname,
      password:passwd,
    }
    return this.http.post('http://localhost:2000/api/users/login',body)
  }
}
