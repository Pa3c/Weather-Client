import { Component, OnInit } from '@angular/core';
import {WeatherServiceService} from '../../services/weather-service.service';
import {WeatherInfo} from '../../model/weather-info';
import {WeatherTransaction} from '../../model/weather-transaction';
import {WeatherTransactionList,GalleryModel,Filter,Sorter,TextChanger} from '../../model/common';
import {UserServiceService} from '../../services/user-service.service';
import {Router} from '@angular/router';
import {Photo} from '../../model/photo';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  currentPhoto :Photo;
  constructor(private userService: UserServiceService,
    private weatherServiceService: WeatherServiceService,
    private router: Router) {
      this.currentPhoto = new Photo();
     }

  ngOnInit(): void {
    this.currentPhoto = new Photo();
  }

  logout(){
    this.userService.logout().subscribe(data => {
      this.router.navigate(['/login']);
    },error => {
      console.log(error);
    });
  }
  removePhoto(){
    this.weatherServiceService.deleteWeatherPhoto(this.currentPhoto.id).subscribe(success =>{
      console.log(success);
      let index = WeatherTransactionList.currentWeather.weatherInfo.photos.findIndex(x=>x.id==this.currentPhoto.id);
      WeatherTransactionList.currentWeather.weatherInfo.photos.slice(index,1);
      this.currentPhoto = new Photo();
    },error=>{
      console.log(error);
    })
  }
goBack(){
  GalleryModel.show = false;
}

get photos(){
  
  if(WeatherTransactionList.currentWeather.weatherInfo.photos == undefined ||
    WeatherTransactionList.currentWeather.weatherInfo.photos == null || 
    WeatherTransactionList.currentWeather.weatherInfo.photos.length == 0){
      console.log("No Photos");
    return;
  }
  let photos = new Array();
  WeatherTransactionList.currentWeather.weatherInfo.photos.forEach(x=>{
   let p = new Photo();
   p.title = x.title;
   p.description = x.description;
   p.id = x.id;
   p.weatherInfoId = x.weatherInfoId;
   p.fileName = x.fileName;
   p.content = x.content;
   p.content = atob(p.content);
    photos.push(p);
  });

  return photos;
}

showCurrentPhoto(currentPhoto :any){
  this.currentPhoto = currentPhoto;
  console.log(this.currentPhoto);
}
}
