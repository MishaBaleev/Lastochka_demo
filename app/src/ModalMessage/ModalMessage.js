import React from 'react';
import "./ModalMessage.css"
import CancelIcon from "./cancel.png"
import { connect } from 'react-redux';
import { update_modal_message } from '../AppSlice';

class ModalMessage extends React.Component{
  constructor(props){
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.okOnCLick = this.okOnCLick.bind(this)
  }
  onClickHandler(e){
    e.preventDefault()
    this.props.update_modal_message({
      'active':"",
      'heading':"",
      'message':"",
      "aftermath":"",
      "actions": false
    })
  }
  okOnCLick(e){
    e.preventDefault()
    let uav_id = this.props.app.modal_message.dataForUpload.uav_id
    let id = this.props.app.modal_message.dataForUpload.id 
    let name = this.props.app.modal_message.dataForUpload.name
    this.props.UAVmanager.setCommand(
      uav_id,//uav id
      {
        Command_code:777,
        Command_name:"UPLOAD_FILE",
        Command_parameters:{
          mission_id:id
          // FILE_NAME:name+".plan"
        },
        time_usec: this.props.app.telemetry[uav_id][this.props.app.telemetry[uav_id].length - 1].time_usec,
      },//data to send
      {
        id:777,
        description:"Загрузка задания "+name,
        result:""
      }//data for interface
    )

    this.props.update_modal_message({
      'active':"",
      'heading':"",
      'message':"",
      "aftermath":"",
      "actions": false
    })
  }
  render(){
    return (
      <section className={this.props.app.modal_message.active === true ? "modal__window active" : "modal__window"}>
        <div className="modal__container">
          <h3 className='modal__heading'>{this.props.app.modal_message.heading}</h3>
          <p className='modal__text'>{this.props.app.modal_message.message}</p>
          {this.props.app.modal_message.aftermath == ""?"":<p className='modal__text'>Возможные причины: {this.props.app.modal_message.aftermath}</p>}
          {this.props.app.modal_message.actions == true?<button className='itsOk_modal' onClick={this.okOnCLick}>Все равно загрузить</button>:""}
        </div>
        <span onClick={this.onClickHandler} className="button button__modal--close">
            <img src={CancelIcon} className="icons" alt=""/>
        </span>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'update_modal_message': (data) => dispatch(update_modal_message(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalMessage)

