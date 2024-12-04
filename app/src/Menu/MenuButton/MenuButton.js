import React from 'react';
import './MenuButton.css';
import Modal from '../../Modal/Modal';
import { connect } from 'react-redux';
import { change_page, toggle_menu } from '../../AppSlice';

class MenuButton extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      clicked:false
    }
    this.handlerClick = this.handlerClick.bind(this);
  }
  handlerClick(e){
    e.preventDefault()
    this.setState(state => ({
      clicked: true
    }));
    if(!this.props.app.is_page_blocked){
      this.setState(state => ({
        clicked: false
      }));
      this.props.change_page(this.props.id)
      this.props.toggle_menu(false)
    }
  }
  render(){
    return (
      <div className='menu--button' data-hint={this.props.hint}>
        {this.props.app.is_page_blocked === true && this.state.clicked === true ? <Modal/> : ""}
        <a className={this.props.id === this.props.app.active_page_id ? "menu__item--active" : ""} onClick={this.handlerClick}>
            {this.props.name}
        </a>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'change_page': (id) => dispatch(change_page(id)),
    'toggle_menu': (data) => dispatch(toggle_menu(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuButton)

