import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private route:Router) {}
    canActivate():boolean {
        if(localStorage.getItem('token')) {
            return true
        }
        this.route.navigateByUrl('/login')
        return false
    }
}