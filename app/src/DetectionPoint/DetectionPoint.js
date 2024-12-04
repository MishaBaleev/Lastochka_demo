import React from 'react';
import './DetectionPoint.css';
import CancelIcon from "./cancel.png"
import Loading from '../Loading/Loading';

class DetectionPoint extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      wide:false
    }
    this.setWide = this.setWide.bind(this);
    this.close = this.close.bind(this);
  }
  setWide(e){
    e.preventDefault()
    this.setState(state => ({
      wide: state.wide ? false : true,
    }))
  }
  close(e){
  }
  componentDidMount(){
    // [1, readable_time, result]
  }
  render() {
    return (
        <div className='container--detection_point'>
          <h5 className='heading--detection_point'>{"Объект"+(this.props.data.metadata.length > 1 ? "ы" : "")+" интереса"}</h5>
          <div className='container__icon--detection_point'>
              {this.props.data.image ? 
                  <img className='img--detection_point' src={this.props.data.image} /> 
                  : <Loading message={"Получение изображения"}/>}
          </div>
          <ul className='list--detection_point'>
              <li key={-1} className={'item--detection_point first'}>
                <ul className='list__metadata--detection_point row'>
                  <li className='item__metadata--detection_point col-md-4'>Класс</li>
                  <li className='item__metadata--detection_point col-md-4'>Тип</li>
                  <li className='item__metadata--detection_point col-md-4'>Вероятность</li>
                </ul>
              </li>
              {this.props.data.metadata.map((item, index) => {
                  return <li key={index} className={'item--detection_point ' + (item.type == 0 ? "stayed" : "new")}>
                    <ul className='list__metadata--detection_point row'>
                      <li className='item__metadata--detection_point col-md-4'>{item.class}</li>
                      <li className='item__metadata--detection_point col-md-4'>{(item.type == 0 ? "Старый" : " Новый")}</li>
                      <li className='item__metadata--detection_point col-md-4'>{Math.floor(item.cfs*100)}%</li>
                    </ul>
                    {/* <p>{item.class + " " + item.cfs + (item.type == 0 ? "" : " (Новый)")}</p> */}
                  </li>
              })}
          </ul>
          <span onClick={this.close} className="button button__modal--close">
              <img src={CancelIcon} className="icons" alt=""/>
          </span>
        </div>
    );
  }
}


export default DetectionPoint


