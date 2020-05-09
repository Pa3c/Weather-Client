
import {WeatherTransaction} from './weather-transaction';
export class Filter{
    country :string="";
    city :string="";
    latFrom :number;
    latTo :number;
    lonFrom :number;
    lonTo :number;
    dateFrom :Date
    dateTo :Date
    hourFrom :string="";
    hourTo :string="";
    keywords :string="";
}
export class Sorter{
    constructor(
        private country :number,
        private city :number,
        private day :number,
        private hour :number){
    }

    countrySort(transactionList :Array<WeatherTransaction>){
        this.country*=-1;
        return transactionList.sort((one, two) => (one.weatherInfo.country > two.weatherInfo.country ? -1*this.country : 1*this.country));
    }
    citySort(transactionList :Array<WeatherTransaction>){
        this.city*=-1;
        return transactionList.sort((one, two) => (one.weatherInfo.city > two.weatherInfo.city ? -1*this.city : 1*this.city));
    }
    dateSort(transactionList :Array<WeatherTransaction>){
        this.day*=-1;
        return transactionList.sort((one, two) => (one.weatherInfo.day > two.weatherInfo.day ? -1*this.day : 1*this.day));
    }
    hourSort(transactionList :Array<WeatherTransaction>){
        this.hour*=-1;
        return transactionList.sort((one, two) => (one.weatherInfo.hour > two.weatherInfo.hour ? -1*this.hour : 1*this.hour));
    }
}
export class TextChanger{
    changetemperatureCText :boolean = false;
    changeDateText :boolean = false;
    changeCountryText :boolean = false;
    changeHourText :boolean = false;
    changeCityText :boolean = false;
    changetemperatureFText :boolean = false;
    changeLatText :boolean = false;
    changeLonText :boolean = false;
    changeHumidityText :boolean = false;
    changePressureText :boolean = false;
    changeSunriseText :boolean = false;
    changeSunsetText :boolean = false;
}
