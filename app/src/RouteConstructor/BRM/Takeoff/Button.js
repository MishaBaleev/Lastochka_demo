import React from 'react';
import './Style.css';
import TakeoffME from "./MapElement"
import TakeoffRE from "./RouteElement"
import takeoffIcon from "./icon_button_takeoff.png"
import adviceGif from "./advice_takeoff.gif"
import { connect } from 'react-redux';
import { update_modal_message, change_active_RC_button } from '../../../AppSlice';

let module_name = "Takeoff"

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
      TakeoffME,
      TakeoffRE,
      {},
      true,
      e
    )
    e.button.props.change_active_RC_button(null)
    e.route.map.unsetEventListener(e.route.map)
  }
  // e.button.setState(state => ({
  //   used: "used"
  // }));
}

class TakeoffButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      used:""
    }
    this.onClickHandler = this.onClickHandler.bind(this);
    this.addEvent = (e) => { e.button = this;e.route = this.props.route; add(e)}
  }
  componentDidMount(){
    this.props.route.addValidator(module_name, function(route){
      if(route.current_node == route.head){
        let isTakeoffUsed = route.isUsed(module_name)
        if(isTakeoffUsed.flag == "") return [true,{}]
        else
          return [
            false, 
            {
              active:true,
              heading:"Ошибка добавления элемента",
              message:"Точка взлета должна быть первой в миссии",
            }
          ]
      }
      else return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Точка взлета уже добавлена"
          }
        ]
    })
  }
  onClickHandler(e){
    e.preventDefault()
    let uav_id = 1
    let [flag, modal_info] = this.props.route.validate(module_name)
    if(!flag){
      this.props.update_modal_message(
        {
          active:true, 
          ...modal_info
        }
      )
    }
    else if(this.props.app.telemetry[uav_id].length > 0){
      let last_frame = this.props.app.telemetry[uav_id][this.props.app.telemetry[uav_id].length-1]
      console.log(last_frame)
      let e = {
        button:this,
        route:this.props.route,
        lngLat:{
          lng:last_frame.position_lon_deg,
          lat:last_frame.position_lat_deg
        }
      }
      add(e)
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
        <div className={(this.props.id === this.props.app.active_RC_button ? "button--instrument takeoff " + this.props.route.isUsed(module_name).flag + " active": "button--instrument takeoff " + this.props.route.isUsed(module_name).flag) + " button--hid"}>
          <a onClick={this.onClickHandler} id="button--add--takeoff" href="" >
            <img src={takeoffIcon} className="button__icon--instrument" alt=""/>
          </a>
        </div>
        <div className="hidden--constr" style={this.props.app.settings[2].value==1?{display:"none"}:{}}>
          <p className='button__name--heading'>Точка взлета</p>
          <div className='button__container--advice'>
            <p>
            Эта кнопка необходима для установки на пользовательскую карту маркера начала полетного задания, 
            здесь БПЛА начнет ПЗ. 
            </p>
            <img src={adviceGif} className="button__advice_gif" alt=""/>
            <p>
            Для добавления данного элемента нажмите соответствующую кнопку, 
            затем нажмите ЛКМ на месте карты, где необходимо установить маркер, 
            затем настройте высоту взлета и отклонение БПЛА в блоке настройки элемента
            в правой части интерфейса.
            </p>
            <p className="button_important--advice">
              Нельзя добавить несколько точек старта.
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
export default connect(mapStateToProps, mapDispatchToProps)(TakeoffButton)

