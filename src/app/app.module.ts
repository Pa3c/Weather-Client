import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms'; // <== add the imports!

import { AppRoutingModule } from './app-routing.module';
import { UserServiceService } from './services/user-service.service';
import { AppComponent } from './app.component';
import { HomeComponentComponent } from './components/home-component/home-component.component';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { RegisterComponentComponent } from './components/register-component/register-component.component';
import { WeatherDisplayComponentComponent } from './components/weather-display-component/weather-display-component.component';
import {HttpClientModule} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './materials/material.module';
import { PhotoDialogComponent } from './components/photo-dialog/photo-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponentComponent,
    LoginComponentComponent,
    RegisterComponentComponent,
    WeatherDisplayComponentComponent,
    PhotoDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,ReactiveFormsModule,
    BrowserAnimationsModule, MaterialModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
  entryComponents: [PhotoDialogComponent]
})
export class AppModule { }
