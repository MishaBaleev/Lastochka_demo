import React from 'react';
import "./Modal.css"
import CancelIcon from "./cancel.png"
import { connect } from 'react-redux';
import { toggle_page_block } from '../AppSlice';

class Modal extends React.Component  {
  constructor(props){
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  onClickHandler(e){
    e.preventDefault()
    this.props.toggle_page_block({
      'is_page_blocked':false,
      'name':"",
      'description':""
    })
  }
  render(){
    return (
      <section className={this.props.app.is_page_blocked === true ? "modal__window active" : "modal__window"}>
        <div className="modal__container">
          <h3 className='modal__heading'>{this.props.app.modal.name}</h3>
          <p className='modal__text'>{this.props.app.modal.description}</p>
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
    'toggle_page_block': (data) => dispatch(toggle_page_block(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)

