import React from 'react';
import './Style.css';
import LandME from "./MapElement"
import LandRE from "./RouteElement"
import Icon from "./icon_button_land.png"
import adviceGif from "./advice_land.gif"
import { connect } from 'react-redux';
import { update_modal_message, change_active_RC_button } from '../../../AppSlice';

let module_name = "Land"

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
      LandME,
      LandRE,
      {button: e.button},
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

class LandButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      // active:"",
      used:""
    }
    this.onClickHandler = this.onClickHandler.bind(this);
    this.setUsed = this.setUsed.bind(this);
    this.addEvent = (e) => { e.button = this;e.route = this.props.route; add(e)}
  }
  componentDidMount(){
    this.props.route.addValidator(module_name, function(route){
      // let id = BRM_ID
      let t1 = (route.tail.params.module.name == "MissionStart")?false:(route.current_node == route.tail)?true:false//route.current_node == route.tail
      let t2 = route.isUsed("Land").flag == ""
      let t3 = route.isUsed("RTL").flag == ""
      if(!t1){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Точка посадки должна быть последней в миссии"
          }
        ]
      }
      else if(t1 && !t2){
        return [
          false, 
          {
            active:true,
            heading:"Ошибка добавления элемента",
            message:"Точка посадки уже добавлена"
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
        return [true,{x: t1, y: t2, z: t3}]
      }
    })
  }


  setUsed(isUsed){
    this.setState(state => ({
      used:isUsed,
    }))
  }
  onClickHandler(e){
    e.preventDefault()
    let [flag, modal_info] = this.props.route.validate(module_name)
    console.log(modal_info)
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
    // }






    // let isUsed = this.props.route.isUsed(BRM_ID)
    // if(isUsed.flag == "used"){
    //   this.props.openModal(
    //     "Точка посадки уже добавлена",
    //     "В полетном задании уже есть точка посадки"
    //   )
    // }
    // else{
    //   if(this.props.active == "active"){
    //     this.props.unsetActiveButton()
    //     this.props.map.unsetEventListener(this.props.map)
    //   }
    //   else{
    //     this.props.setActiveButton(this.props.id)
    //     this.props.map.setEventListener(this.props.map, this.addEvent)
    //   }
    }
  }
  render(){
    return (
      <div className="button-all">
        <div className={(this.props.id === this.props.app.active_RC_button ? "button--instrument land " + this.props.route.isUsed(module_name).flag + " active": "button--instrument land " + this.props.route.isUsed(module_name).flag) + " button--hid"}>
          <a onClick={this.onClickHandler} id="button-add-land" href="" >
            <img src={Icon} className="button__icon--instrument" alt=""/>
          </a>
        </div>
        <div className="hidden--constr" style={this.props.app.settings[2].value==1?{display:"none"}:{}}>
            <p className='button__name--heading'>Точка посадки</p>
            <div className='button__container--advice'>
              <p>
              Эта кнопка необходима для установки маркера окончания маршрута ПЗ.
              </p>
              <img src={adviceGif} className="button__advice_gif" alt=""/>
              <p>
              Для добавления данного элемента нажмите соответствующую кнопку, 
              затем нажмите ЛКМ на месте карты, где необходимо установить маркер, 
              затем настройте высоту взлета и отклонение БПЛА в
               блоке настройки элемента в правой части интерфейса.
              </p>
              <p className="button_important--advice">
                Нельзя добавить точку посадки, если есть возврат на точку старта.
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
export default connect(mapStateToProps, mapDispatchToProps)(LandButton)

