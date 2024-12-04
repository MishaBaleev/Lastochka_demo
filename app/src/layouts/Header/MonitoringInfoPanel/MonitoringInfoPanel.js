import React from 'react';
import './MonitoringInfoPanel.css';
import routeIcon from './imgs/route.png';
import timeIcon from './imgs/time.png';
import { connect } from 'react-redux';


class MonitoringInfoPanel extends React.Component {
  constructor(props){
    super(props);
    this.timeFormat = this.timeFormat.bind(this);
    this.distanceFormat = this.distanceFormat.bind(this);
  }
  timeFormat(time){
    if(isNaN(time)) return "-:-:-"
    let hours = Math.floor(time / 3600)
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = time - (hours * 3600) - (minutes * 60);

    seconds = Math.trunc(seconds)
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours + ':' + minutes + ':' + seconds;
  }
  distanceFormat(distance){
    if(isNaN(distance)) return "-:-:-"
    if(distance > 1000){
      let km = Math.trunc(distance/1000)
      let meters = distance-km*1000
      return km + 'км ' +  Math.trunc(meters) + 'м';
    }
    else{
      return Math.trunc(distance) + 'м';
    }
  }
  render() {
    return (
      <div className="container--weather d-flex">
        <div className="container--inner--weather">
          {/* <div className="d-flex column--weather">
            <p className="text--weather"></p>
            <p className="text--weather">Азимут до следующей точки {isNaN(this.props.app.monitoring_wp_azimuth)  ? "-" : Math.trunc(this.props.app.monitoring_wp_azimuth)} °</p>
          </div> */}
          <div className="d-flex column--weather">
            <p className="text--weather"></p>
            <p className="text--weather">Текущий азимут {Math.trunc(this.props.app.monitoring_cur_azimuth)} °</p>
          </div>
        </div>
        {/* <div className="container--inner--weather">
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={routeIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Длина маршрута</p>
            <p className="text--weather">{this.distanceFormat(this.props.app.monitoring_distance)}</p>
          </div>
          <div className="d-flex column--weather">
            <p className="icon__container--weather"><img src={timeIcon} className="icons mr-1" alt=""/></p>
            <p className="hidden--header">Время маршрута</p>
            <p className="text--weather">{this.timeFormat(this.props.app.monitoring_time)}</p>
          </div>
        </div>
        <div className="container--inner--weather">
          <div className="d-flex column--weather">
            <p className="text--weather"></p>
            <p className="text--weather">Расстояние до точки {this.distanceFormat(this.props.app.monitoring_wp_distance)}</p>
          </div>
        </div> */}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MonitoringInfoPanel)
