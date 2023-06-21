import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  backUrl = 'https://piczback.onrender.com/api'

  constructor(private http: HttpClient) { }

  setToken(token: string | null): void {
    this.tokenSubject.next(token);
  }

  getToken(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  // register
  createUser(uname: any, passwd: any) {
    const body = {
      username: uname,
      password: passwd,
    }
    return this.http.post(this.backUrl + '/users/signup', body)
  }

  // login
  loginApi(uname: any, passwd: any) {
    const body = {
      username: uname,
      password: passwd,
    }
    return this.http.post(this.backUrl + '/users/login', body)
  }
}
