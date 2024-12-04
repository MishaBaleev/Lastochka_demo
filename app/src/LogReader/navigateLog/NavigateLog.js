import React from "react";
import "./navigateLog.css"
import playPng from "./img/play.png";
import pausePng from "./img/pause.png";

class NavigateLog extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            isPause: true,
            speedValue: 5,
            active: "activeNav"
        }
        this.playPauseOnClick = this.playPauseOnClick.bind(this)
        this.speedOnChange = this.speedOnChange.bind(this)
        this.activateSection = this.activateSection.bind(this)
    }

    componentDidMount(){
        
    }
    playPauseOnClick(){
        this.setState(state => ({
            isPause: !(this.state.isPause)
        }))
        this.props.playPause(this.state.isPause)
    }
    speedOnChange(e){
        this.setState(state => ({
            speedValue: e.target.value
        }))
        this.props.intervalOnChange(e.target.value)
    }
    activateSection(e){
        e.preventDefault()
        if (this.state.active == "activeNav"){
            this.setState(state => ({
                active: "unactiveNav"
            }))
        }else{
            this.setState(state => ({
                active: "activeNav"
            }))
        }
    }

    render(){
        let dateTime = this.props.data.datetime;
        let time = this.props.data.datetime.slice(dateTime.indexOf(" ")+1, dateTime.indexOf(" ")+9);
        return(
            <div className={"navigateLog--main "+this.state.active}>
                <button className={"activateButton "+this.state.active} onClick={this.activateSection}></button>
                <div className="logInfo">
                    <h3>{time}</h3>
                    <button className="button--delete" onClick={this.props.deleteTail}>Очистить траекторию</button>
                </div>
                <input
                    type="range"
                    value={this.props.current_counter}
                    step={1}
                    min={0} 
                    max={this.props.maxLength-1}
                    onChange={(e) => {this.props.setCurrentLog(e.target.value)}}
                />
                <div className="controls">
                    <div className="buttons">
                        <h3>Пакет № {this.props.current_counter+1}</h3>
                        <button className="navigate prev" onClick={(e) => {this.props.setCurrentLog(this.props.current_counter-1)}}></button>
                        <button className="button--manage--log" onClick={this.playPauseOnClick}>
                            <img className="manage--img" src={this.state.isPause == true?playPng:pausePng}/>
                        </button>
                        <button className="navigate next" onClick={(e) => {this.props.setCurrentLog(this.props.current_counter+1)}}></button>
                    </div>
                    <div className="speed">
                        <h3>Скорость воспроизведения</h3>
                        <div className="input--block">
                            <input className="range"
                                type="range"
                                value={this.state.speedValue}
                                step={0.1}
                                min="1" 
                                max="10" 
                                onChange={this.speedOnChange}
                            />
                            <input className="number"
                                type="number"
                                value={this.state.speedValue}
                                step={0.1}
                                min="1" 
                                max="10" 
                                onChange={this.speedOnChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default NavigateLog
