import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {WeatherTransaction} from '../model/weather-transaction';
import {Photo} from "../model/photo"

let API_URL = "http://localhost:1234/api/weather/service/weather-info/";
let API_URL_PHOTO = "http://localhost:1234/api/weather/service/photo/";

@Injectable({
  providedIn: 'root'
})
export class WeatherServiceService {

  constructor(private http: HttpClient) {
   }

   saveWeather(transaction: WeatherTransaction): Observable<any> {
    
    return this.http.post(API_URL,transaction,{headers: {
       "Content-Type":"application/json; charset=UTF-8"
     }});
   }

   findUserTransactions(userId: number) : Observable<any> {
     return this.http.get(API_URL+userId,{headers : {
      "Content-Type":"application/json; charset=UTF-8"
    }});
   }

   deleteUserWeather(weatherId: number) : Observable<any> {
     return this.http.post(API_URL+"delete/"+weatherId,{headers : {
      "Content-Type":"application/json; charset=UTF-8"
    }});
   }


   deleteWeatherPhoto(photoId: number): Observable<any>{
     return this.http.delete(API_URL_PHOTO+photoId,{headers : {
      "Content-Type":"application/json; charset=UTF-8"
    }});
   }

  addWeatherPhoto(weatherId: number,photo :Photo): Observable<any>{
    return this.http.post(API_URL+"/photo/"+weatherId,{headers: {
      "Content-Type":"application/json; charset=UTF-8"
   }});
  }

  searchForTheWeather(place: string): Observable<any>{

    if(new RegExp("^[a-zA-Z]+$").test(place)){
      return this.searchByCityName(place);
    }
    else if(place.includes(",")){
      let coords = place.split(",");
      if(coords.length!=2){
        return null;
      }
      let lon = coords[0];
      let lat = coords[1];

      if(!this.isDoubleOrInt(lat)){
        console.log("Lat is not a valid number");
        return null;
      }
      if(!this.isDoubleOrInt(lon)){
        console.log("Lon is not a valid number");
        return null;
      }
      return this.searchByCoords(+lat,+lon);
    }
  }

  searchByCoords(lat :number, lon :number){
    if(lat>90 || lat<-90){
      console.log("Latitude should be between -90 and 90 degrees");
      return null;
    }
    if(lon>180 || lon<-180){
      console.log("Longitude should be between -180 and 180 degrees");
      return null;
    }
    let CORS = "https://cors-anywhere.herokuapp.com/";
    let API_URL = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid=";
    let API_KEY = "ca9e8ed54495b520f0eaa6879bc58dfa";
    
    return this.http.get(CORS+API_URL+API_KEY,{headers: {
      "Content-Type":"application/json; charset=UTF-8"
   }});
  }
  searchByCityName(city :string){
    let CORS = "https://cors-anywhere.herokuapp.com/";
    let API_URL = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=";
    let API_KEY = "ca9e8ed54495b520f0eaa6879bc58dfa";
    return this.http.get(CORS+API_URL+API_KEY,{headers: {
      "Content-Type":"application/json; charset=UTF-8"
   }}); 
  }

  isDoubleOrInt(text :string){
    return new RegExp('^\-?[0-9]+\.?[0-9]{0,5}?$').test(text);
  }
}
