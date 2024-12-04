import React from 'react';
import './AltitudeGraph.css';
import * as V from 'victory';
import { connect } from 'react-redux';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryZoomContainer } from 'victory';


import DataViz, {
  VizType,
  LineChartDatum,
  LabelPosition,
  LabelAnchor,
} from 'react-fast-charts';

class AltitudeGraph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      active:"active",
    }
    // this.startMission = this.startMission.bind(this);
    // this.getChooseMissionButton = this.getChooseMissionButton.bind(this);
    // setInterval(() => {
    //   let new_data = this.state.data.filter((item, i) =>{if(i != 0) return item})

    //   new_data.push({x:new Date(Date.now()).toLocaleString("ru-RU", {hour: "numeric",minute: "numeric",second: "numeric"}), y:Math.floor(Math.random() * 100)})
    //   this.setState(state => ({
    //     data: new_data
    //   }))
    // }, 1000);
  }
  setMinMax(){

  }
  render() {
  //   <p>Время "{this.props.mission.time}"</p>
  // <img width="20px" height="auto" src={timeIcon} alt=""/>
  //   <p>Расстояние "{this.props.mission.distance}"</p>
  //   <img width="20px" height="auto" src={routeIcon} alt=""/>
  // console.log(this.props.app.alt_route)
    return (
      <div className="container--altitude_graph">

        {/* <DataViz
          id={'example-line-chart'}
          vizType={VizType.LineChart}
          data={[
            {
              coords:this.props.app.alt_route,
              animationDuration: 0,
              label: 'Green',
              color: '#daa520',
              labelColor: 'purple',
              width: 3,
              labelPosition: LabelPosition.Top,
              labelAnchor: LabelAnchor.Middle
            },
            
          ]}
          axisLabels={{left: 'Value', bottom: 'Year'}}
          axisMinMax={{
            minY: -10,
            minX: 0,
          }}
          formatAxis={{
            x: n => n.toString()
          }}
        /> */}

        
        <VictoryChart height={40} padding={{ top: 5, bottom: 5, left: 20, right: 5 }}
              // scale={{x: "linear"}}
              containerComponent={
                <VictoryZoomContainer
                zoomDimension="x"/>
              }
        >
          <VictoryLine
            style={{
              data: {
                stroke: "rgb(0 255 27)",
                strokeWidth: 1
              }
            }}
            data={this.props.altAMSArr}
          />
          <VictoryLine
            style={{
              data: {
                stroke: "#daa520",
                strokeWidth: 1
              }
            }}
            data={this.props.all_altitude}
          />

          <VictoryAxis
            tickCount={5}
            minDomain={{ x: 0 }}
            maxDomain={{ x: 100 }}
            tickFormat={(t) => `${Math.round(t)}м`}
            label={"Высота "+"\n над уровнем моря"}
            dependentAxis 
            crossAxis
            style={{ 
              tickLabels:{fontSize: 4,fontWeight:700, padding: 0, fill: "#ffffff"}, //change
              grid: {stroke: "#ffffff40"},
              axisLabel: {fontSize: 4, padding: 10, fill: "#ffffff"}, //change
            }}
          />
          <VictoryAxis
            tickCount={5}
            tickFormat={(t) => `${Math.round(t)}м`}
            crossAxis
            style={{ 
              tickLabels:{fontSize: 4,fontWeight:700, padding: 0, fill: "#ffffff"},//change
              grid: {stroke: "#ffffff40"},
            }}
          />

        </VictoryChart>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(AltitudeGraph)
