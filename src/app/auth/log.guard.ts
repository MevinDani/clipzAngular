import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

@Injectable()
export class LogGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(): boolean {
        if (localStorage.getItem("token")) {
            // User is logged in, prevent access to login and signup pages
            this.router.navigate(["/"]); // Redirect to home or any other appropriate page
            return false;
        }
        return true;
    }
}
