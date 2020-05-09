import { Component, OnInit,Inject} from '@angular/core';
import {UserServiceService} from '../../services/user-service.service';
import {WeatherServiceService} from '../../services/weather-service.service';
import {WeatherInfo} from '../../model/weather-info';
import {Photo} from '../../model/photo';
import {WeatherTransaction} from '../../model/weather-transaction';
import {User} from '../../model/user';
import {Router} from '@angular/router';
import { DatePipe } from '@angular/common';
import { Country } from '../../model/country';
import { Filter,Sorter,TextChanger } from 'src/app/model/filter';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PhotoDialogComponent} from '../photo-dialog/photo-dialog.component'; 

@Component({
  selector: 'app-weather-display-component',
  templateUrl: './weather-display-component.component.html',
  styleUrls: ['./weather-display-component.component.css']
})
export class WeatherDisplayComponentComponent implements OnInit {

  user: User;
  transactionList: Array<WeatherTransaction>;
  currentWeather: WeatherTransaction;
  placeToSearch: string= "";
  weatherFilter :Filter;
  sorter :Sorter;
  textChanger :TextChanger;
  
  constructor(public photoDialog: MatDialog,private userService: UserServiceService,
    private weatherServiceService: WeatherServiceService,
    private router: Router,
    private datePipe: DatePipe) {
    this.user = this.userService.currentUserValue;
    this.weatherFilter = new Filter();
    this.textChanger = new TextChanger();
    this.sorter = new Sorter(1,1,1,1);
  }

  ngOnInit() {
    if(!this.user){
      this.router.navigate(['/login']);
    }
   this.findUserTransactions(); 
   this.currentWeather = new WeatherTransaction();
   this.currentWeather.weatherInfo = new WeatherInfo();
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
    uploadedPhoto.weatherInfoId = this.currentWeather.weatherInfo.id;
    this.weatherServiceService
    .addWeatherPhoto(uploadedPhoto.weatherInfoId,uploadedPhoto)
    .subscribe(data=>{
      uploadedPhoto.content = atob(data.content);
      this.currentWeather.weatherInfo.photos.push(uploadedPhoto);
    }
  );
  }

  findUserTransactions(){
    this.weatherServiceService.findUserTransactions(this.user.id).subscribe(data => {
      this.transactionList = data;
    });
  }

  logout(){
    this.userService.logout().subscribe(data => {
      this.router.navigate(['/login']);
    },error => {
      console.log(error);
    });
  }

  deleteWeather(id :number){
   let index = this.transactionList.findIndex(x=>x.id==id);
   this.transactionList.splice(index,1);
   this.weatherServiceService.deleteUserWeather(id).subscribe(()=>{
     console.log("Delete completed");
   });
  }
  saveWeather(){
    if(this.currentWeather.weatherInfo.day==null ||this.currentWeather.weatherInfo.day==undefined ){
      return;
    }
    console.log("Saving...")
    this.currentWeather.userId = this.user.id;
    this.weatherServiceService.saveWeather(this.currentWeather).subscribe(data=>{
      console.log(data);
      this.transactionList.push(data)
    },error=>{
      console.log(error);
    });
  }

  setCurrentWeather(transactionId :number){
    this.currentWeather = this.transactionList.find(x => x.id==transactionId);
  }
  searchForWeather(){
    this.weatherServiceService.searchForTheWeather(this.placeToSearch).subscribe(data =>{
      this.currentWeather = new WeatherTransaction();
      this.currentWeather.userId = this.user.id;
      this.currentWeather.id = null;
      let wi = new WeatherInfo();
      wi.id = null;
      this.currentWeather.weatherInfo = wi;
      let weatherDate = new Date(data.dt*1000);
      this.currentWeather.weatherInfo.date = weatherDate;
      this.currentWeather.weatherInfo.day = this.datePipe.transform(weatherDate,"dd-MM-yyyy");
      this.currentWeather.weatherInfo.hour = this.datePipe.transform(weatherDate,"HH:mm");

      let country = Country[data.sys.country];
      if(country==null || country == undefined){
        this.currentWeather.weatherInfo.country = "Unknown";
      }else{
        this.currentWeather.weatherInfo.country = country;
      }
      
      if(this.placeToSearch.includes(",")){
        this.currentWeather.weatherInfo.city = "Unknown";
      }else{
        this.currentWeather.weatherInfo.city = this.placeToSearch;
      }
      this.currentWeather.weatherInfo.temperatureC = +(Math.round((data.main.temp-273.15) * 100) / 100).toFixed(2);
      this.currentWeather.weatherInfo.temperatureF = +(Math.round((this.currentWeather.weatherInfo.temperatureC/5*9+32) * 100) / 100).toFixed(2);
      this.currentWeather.weatherInfo.latitude = data.coord.lat;
      this.currentWeather.weatherInfo.longitude = data.coord.lon;
      this.currentWeather.weatherInfo.humidity = data.main.humidity;
      this.currentWeather.weatherInfo.pressure = data.main.pressure;
      this.currentWeather.weatherInfo.sunrise = this.datePipe.transform(data.sys.sunrise*1000,"HH:mm:ss");
      this.currentWeather.weatherInfo.sunset = this.datePipe.transform(data.sys.sunset*1000,"HH:mm:ss");

    },error=>{
      console.log(error);
    })
  }

  filterWeathers(){
    this.weatherServiceService.findUserTransactions(this.user.id).subscribe(data => {
      this.transactionList = data;
      
    },error=>console.log(error),()=>this.filter());
  }
  filter(){
    this.setDefaultVariablesToWeatherFilter()
    this.transactionList =  this.transactionList
    .filter(x=>x.weatherInfo.country.includes(this.weatherFilter.country))
    .filter(x=>x.weatherInfo.city.includes(this.weatherFilter.city))
    .filter(x=>x.weatherInfo.latitude>=this.weatherFilter.latFrom&&x.weatherInfo.latitude<=this.weatherFilter.latTo)
    .filter(x=>x.weatherInfo.longitude>=this.weatherFilter.lonFrom&&x.weatherInfo.longitude<=this.weatherFilter.lonTo)
    .filter(x=>{
      let actualDateTable =  x.weatherInfo.day.split("-"); //"22-05-2012"

      let actualDate = new Date( +actualDateTable[2],+actualDateTable[1]-1,+actualDateTable[0])
      let fromDate =  new Date(this.weatherFilter.dateFrom);
      let toDate = new Date(this.weatherFilter.dateTo);
      if(actualDate>=fromDate && actualDate<=toDate){
        return true;
      }
      return false;
    })
    .filter(x=>{
      let hourFromString = this.weatherFilter.hourFrom.split(":");
      let hourString = x.weatherInfo.hour.split(":");
      let hourToString = this.weatherFilter.hourTo.split(":");
      let from = new Date(0,0,0,+hourFromString[0],+hourFromString[1],0,0);
      let actual = new Date(0,0,0,+hourString[0],+hourString[1],0,0);
      let to = new Date(0,0,0,+hourToString[0],+hourToString[1],0,0);
    if(actual<from || actual>to){
      return false;
    }
    return true;

    });
  }

  setDefaultVariablesToWeatherFilter(){
    if(this.weatherFilter.lonFrom==undefined){
      this.weatherFilter.lonFrom = -180;
    }
    if(this.weatherFilter.lonTo==undefined){
      this.weatherFilter.lonTo = 180;
    }    
    if(this.weatherFilter.latFrom==undefined){
      this.weatherFilter.latFrom = -90;
    }
    if(this.weatherFilter.latTo==undefined){
      this.weatherFilter.latTo = 90;
    }
    if(this.weatherFilter.dateFrom==undefined || this.weatherFilter.dateFrom==null){
      this.weatherFilter.dateFrom =new Date(1970,0,1);
    }
    if(this.weatherFilter.dateTo==undefined || this.weatherFilter.dateFrom==null){
      this.weatherFilter.dateTo = new Date(2099,11,30);
    }
  }

  sort(choose :number){
    switch(choose){
      case 0: 
      this.transactionList = this.sorter.countrySort(this.transactionList); 
      break;
      case 1: 
      this.transactionList = this.sorter.citySort(this.transactionList); 
      break;
      case 2: 
      this.transactionList = this.sorter.dateSort(this.transactionList); 
      break;
      case 3: 
      this.transactionList = this.sorter.hourSort(this.transactionList); 
      break;
    }
  }

}
