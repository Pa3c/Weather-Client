import { Variable } from '@angular/compiler/src/render3/r3_ast';
import {Photo} from "../model/photo"

export class WeatherInfo {
    id: number;
    date :Date;
    day :string="";
    hour :string="";
    country :string="";
    city :string="";
    temperatureF: number;
    temperatureC: number;
    longitude: number;
    latitude: number;
    humidity: number;
    pressure: number;
    sunrise: string="";
    sunset: string="";
    photos: Photo[];
}