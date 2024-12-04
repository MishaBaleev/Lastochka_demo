import React from 'react';
import "./ModalInput.css"
import CancelIcon from "./cancel.png"
import { connect } from 'react-redux';
import { update_modal_message } from '../AppSlice';

class ModalInput extends React.Component  {
  constructor(props){
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  onClickHandler(e){
    e.preventDefault()
    this.props.update_modal_message({
      'active':"",
      'heading':"",
      'message':""
    })
  }
  render(){
    return (
      <section className={this.props.app.modal_message.active === true ? "modal__window active" : "modal__window"}>
        <div className="modal__container">
          <h3 className='modal__heading'>{this.props.app.modal_message.heading}</h3>
          <p className='modal__text'>{this.props.app.modal_message.message}</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalInput)

