import React from 'react';
import './InstrumentsPanel.css';
import './buttons.css';
import { connect } from 'react-redux';

import TakeoffButton from '../BRM/Takeoff/Button'
import WaypointButton from '../BRM/Waypoint/Button'
import PolygonButton from '../BRM/Polygon/Button'
import LandButton from '../BRM/Land/Button'
import RTLButton from '../BRM/RTL/Button'

let buttons = {
  'Takeoff':TakeoffButton,
  'Waypoint':WaypointButton,
  'Polygon':PolygonButton,
  'Land':LandButton,
  'RTL':RTLButton
}


// import "../BRM/instrument_button_style.css"
// import "../BRM/default.css"
// import TakeoffButton from "../BRM/Takeoff/Button"
// import WaypointButton from "../BRM/Waypoint/Button"
// import LandButton from "../BRM/Land/Button"
// import PolygonButton from "../BRM/Polygon/Button"
// import RTLButton from "../BRM/RTL/Button"

// import Modal from "../Modal/Modal"

class InstrumentsPanel extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
    }
  }
  componentDidMount(){
  }
  render(){
    return (
      <section className="section--instruments">
          <ul className="list--instruments d-flex">
            {
              this.props.app.route_elements.map((item, index) => {
                if(item.name in buttons){
                  let Button = buttons[item.name]
                  return <li className='item--instruments' key={index}><Button id={item.id} route={this.props.route} tbManager={this.props.tbManager}/></li>
                }
              })
            }
          </ul>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InstrumentsPanel)
