import React from 'react';
import './Style.css';
import RTLME from "./MapElement"
import RTLRE from "./RouteElement"
import Icon from "./icon_button_RTL.png"
import adviceGif from "./advice.gif"
import { connect } from 'react-redux';
import { update_modal_message, change_active_RC_button } from '../../../AppSlice';

let module_name = "RTL"

// function add(e){
//   let val = e.route.validate(BRM_ID)
//   if(val[0] == false){
//     e.button.props.openModal(
//       val[1].heading,
//       val[1].text
//     )
//     return
//   }
//   // e.map.unsetEventListener(e.map)
//   // let cords = e.lngLat;
//   // let marker = new mapboxgl.Marker(
//   //     {
//   //         draggable: true
//   //     }
//   // );
//   // let id = e.route.getNewId();
//   // let mapElement = new RTLPoint(marker);
//   // marker.setLngLat(cords).addTo(e.map);
//   // let routeElementParameters = {
//   //   id:id,
//   //   min_alt:e.route.defaultValues.min_alt,
//   //   alt:e.route.defaultValues.alt,
//   //   yaw:e.route.defaultValues.yaw,
//   //   lng:cords.lng,
//   //   lat:cords.lat,
//   //   map_element:mapElement,
//   //   route:e.route,
//   //   active:"",
//   //   setUsed:e.button.setUsed
//   // };
//   // let node = e.route.appendAfterCurrent(mapElement, RTLRouteElement, routeElementParameters, true)
  
//   // routeElementParameters.node = node;
//   // node.react_component_params = routeElementParameters
//   // e.button.props.unsetActiveButton()
//   // e.button.setState(state => ({
//   //   used: "used"
//   // }));
// }

class RTLButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      used:""
    }
    this.onClickHandler = this.onClickHandler.bind(this);
    // this.addEvent = (e) => {e.button = this; e.map = this.props.map; e.route = this.props.route; add(e)}
  }
  componentDidMount(){
    this.props.route.addValidator(module_name, function(route){
      let t1 = (route.tail.params.module.name == "MissionStart")?false:(route.tail.params.module.name == "Takeoff")?false:true//route.current_node == route.tail
      let t2 = route.isUsed("RTL").flag == ""
      let t3 = route.isUsed("Land").flag == ""
      if(!t1){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Миссия содержит недостаточное количество путевых элементов",
          }
        ]
      }
      else if(t1 && !t2){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Возврат уже добавлен"
          }
        ]
      }
      else if(t1 && !t3){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Задание уже имеет завершение"
          }
        ]
      }
      else{
        return [true, {x: route.current_node, y: t2, z: t3}]
      }
    })
  }
  onClickHandler(e){
    e.preventDefault()
    let [flag, modal_info] = this.props.route.validate(module_name)
    console.log(modal_info)
    if(!flag){
      console.log(1111)
      this.props.update_modal_message(
        {
          active:true, 
          ...modal_info
        }
      )
    }
    else{
      console.log(2222)
      this.props.route._append(
        module_name,
        null,
        RTLRE,
        {button: this},
        false,
        {},
        true
      )
      this.setState(state => ({
        used: "used"
      }));
      this.props.change_active_RC_button(null)
      this.props.tbManager.unitSpheres(this.props.route)
      this.props.tbManager.checkCollision(this.props.route)

      // if(this.props.id === this.props.app.active_RC_button){
      //   this.props.change_active_RC_button(null)
      //   this.props.route.map.unsetEventListener(this.props.route.map)
      // }
      // else{
      //   this.props.change_active_RC_button(this.props.id)
      //   this.props.route.map.setEventListener(this.props.route.map, this.addEvent)
      // }




    // let isUsed = this.props.route.isUsed(BRM_ID)
    // if(isUsed == "used"){
    //   this.props.openModal(
    //     "Возврат на точку взлета уже добавлен",
    //     "В полетном задании уже есть возврат на точку взлета"
    //   )
    // }
    // else{
    //   let val = this.props.route.validate(BRM_ID)
    //   if(val[0] == false){
    //     this.props.openModal(
    //       val[1].heading,
    //       val[1].text
    //     )
    //     return
    //   }
    //   else{
    //     this.props.route._append(BRM_ID, null, RTLRouteElement, 
    //       {
    //         id:0,
    //         min_alt:this.props.route.defaultValues.min_alt,
    //         max_alt:this.props.route.defaultValues.max_alt,
    //         alt:this.props.route.defaultValues.alt,
    //         changeDefaultParam:this.changeDefaultParam,
    //         route:this.props.route,
    //         // active:"",
    //         setUsed:this.setUsed
    //       },
    //       false,
    //       true)
    //   }
    // }


    // if(isUsed == "used"){
    //   this.props.openModal(
    //     "Возврат на точку взлета уже добавлен",
    //     "В полетном задании уже есть возврат на точку взлета"
    //   )
    // }
    // else{


    //   if(this.props.active == "active"){
    //     this.props.unsetActiveButton()
    //     // this.props.map.unsetEventListener(this.props.map)
    //   }
    //   else{




    //     this.props.setActiveButton(this.props.id)
    //     // this.props.map.setEventListener(this.props.map, this.addEvent)
    //   }
    // }
      }
  }
  render(){
    return (
      <div className="button-all">
        <div className={(this.props.id === this.props.app.active_RC_button ? "button--instrument RTL " + this.props.route.isUsed(module_name).flag + " active": "button--instrument RTL " + this.props.route.isUsed(module_name).flag) + " button--hid"}>
          <a onClick={this.onClickHandler} id="button-add-RTL" href="" >
            <img src={Icon} className="button__icon--instrument" alt=""/>
          </a>
        </div>
        <div className="hidden--constr" style={this.props.app.settings[2].value==1?{display:"none"}:{}}>
            <p className='button__name--heading'>Возврат на точку взлета</p>
            <div className='button__container--advice'>
              <p>
              Эта кнопка предназначена для соединения последней точки маршрута с точкой взлета, 
              что образует кольцевой маршрут, где точка старта является точкой окончания ПЗ.
              </p>
              <img src={adviceGif} className="button__advice_gif" alt=""/>
              <p>
              Эта кнопка предназначена для соединения последней точки маршрута с точкой взлета, 
              что образует кольцевой маршрут, где точка старта является точкой окончания ПЗ. 
              Для добавления данного элемента достаточно лишь нажать на соответсвующую кнопку, затем настроить высоту взлета и скорость БПЛА в блоке настройки элемента в правой части интерфейса.
              </p>
              <p className="button_important--advice">
                Нельзя добавить возврат на точку старта, если есть точка посадки.
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
    'change_active_RC_button': (data) => dispatch(change_active_RC_button(data))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RTLButton)

