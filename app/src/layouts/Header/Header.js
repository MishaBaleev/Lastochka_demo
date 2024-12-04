import React from 'react';
import './Header.css';
import mainLogo from "./imgs/logo.png"
import Menu from '../../Menu/Menu';
import RouteInfoPanel from './RouteInfoPanel/RouteInfoPanel';
import WeatherInfoPanel from './WeatherInfoPanel/WeatherInfoPanel';
import MonitoringInfoPanel from './MonitoringInfoPanel/MonitoringInfoPanel'

import { connect } from 'react-redux';
import axios from 'axios';
import { update_modal_message } from '../../AppSlice';

let components_id = {
  0:WeatherInfoPanel,
  1:RouteInfoPanel
}

let components = {
  0:{
    'component':WeatherInfoPanel,
    parameters:{
      temperature:-10,
      weather:0,
      wind_speed:10,
      wind_direction:0
    }
  },
  1:{
    'component':RouteInfoPanel,
    parameters:{
      time:1000,
      distance:1000,
    }
  },
  2:{
    'component':MonitoringInfoPanel,
    parameters:{
      time:1000,
      distance:1000,
    }
  }
}
class Header extends React.Component {
  constructor(props){
    super(props);
    this.componentsWithMap = [
      0, 1, 3
    ]

    this.quitButtonOnClick = this.quitButtonOnClick.bind(this)
  }
  quitButtonOnClick(){
    this.props.update_modal_message({active: true, heading: "Предупреждение", message: "Эта функция доступна в полной версии приложения"})
  }
  render() {
    return (
      <div className="header col-md-12">
          <div className="header__panel d-flex">
              <Menu/>
              {/* <section className="header__container--main d-flex">
                  <a href="" className="logo">
                      <img width="55px" height="auto" src={mainLogo} alt=""/>
                  </a>
              </section> */}
              <img className="mainLogo" src={mainLogo} alt="#"/>
              <section className='header__container--custom'>
                <ul className='header__list--custom'>
                  {this.props.app.header_content[this.props.app.active_page_id].map(index=>{
                    let Cmp = components[index].component;
                    return <li key={index} className='header__item--custom'>
                              <Cmp params={components[index].parameters}/>
                           </li>
                  })}
                </ul>
              </section>
              <button className="header--quitButton" onClick={this.quitButtonOnClick}>
                <div className="header--quitButton--line first"></div>
                <div className="header--quitButton--line second"></div>
              </button>
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
    "update_modal_message": (data) => {dispatch(update_modal_message(data))}
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
