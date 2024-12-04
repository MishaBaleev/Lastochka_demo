import React from 'react';
import './WeatherInfoPanel.css';
import pressureIcon from './imgs/pressure.png';
import temperatureIcon from './imgs/temperature.png';
import temperatureFeelsLikeIcon from './imgs/like_feels_temperature.png';
import humidityIcon from './imgs/humidity.png';
import visibilityIcon from './imgs/visibility.png';
import windIcon from './imgs/wind.png';
import windDirectionIcon from './imgs/wind_direction.png';
import axios from 'axios';
import sun_cloudIcon from "./imgs/sun_cloud.png";
import { connect } from 'react-redux';

class WeatherInfoPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      temperature:"20",
      temperature_f:"68",
      wind_speed:"5",
      wind_degree:"30",
      wind_direction:"Ю",
      weather_img:"",
      near_city:"Таганрог",
      pressure:"760",
      humidity:"90",
      visibility:"1000",
      weather_code:"-",
      last_update:"",
      update_status:2
    }
    this.interval = [];
    this.chooseWindDirection = this.chooseWindDirection.bind(this);
    this.getWeather = this.getWeather.bind(this);
  }
  chooseWeatherImg(){
    if(this.props.params.weather===0) return <img src={sun_cloudIcon} className="icons" alt=""/>
  }
  chooseWindDirection(degree){
    if(degree > 0 && degree < 90) return "СВ"
    if(degree == 0 || degree == 360) return "С"
    if(degree == 90) return "В"
    if(degree > 90 && degree < 180) return "ЮВ"
    if(degree == 180) return "Ю"
    if(degree > 180 && degree < 270) return "ЮЗ"
    if(degree == 270) return "З"
    if(degree > 270 && degree < 360) return "СЗ"
  }
  getWeather(){
    
  }
  componentDidMount(){
    this.getWeather()
  }
  componentWillUnmount(){
    clearInterval(this.interval[0])
  }
  render() {
    return (
      <div className="container--weather d-flex">
        <div className="container--inner--weather">
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={temperatureIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header" >Действ. температура</p>
            <p className="text--weather">{this.state.temperature} °C</p>
          </div>
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={temperatureFeelsLikeIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Ощущ. температура</p>
            <p className="text--weather">{this.state.temperature_f} °C</p>
          </div>
        </div>
        <div className="container--inner--weather">
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={pressureIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Атм. давление</p>
            <p className="text--weather">{this.state.pressure} гПа</p>
          </div>
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={this.state.weather_img} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Город</p>
            <p className="text--weather">{this.state.near_city}</p>
          </div>
        </div>
        <div className="container--inner--weather">
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={humidityIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Влажность</p>
            <p className="text--weather">{this.state.humidity} %</p>
          </div>
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={visibilityIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Дальность видим.</p>
            <p className="text--weather">{this.state.visibility}м</p>
          </div>
        </div>
        <div className="container--inner--weather">
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={windIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Скорость ветра</p>
            <p className="text--weather">{this.state.wind_speed} м/с</p>
          </div>
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={windDirectionIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Напр-ние ветра</p>
            <p className="text--weather">{this.state.wind_degree} ° {this.state.wind_direction}</p>
          </div>
        </div>
        <div className="container--inner--weather" style={{justifyContent: 'center'}}>
          <div className="d-flex column--weather">
            {/* <p className="icon__container--weather"><img src={windIcon} className="icons mr-1" alt=""/></p> */}
            <p className="text--weather" style={{color:this.state.weather_code.color}}>{this.state.weather_code.message}</p>
          </div>
          <div className="d-flex column--weather">
            <p className="text--weather">
              {this.state.update_status === 0 ? "Ошибка обновления" : ""}
              {this.state.update_status === 1 ? "Обновлено" : ""}
              {this.state.update_status === 2 ? "Обновляется" : ""}
              {this.state.last_update === "" ? "" : " ("+this.state.last_update.split("T")[1].split(".")[0]+")"} 
            </p>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WeatherInfoPanel)