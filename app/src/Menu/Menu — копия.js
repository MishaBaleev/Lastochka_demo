import React from 'react';
import './Menu.css';

class Menu extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      buttons:[
        {
          name:"Создание полетных заданий"
        },
        {
          name:"Мониторинг"
        },
        {
          name:"Управление полетными заданиями"
        },
      ],
      active_index:0,
      active:false
    }
    this.handlerButtonClick = this.handlerButtonClick.bind(this);
    this.setActiveIndex = this.setActiveIndex.bind(this);
  }
  setActiveIndex(active_index){
    if(active_index != this.state.active_index){
      this.setState(state => ({
        active: false
      }));
    }
    this.setState(state => ({
      active_index: active_index
    }));
  }
  handlerButtonClick(e){
    e.preventDefault()
    if(this.state.active){
      this.setState(state => ({
        active: false
      }));
    }
    else{
      this.setState(state => ({
        active: true
      }));
    }
  }
  chooseActiveClassname(classlist){
    if(this.state.active){
      return classlist + "--active"
    }
    else{
      return ""
    }
  }
  render(){
    let buttons = [], c = 0
    for(let button of this.state.buttons){
      if(c == this.state.active_index){
        buttons.push(
          <li>
            <MenuButton
              name={button.name}
              active={"active"}
              index={c}
              click={this.props.setActiveComponent}
              setActiveIndex={this.setActiveIndex}
            />
          </li>
        )
      }
      else{
        buttons.push(
          <li>
            <MenuButton
              name={button.name}
              active={""}
              index={c}
              click={this.props.setActiveComponent}
              setActiveIndex={this.setActiveIndex}
            />
          </li>
        )
      }
      c++
    }
    return (
      <div className="menu__container">
        <div className="button--menu">
          <a onClick={this.handlerButtonClick} className={"menu__button " + this.chooseActiveClassname("menu__button")} href="">
              <span className="line line--first"></span>
              <span className="line line--second"></span>
              <span className="line line--third"></span>
          </a>
        </div>
        <div className={"menu " + this.chooseActiveClassname("menu")}>
          <nav className="header__nav">
              <ul className="header__nav__list">
                {buttons}
              </ul>
          </nav>
        </div>
      </div>
    );
  }
}
class MenuButton extends React.Component  {
  constructor(props){
    super(props);
    this.handlerButtonClick = this.handlerButtonClick.bind(this);
  }
  handlerButtonClick(e){
    this.props.click(this.props.index)
    this.props.setActiveIndex(this.props.index)
  }
  render(){
    return (
      <a className={"menu__item--"+this.props.active} onClick={this.handlerButtonClick}>
          {this.props.name}
      </a>
    );
  }
}
export default Menu;

