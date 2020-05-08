import { Component, OnInit } from '@angular/core';
import {UserServiceService} from '../../services/user-service.service';
import {User} from '../../model/user';
import {Router} from '@angular/router';


@Component({
  selector: 'app-register-component',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegisterComponentComponent implements OnInit {

  user: User = new User();
  errorMessage;

  constructor(private userService: UserServiceService, private router: Router) { }

  ngOnInit() {
    if(this.userService.currentUserValue){
      this.router.navigate(['/home']);
       return;
      }
  }

registerToService(){
  this.userService.register(this.user).subscribe(data => {
    this.router.navigate(['/login']);
  }, error => {
    if(!error  || error.status!==409){
      this.errorMessage = "Unexpected error occured: "+error;
    }else{
      this.errorMessage = "Login or Email already exists";
    }
   
  });
}


}
