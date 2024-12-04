import React from 'react';
import './Style.css';
import PolygonME from "./MapElement"
import PolygonRE from "./RouteElement"

import Icon from "./icon_button_polygon.png"
import adviceGif from "./advice_polygon.gif"
import { connect } from 'react-redux';
import { update_modal_message, change_active_RC_button } from '../../../AppSlice';

let module_name = "Polygon"

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
    if(e.button.state.node !== null){
      let cur_num_of_markers = e.button.state.node.map_element.addConturePoint(e)
      
      if (cur_num_of_markers > 3){
        e.route.tbManager.clearTb()
        let currentNode = e.route.head 
        while (currentNode != e.route.tail){
          currentNode = currentNode.next
          if (currentNode.isMapElement){
            if (currentNode.params.module.name == "Polygon"){
              for (let coord of currentNode.params.conture.value){
                e.route.tbManager.addSphere(
                  [coord[0], coord[1], Number(currentNode.params.alt.value)],
                  currentNode.id
                )
              }
            }else{
              e.route.tbManager.addSphere(
                [currentNode.params.lng.value, currentNode.params.lat.value, Number(currentNode.params.alt.value)],
                currentNode.id
              )
            }
          }
        }

        e.route.tbManager.unitSpheres(e.route)
      }
      if(cur_num_of_markers == 3){
        e.route.changeIsMapElement(e.button.state.node)
      }
    }
    else{
      let node = e.route._append(
        module_name,
        PolygonME,
        PolygonRE,
        {button:e.button},
        false,
        e
      )
      node.map_element.addConturePoint(e)
      e.button.setState(state => ({
        map_element:node.map_element,
        node:node
      }))
    }
  }
}

class PolygonButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      map_element:null,
      node:null
    }
    this.onClickHandler = this.onClickHandler.bind(this);
    this.removeMapEventListener = this.removeMapEventListener.bind(this);
    this.addEvent = (e) => {e.button = this; e.map = this.props.map; e.route = this.props.route; add(e)}
  }
  setUsed(isUsed){
    this.setState(state => ({
      used:isUsed,
    }))
  }
  removeMapEventListener(){
    this.props.map.unsetEventListener(this.props.map)
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
        this.setState(state => ({
          map_element:null,
          node:null
        }))
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
        <div className={(this.props.id === this.props.app.active_RC_button ? "button--instrument polygon " + this.state.used + " active": "button--instrument polygon " + this.state.used) + " button--hid"}>
          <a onClick={this.onClickHandler} id="button-add-waypoint" href="" >
            <img src={Icon} className="button__icon--instrument" alt=""/>
          </a>
        </div>
        <div className="hidden--constr" style={this.props.app.settings[2].value==1?{display:"none"}:{}}>
            <p className='button__name--heading'>Облет полигона</p>
            <div className='button__container--advice'>
              <p>
              Эта кнопка предназначена для установки на пользователбскую карту группы маркеров, 
              объединенных в группу, данная группа преобразуется в полигон, заполненный маршрутом полета. 
              </p>
              <img src={adviceGif} className="button__advice_gif" alt=""/>
              <p>
              Для добавления данного элемента нажмите соответствующую кнопку, 
              затем при помощи ЛКМ начните расставлять точки полигона на карте, 
              после добавления третьей точки, образуется сам полигон, 
              затем настройте высоту взлета, расстояние между траекториями, 
              угол построения траекторий и т.д. в блоке настройки элемента 
              в правой части интерфейса.
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
export default connect(mapStateToProps, mapDispatchToProps)(PolygonButton)

