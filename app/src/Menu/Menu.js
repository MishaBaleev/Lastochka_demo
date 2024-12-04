import React from 'react';
import './Menu.css';
import MenuButton from './MenuButton/MenuButton';
import { connect } from 'react-redux';
import { toggle_menu } from '../AppSlice';

class Menu extends React.Component  {
  constructor(props){
    super(props);
    this.handlerButtonClick = this.handlerButtonClick.bind(this);
    this.hints = [
      "Тут можно построить маршрут БПЛА путем постановки различного рода точек полетных элементов",
      "Тут можно отслеживать выполнения полетного задания и отправлять команды на БПЛА",
      "Тут можно управлять файлами-записями полетных заданий",
      "Тут можно просмотреть записи свершившихся полетов БПЛА",
      "Тут можно разметить датасеты",
      "Тут можно построить марщрут БПЛА для опрыскивания территории различными препаратами",
      "Тут можно настроить приложение"
    ]
  }
  handlerButtonClick(e){
    e.preventDefault()
    if(this.props.app.is_menu_opened){
      this.props.toggle_menu(false)
    }
    else{
      this.props.toggle_menu(true)
    }
  }
  render(){
    return (
      <div className="menu--main__container">
        <div className="">
          <a onClick={this.handlerButtonClick} className={this.props.app.is_menu_opened === true ? "menu__button active" : "menu__button unactive_menu"} href="">
              <span className="line line--first"></span>
              <span className="line line--second"></span>
              <span className="line line--third"></span>
          </a>
        </div>
        <div className={this.props.app.is_menu_opened === true ? "menu active" : "menu unactive_menu"}>
          <nav className="nav--main">
              <ul className="nav--main__list">
                {
                  this.props.app.page_names.map((item)=>{
                  return <li className="nav--main__item" key={item.id}>
                    <MenuButton
                      id={item.id}
                      name={item.name}
                      hint={this.hints[item.id]}
                    />
                  </li>
                  })
                }
              </ul>
          </nav>
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
    'toggle_menu': (data) => dispatch(toggle_menu(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)

