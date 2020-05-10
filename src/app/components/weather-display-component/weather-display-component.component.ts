import { Component, OnInit,Inject} from '@angular/core';
import {UserServiceService} from '../../services/user-service.service';
import {WeatherServiceService} from '../../services/weather-service.service';
import {WeatherTransaction} from '../../model/weather-transaction';
import {User} from '../../model/user';
import {Router} from '@angular/router';
import {CurrentWeatherComponent} from '../current-weather/current-weather.component';
import {DatePipe} from '@angular/common';
import {WeatherInfo} from '../../model/weather-info';
import {Country} from '../../model/country';
import {WeatherTransactionList,GalleryModel,Filter,Sorter,TextChanger} from '../../model/common';
import {GalleryComponent} from '../gallery/gallery.component';
import { Photo } from 'src/app/model/photo';
@Component({
  selector: 'app-weather-display-component',
  templateUrl: './weather-display-component.component.html',
  styleUrls: ['./weather-display-component.component.css']
})
export class WeatherDisplayComponentComponent implements OnInit {

  user: User;
  placeToSearch: string= "";
  weatherFilter :Filter;
  sorter :Sorter;
  
  constructor(private userService: UserServiceService,
    private weatherServiceService: WeatherServiceService,
    private router: Router,
    private datePipe: DatePipe,private currentWeatherComponent :CurrentWeatherComponent,private galleryComponent :GalleryComponent) {
    this.user = this.userService.currentUserValue;
    this.weatherFilter = new Filter(); 
    this.sorter = new Sorter(1,1,1,1);
  }

  
  setCurrentWeather(transactionId :number){
    GalleryModel.show = false;
    WeatherTransactionList.currentWeather = WeatherTransactionList.transactionList.find(x => x.id==transactionId);
    WeatherTransactionList.currentWeather.userId = this.user.id;
  }
  searchForWeather(){
    this.weatherServiceService.searchForTheWeather(this.placeToSearch).subscribe(data =>{
      WeatherTransactionList.currentWeather = new WeatherTransaction();
      WeatherTransactionList.currentWeather.userId = this.user.id;
      WeatherTransactionList.currentWeather.id = null;
      let wi = new WeatherInfo();
      wi.id = null;
      WeatherTransactionList.currentWeather.weatherInfo = wi;
      let weatherDate = new Date(data.dt*1000);
      WeatherTransactionList.currentWeather.weatherInfo.date = weatherDate;
      WeatherTransactionList.currentWeather.weatherInfo.day = this.datePipe.transform(weatherDate,"dd-MM-yyyy");
      WeatherTransactionList.currentWeather.weatherInfo.hour = this.datePipe.transform(weatherDate,"HH:mm");

      let country = Country[data.sys.country];
      if(country==null || country == undefined){
        WeatherTransactionList.currentWeather.weatherInfo.country = "Unknown";
      }else{
        WeatherTransactionList.currentWeather.weatherInfo.country = country;
      }
      
      if(this.placeToSearch.includes(",")){
        WeatherTransactionList.currentWeather.weatherInfo.city = "Unknown";
      }else{
        WeatherTransactionList.currentWeather.weatherInfo.city = this.placeToSearch;
      }
      WeatherTransactionList.currentWeather.weatherInfo.temperatureC = +(Math.round((data.main.temp-273.15) * 100) / 100).toFixed(2);
      WeatherTransactionList.currentWeather.weatherInfo.temperatureF = +(Math.round((WeatherTransactionList.currentWeather.weatherInfo.temperatureC/5*9+32) * 100) / 100).toFixed(2);
      WeatherTransactionList.currentWeather.weatherInfo.latitude = data.coord.lat;
      WeatherTransactionList.currentWeather.weatherInfo.longitude = data.coord.lon;
      WeatherTransactionList.currentWeather.weatherInfo.humidity = data.main.humidity;
      WeatherTransactionList.currentWeather.weatherInfo.pressure = data.main.pressure;
      WeatherTransactionList.currentWeather.weatherInfo.sunrise = this.datePipe.transform(data.sys.sunrise*1000,"HH:mm:ss");
      WeatherTransactionList.currentWeather.weatherInfo.sunset = this.datePipe.transform(data.sys.sunset*1000,"HH:mm:ss");

    },error=>{
      console.log(error);
    })
  }
  ngOnInit() {
    if(!this.user){
      this.router.navigate(['/login']);
    }
   this.findUserTransactions(); 

  }
  findUserTransactions(){
    this.weatherServiceService.findUserTransactions(this.user.id).subscribe(data => {
      WeatherTransactionList.transactionList = data;
    });
  }


  deleteWeather(id :number){
   let index = WeatherTransactionList.transactionList.findIndex(x=>x.id==id);
   WeatherTransactionList.transactionList.splice(index,1);
   this.weatherServiceService.deleteUserWeather(id).subscribe(()=>{
     console.log("Delete completed");
     WeatherTransactionList.currentWeather = new WeatherTransaction();
     WeatherTransactionList.currentWeather.id = null;
     WeatherTransactionList.currentWeather.userId = this.user.id;
     WeatherTransactionList.currentWeather.weatherInfo = new WeatherInfo();
   });
  }

  filterWeathers(){
    this.weatherServiceService.findUserTransactions(this.user.id).subscribe(data => {
      WeatherTransactionList.transactionList = data;
      
    },error=>console.log(error),()=>this.filter());
  }
  filter(){
    this.setDefaultVariablesToWeatherFilter()
    WeatherTransactionList.transactionList =  WeatherTransactionList.transactionList
    .filter(x=>x.weatherInfo.country.includes(this.weatherFilter.country))
    .filter(x=>x.weatherInfo.city.includes(this.weatherFilter.city))
    .filter(x=>x.weatherInfo.latitude>=this.weatherFilter.latFrom&&x.weatherInfo.latitude<=this.weatherFilter.latTo)
    .filter(x=>x.weatherInfo.longitude>=this.weatherFilter.lonFrom&&x.weatherInfo.longitude<=this.weatherFilter.lonTo)
    .filter(x=>{
      if(this.weatherFilter.keywords == undefined || this.weatherFilter.keywords == null || this.weatherFilter.keywords.length==0){
        return true;
      }
      let regex = new RegExp("\\s+|,\\s*|\\.\\s*");
      let keywords = this.weatherFilter.keywords.split(regex);
      let photos = x.weatherInfo.photos;
      let filtered = photos.filter(y=>{
       let title = y.title.split(regex);
       let desc = y.description.split(regex);   
      for(let keyword of keywords){
         if(title.includes(keyword)){
           return true;
         }
        if(desc.includes(keyword)){
          return true;
        }
      }
      return false;
      });
      if(filtered.length>0){
        return true;
      }
      return false;
    })
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
      WeatherTransactionList.transactionList = this.sorter.countrySort(WeatherTransactionList.transactionList); 
      break;
      case 1: 
      WeatherTransactionList.transactionList = this.sorter.citySort(WeatherTransactionList.transactionList); 
      break;
      case 2: 
      WeatherTransactionList.transactionList = this.sorter.dateSort(WeatherTransactionList.transactionList); 
      break;
      case 3: 
      WeatherTransactionList.transactionList = this.sorter.hourSort(WeatherTransactionList.transactionList); 
      break;
    }
  }

  get transactionList(){
    return WeatherTransactionList.transactionList;
  }

  get isGallery(){
    this.galleryComponent.currentPhoto.content = null;
    return GalleryModel.show;
  }
}
