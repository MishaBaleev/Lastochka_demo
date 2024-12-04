import React from 'react';
import "./RoutePanel.css"
import { connect } from 'react-redux';
import axios from 'axios';
import { toggle_page_block, update_modal_message, change_RC_mission_name } from '../../AppSlice';
import { string } from 'prop-types';

class RoutePanel extends React.Component  {
  constructor(props){
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.importOnClickHandler = this.importOnClickHandler.bind(this);
    this.makePrtScreen = this.makePrtScreen.bind(this);
    // this.makePrtScreenSourceLoaded = this.makePrtScreenSourceLoaded.bind(this);
  }

  createNewHash(missionName){
    
  }

  remadeDate(str){//год_месяц_день_час_минуты_секунды
    let year = str.substring(8, 10)+"_"
    let day = str.substring(0, 2)+"_"
    let month = str.substring(3, 5)+"_"
    let time = str.split(", ")[1].split(":").join("_")
    return year+month+day+time
  }

  makePrtScreen(){
    
  }

  onClickHandler(e) {
    e.preventDefault()
    this.props.update_modal_message({active: true, heading: "Предупреждение", message: "Эта функция доступна в полной версии приложения"})
  }
  importOnClickHandler(e){
    this.props.update_modal_message({active: true, heading: "Предупреждение", message: "Эта функция доступна в полной версии приложения"})
  }
  onNameChangeHandler(e) {
    e.preventDefault()
    let name = e.target.value
    let spec_symbols = [' ', '/', '\\', ':', '?', '"', '<', '>', '|']
    spec_symbols.map(item => {
      name = name.replaceAll(item, '')
    })
    this.props.change_RC_mission_name(name);
  }
  render(){
    // console.log(this.state.import_task_name)
    return (
      <div className="column--right flysequence__panel">
          <div className='flysequence--heading__container'>
          <h4 className=''>
            Миссия
          </h4>
            <input 
            // className="input--fly_sequence--complex1" 
                  maxLength={30}
                  onChange={(e) => {this.onNameChangeHandler(e)}}
                  type="text" 
                  placeholder='без имени'
                  value={this.props.app.RC_mission_name}/>
          </div>
          <form method="post" action="" className="mission_form" data-task-id="0">
              <input type="hidden" name={"csrf"} id={"csrf"} defaultValue={this.props.csrf_token}/>
              <ul className="list__task--seguence">
                {this.props.sequence.map((item, index) =>{
                  let Cmp = item.cmp
                  return <li key={index}>{<Cmp params={item.params} tbManager={this.props.tbManager} route={this.props.route}/>}</li>
                })}
              </ul>
              {/* <button onClick={this.importOnClickHandler} type="submit" className="button button--import-mission" id="button--import-mission">Импорт ПЗ QGC</button> */}
              <button onClick={this.onClickHandler} className="button button--save-mission" id="button--save-mission">Сохранить</button>
          </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'toggle_page_block': (data) => dispatch(toggle_page_block(data)),
    'update_modal_message': (data) => dispatch(update_modal_message(data)),
    'change_RC_mission_name': (data) => dispatch(change_RC_mission_name(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RoutePanel)

