import React from 'react';
import './MissionsManager.css';
import editIcon from "./edit.png"
import deleteIcon from "./delete.png"
// import Modal from '../Modal/Modal';
import axios from 'axios';
import { connect } from 'react-redux';
import { update_setting, toggle_page_block, toggle_menu, change_page, change_RC_mission_id } from '../AppSlice';
import { timeFormat, distanceFormat } from '../functions';


class MissionsManager extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      container_selector:"",
      active_filter:0,
      filters_panel_active:"",
      missions:[],
    }
    this.filters = [
      [0,"По дате по возрастанию"],
      [1,"По алфавиту по возрастанию"],
      [2,"По алфавиту по убыванию"],
      [3,"По дате по убыванию"],
    ]
    this.handlerClick = this.handlerClick.bind(this);
    this.buttonDeleteOnclick = this.buttonDeleteOnclick.bind(this);

    this.buttonEditOnclick = this.buttonEditOnclick.bind(this);
    this.filtersChoose = this.filtersChoose.bind(this);
    this.filterMissions = this.filterMissions.bind(this);
  }
  buttonDeleteOnclick(e, id){
    e.preventDefault()
    axios.delete('/api/mission/'+id+"/")
        .then(response => {
          let missions = this.state.missions
          missions.splice(missions.findIndex((item, index)=>{
              if(item.id===id) return item
          }), 1)
          this.setState(state => ({
            missions: missions
          }));
        })
        .catch(error => {
          console.log(error)
        });
  }
  handlerClick(e){
    e.preventDefault()
    this.props.change_page(this.props.id)
  }
  componentDidMount(){
    fetch("api/mission/")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result)
          this.setState(state => ({
            missions: result
          }));
        },
        (error) => {
          console.log(error)
        }
      )
  }

  buttonEditOnclick(mission_index){
    fetch('api/mission/'+mission_index)
      .then(res => res.json())
      .then(
        (result) => {
          this.props.change_RC_mission_id(result.id);
          this.props.change_page(0);
          this.props.toggle_menu(false)
        }
      )
  };
  filtersChoose(e){
    this.setState(state => ({
      filters_panel_active: state.filters_panel_active ? "" : "active"
    }));
  }
  filterChosen(e, id){
    this.setState(state => ({
      active_filter: id,
      filters_panel_active: ""
    }));
  }
  // [0,"По умолчанию"],
  // [1,"По алфавиту по возрастанию"],
  // [2,"По алфавиту по убыванию"],
  // [3,"По дате по возрастанию"],
  // [4,"По дате по убыванию"],
  filterMissions(){
    let missions = [...this.state.missions]
    if(this.state.active_filter == 0) return missions
    if(this.state.active_filter == 1){
        return missions.sort(function(a, b){
          if(a.name < b.name) { return -1; }
          if(a.name > b.name) { return 1; }
          return 0;
      })
    }
    if(this.state.active_filter == 2){
        return missions.sort(function(a, b){
          if(a.name > b.name) { return -1; }
          if(a.name < b.name) { return 1; }
          return 0;
      })
    }
    if(this.state.active_filter == 3){
      return missions.reverse()
    }
  }
  render(){
    return (
      <div className={'container--inner mission_manager' + this.state.container_selector}>
        <div className='container--mission_manager--filters'>
          <h5 className='heading--filters'>Отфильтровано</h5>
          <div className={'button--filters ' + this.state.filters_panel_active}>
            <h5 onClick={this.filtersChoose}>{this.filters.filter((item, index) => {
                  if(item[0] == this.state.active_filter) return item
              })[0][1]}</h5>
            <ul className={'block--mission_manager--filters ' + this.state.filters_panel_active}>
              {this.filters.map((item, id) => {
                if(id != this.state.active_filter) return <li key={id} onClick={(e) => {this.filterChosen(e, item[0])}}>
                                                            <h5>{item[1]}</h5>
                                                          </li>
              })}
            </ul>
          </div>
        </div>
        <ul className="list--mission_manager">
          {this.filterMissions().map((item, index) =>{
            return <li key={index} className="item--mission_manager">
                    <div className="container__icon--mission_manager">
                      <div className='icon--mission_manager--container'>
                        <img src={item.icon_path} className="icon--mission_manager"/>
                      </div>

                      <div className="container__fade--mission_manager">
                        <ul className="list--buttons--mission_manager">
                          <li className="item--buttons--mission_manager">
                            <button className="item--buttons__button--mission_manager"
                              onClick={this.buttonEditOnclick.bind(this, item.id)}>
                              <img width="22px" height="auto"  src={editIcon} className="icon--delete icons"/> <span>Редактировать</span>
                            </button>
                          </li>
                          <li className="item--buttons--mission_manager">
                            <button onClick={(e) => {this.buttonDeleteOnclick(e, item.id)}} className="item--buttons__button--mission_manager">
                            <img width="22px" height="auto"  src={deleteIcon} className="icon--delete icons"/> <span>Удалить</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                      
                    </div>
                    <div className="container__info--mission_manager">
                      <h4>{item.name}</h4>
                      <p>Рассчетное расстояние: {distanceFormat(item.distance)}</p>
                      <p>Рассчетное время: {timeFormat(item.time)}</p>
                    </div>
                  </li>
          })}
        </ul>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'update_setting': (data) => dispatch(update_setting(data)),
    'toggle_page_block': (data) => dispatch(toggle_page_block(data)),
    'change_page': (id) => dispatch(change_page(id)),
    'toggle_menu': (data) => dispatch(toggle_menu(data)),
    'change_RC_mission_id': (data) => dispatch(change_RC_mission_id(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MissionsManager)

