import { Component, OnInit } from '@angular/core';
import {UserServiceService} from '../../services/user-service.service';
import {User} from '../../model/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent implements OnInit {

  user: User = new User();
  errorMessage: string;

  constructor(private userService: UserServiceService,private router: Router) {

   }

  ngOnInit() {
    if(this.userService.currentUserValue){
    this.router.navigate(['/weather']);
     return;
    }
  }

  logToService(){
    this.userService.login(this.user).subscribe(data => {
      this.router.navigate(['/weather']);
    },error => {
      this.errorMessage = "Username or password is incorrect";
    });
  }

}
