import React from 'react';
import './Style.css';
import WaypointME from "./MapElement"
import WaypointRE from "./RouteElement"

import Icon from "./icon_button_waypoint.png"
import adviceGif from "./advice_waypoint.gif"

import { connect } from 'react-redux';
import { update_modal_message, change_active_RC_button, set_currentIDConstr } from '../../../AppSlice';

let module_name = "Waypoint"

function add(e){
  let [flag, modal_info] = e.route.validate(module_name)
  if(!flag){
    e.button.props.update_modal_message(
      {
        active:"active", 
        ...modal_info
      }
    )
    e.button.props.change_active_RC_button(null)
    e.route.map.unsetEventListener(e.route.map)
  }
  else{
    e.route._append(
      module_name,
      WaypointME,
      WaypointRE,
      {},
      true,
      e
    )
  }



  // let val = e.route.validate(BRM_ID)
  // if(val[0] == false){
  //   e.button.props.openModal(
  //     val[1].heading,
  //     val[1].text
  //   )
  //   return
  // }

  // let cords = e.lngLat;
  // let marker = new mapboxgl.Marker(
  //     {
  //         draggable: true
  //     }
  // );
  // let id = e.route.getNewId();
  // let mapElement = new WaypointPoint(marker);
  // marker.setLngLat(cords).addTo(e.map);
  // let routeElementParameters = {
  //   id:id,

  //   min_alt:e.route.defaultValues.min_alt,
  //   max_alt:e.route.defaultValues.max_alt,
  //   alt:e.route.defaultValues.alt,

  //   min_yaw:e.route.defaultValues.min_yaw,
  //   max_yaw:e.route.defaultValues.max_yaw,
  //   yaw:e.route.defaultValues.yaw,

  //   min_hold:e.route.defaultValues.min_hold,
  //   max_hold:e.route.defaultValues.max_hold,
  //   hold:e.route.defaultValues.hold,

  //   min_speed:e.route.defaultValues.min_speed,
  //   max_speed:e.route.defaultValues.max_speed,
  //   speed:e.route.defaultValues.speed,

  //   lng:cords.lng,
  //   lat:cords.lat,

  //   map_element:mapElement,
  //   route:e.route,
  //   active:""
  // };
  // let node = e.route._append(BRM_ID, mapElement, WaypointRouteElement, routeElementParameters, true)
  // // let node = e.route.appendAfterCurrent(BRM_ID, mapElement, WaypointRouteElement, routeElementParameters, true)
  
  // routeElementParameters.node = node;
  // node.react_component_params = routeElementParameters
}

class WaypointButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {}
    
    this.onClickHandler = this.onClickHandler.bind(this);
    this.addEvent = (e) => {e.button = this; e.route = this.props.route; add(e)}
  }
  componentDidMount(){
    this.props.route.addValidator(module_name, function(route){
      let t1 = route.current_node == route.head
      let t2 = route.isUsed("Land").flag == ""
      let t3 = route.isUsed("RTL").flag == ""
      let t4 = route.current_node == route.tail

      if(t1){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Точка взлета должна быть первой в миссии"
          }
        ]
      }
      else if(t4 && !t2){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Точка посадки должна быть последней в миссии"
          }
        ]
      }
      else if(t4 && !t3){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Возврат должен быть последним в миссии"
          }
        ]
      }
      else{
        return [true,{}]
      }
    })
  }
  onClickHandler(e){
    e.preventDefault()
    let [flag, modal_info] = this.props.route.validate(module_name)
    if(!flag){
      this.props.update_modal_message(
        {
          active:true, 
          ...modal_info
        }
      )
    }
    else{
      if(this.props.id === this.props.app.active_RC_button){
        this.props.change_active_RC_button(null)
        this.props.route.map.unsetEventListener(this.props.route.map)
      }
      else{
        this.props.change_active_RC_button(this.props.id)
        this.props.route.map.setEventListener(this.props.route.map, this.addEvent)
      }
    }
  }
  render(){
    return (
      <div className="button-all">
        <div className={(this.props.id === this.props.app.active_RC_button ? "button--instrument waypoint " + this.state.used + " active": "button--instrument waypoint " + this.state.used) + " button--hid"}>
          <a onClick={this.onClickHandler} id="button-add-waypoint" href="" >
            <img src={Icon} className="button__icon--instrument" alt=""/>
          </a>
      </div>
      <div className="hidden--constr" style={this.props.app.settings[2].value==1?{display:"none"}:{}}>
        <p className='button__name--heading'>Путевая точка</p>
          <div className='button__container--advice'>
            <p>
            Эта кнопка предназначена для установки на пользовательскую карту 
            маркера рядовой точки маршрута ПЗ. 
            </p>
            <img src={adviceGif} className="button__advice_gif" alt=""/>
            <p>
            Для добавления данного элемента также нажмите соответсвующую кнопку, 
            затем нажмите ЛКМ на месте карты, где необходимо установить маркер, 
            затем настройте высоту взлета, отклонение, зависание и скорость БПАЛ в блоке настройки элемента в 
            правой части интерфейса.
            
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
    'update_modal_message': (data) => dispatch(update_modal_message(data)),
    'change_active_RC_button': (data) => dispatch(change_active_RC_button(data)),
    'set_currentIDConstr': (data) => dispatch(set_currentIDConstr(data))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(WaypointButton)

