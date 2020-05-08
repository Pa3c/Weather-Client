import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponentComponent } from './components/home-component/home-component.component';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { RegisterComponentComponent } from './components/register-component/register-component.component';
import { WeatherDisplayComponentComponent } from './components/weather-display-component/weather-display-component.component';

const routes: Routes = [
  {path:'',redirectTo: 'home',pathMatch: 'full'},
  {path:'home',component: HomeComponentComponent},  
  {path:'login',component: LoginComponentComponent},
  {path:'register',component: RegisterComponentComponent},    
  {path:'weather',component: WeatherDisplayComponentComponent}    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
