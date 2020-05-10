import { Component, OnInit,Inject} from '@angular/core';
import {WeatherServiceService} from '../../services/weather-service.service';
import {WeatherInfo} from '../../model/weather-info';
import {Photo} from '../../model/photo';
import {WeatherTransaction} from '../../model/weather-transaction';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PhotoDialogComponent} from '../photo-dialog/photo-dialog.component';
import {UserServiceService} from '../../services/user-service.service';
import {WeatherTransactionList ,GalleryModel,TextChanger} from '../../model/common';
@Component({
  selector: 'app-current-weather',
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css']
})
export class CurrentWeatherComponent implements OnInit {


  textChanger :TextChanger;
  userId :number;
  constructor(private userService: UserServiceService,public photoDialog: MatDialog,
    private weatherServiceService: WeatherServiceService,private router: Router) { 
    WeatherTransactionList.currentWeather = new WeatherTransaction();
    this.textChanger = new TextChanger();
    WeatherTransactionList.currentWeather.weatherInfo = new WeatherInfo();
  }

  ngOnInit(): void {
  }


  saveWeather(){
    if(WeatherTransactionList.currentWeather.weatherInfo.day==null ||WeatherTransactionList.currentWeather.weatherInfo.day==undefined ){
      return;
    }
    console.log("Saving...")
    WeatherTransactionList.currentWeather.userId = this.userId;
    this.weatherServiceService.saveWeather(WeatherTransactionList.currentWeather).subscribe(data=>{
      console.log(data);
     WeatherTransactionList.transactionList.push(data);
    },error=>{
      console.log(error);
    });
  }
  
  logout(){
    this.userService.logout().subscribe(data => {
      this.router.navigate(['/login']);
    },error => {
      console.log(error);
    });
  }
  openAddPhotoDialog(): void {
    if(this.currentWeather.weatherInfo.id==null){
      return;
    }

   const dialogRef = this.photoDialog.open(PhotoDialogComponent,{
     panelClass: 'my-panel',
     width: '40%',
     minWidth: '250px',
     height: '270px',
     minHeight: '220px',
     data: {}
   });
   dialogRef.afterClosed().subscribe(result => {
     if(result==undefined || result.photo == undefined){
       return;
     }
     this.retreiveDataFromAddPhotoDialog(result);
   },error=>{
       console.log("error");
     });
 }

 retreiveDataFromAddPhotoDialog(result :any){
     if(result.title == undefined){
       if(result.fileName==undefined){
         result.title="";
         return;
       }
       result.title = result.fileName;
     }
     if(result.description==undefined){
       result.description = "";
     }
     this.savePhoto(result);
 }
 savePhoto(result :any){
   let uploadedPhoto = new Photo();
   uploadedPhoto.description = result.description;
   uploadedPhoto.title = result.title;
   uploadedPhoto.fileName = result.fileName;
   uploadedPhoto.content = btoa(result.photo);
   uploadedPhoto.weatherInfoId = WeatherTransactionList.currentWeather.weatherInfo.id;
   this.weatherServiceService
   .addWeatherPhoto(uploadedPhoto.weatherInfoId,uploadedPhoto)
   .subscribe(data=>{
     uploadedPhoto.content = data.content;
     uploadedPhoto.id = data.id;
     uploadedPhoto.weatherInfoId = data.weatherInfoId;
     console.log(uploadedPhoto);
     if(WeatherTransactionList.currentWeather.weatherInfo.photos==null){
      WeatherTransactionList.currentWeather.weatherInfo.photos = new Array();
     }
     WeatherTransactionList.currentWeather.weatherInfo.photos.push(uploadedPhoto);
   }
 );
 }

 get currentWeather(){
   return WeatherTransactionList.currentWeather;
 }

 get isGallery(){
   return GalleryModel.show;
 }
 showGallery(){
   GalleryModel.show = true;
 }
}
