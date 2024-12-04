import React from 'react';
import './LogReader.css';
import axios from 'axios';
import { connect } from 'react-redux';
import logFile from "./imgs/log_file.png"
import { logReaderManager3d } from './logReaderManager3d';
import LogPanel from './logPanel/LogPanel';
import MarkupPanel from './MarkupPanel/MarkupPanel';
import NavigateLog from './navigateLog/NavigateLog';
import log_json from "./log_example.json";

import { set_loadedLR, update_modal_message, change_page } from '../AppSlice';

class LogReader extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      is_log_set:false,
      status_message:"",
      code: -1,
      precalculation_accept:true,
      data:{},
      currentLog: null,
      current_start_counter:null,
      current_counter:null,
      route_elements_markup: [],
      log_name:"",
      mission_file_name:"",
      log_type: "lastochka"
    }
    this.currentID = 0;
    this.isAnimateIntervalPlay = false;
    this.interval = 5;
    this.dataLength = 100;
    this.cordArr = [];
    this.frame_keys = [];
    this.logReaderManager3d = new logReaderManager3d(
      this.props.manager3D
    )
    this.props.manager3D.addManager(this.logReaderManager3d, "logreader")
    this.setFile = this.setFile.bind(this);
    this.nextLog = this.nextLog.bind(this);
    this.prevLog = this.prevLog.bind(this);
    this.showLog = this.showLog.bind(this);
    this.intervalOnChange = this.intervalOnChange.bind(this);
    this.playPauseAnimateInterval = this.playPauseAnimateInterval.bind(this);
    this.setCurrentLog = this.setCurrentLog.bind(this);
    this.keywordPressed = this.keywordPressed.bind(this);
    this.deleteTail = this.deleteTail.bind(this)
    this.componentRefresh = this.componentRefresh.bind(this)
    this.saveULGData = this.saveULGData.bind(this)
    this.loadLog = this.loadLog.bind(this)
  }
  initLogManager(data){
    let logs = data.log;
    this.props.map.once('moveend',()=>{
      this.logReaderManager3d.addModel([
        parseFloat(logs[0].position_lon_deg), 
        parseFloat(logs[0].position_lat_deg),
        parseFloat(logs[0].position_real_alt),
      ], data.route_elements)
      this.dataLength = logs.length;
      for (let log of logs){
        this.cordArr.push([
          parseFloat(log.position_lon_deg), 
          parseFloat(log.position_lat_deg),
          parseFloat(log.position_real_alt)
      ])
      }
    })
    setTimeout(this.showLog, 1000/this.interval);
    this.props.map.flyTo({center: [logs[0].position_lon_deg, logs[0].position_lat_deg]});
  }

  showLog(){
    if (this.isAnimateIntervalPlay){
      this.nextLog()
    }
    setTimeout(this.showLog, 1000/this.interval)
  }
  intervalOnChange(value){
    this.interval = value
  }
  playPauseAnimateInterval(choice){
    this.isAnimateIntervalPlay = choice
  }
  nextLog(){
    this.currentID++;
    let logs = this.state.data.log
    this.currentID = (this.currentID > logs.length-1)?logs.length-1:this.currentID
    this.setCurrentLog(this.currentID)
  }
  prevLog(){
    this.currentID--;
    this.currentID = (this.currentID < 0)?0:this.currentID
    this.setCurrentLog(this.currentID)
  }

  setCurrentLog(counter=null){
    this.currentID = parseInt(counter)
    counter = parseInt(counter)
    if(counter >=0 && counter < this.state.data.log.length){
      let shareCordsArr = this.cordArr.slice(0, counter+1)
    
      let logs = this.state.data.log;
      this.logReaderManager3d.setModelState({
        coords: [logs[counter].position_lon_deg, logs[counter].position_lat_deg, Number(logs[counter].position_real_alt)],
        angles: {
          x: logs[counter].pitch_deg,
          y: logs[counter].roll_deg,
          z: 360-logs[counter].heading_deg
        },
        tailArr: shareCordsArr
      }, true)
      this.setState(state => ({
        currentLog: this.state.data.log[counter],
        current_counter: counter
      }))
    }
  }

  keywordPressed(e){
    if (e.key == "," || e.key == "б"){
      this.prevLog()
    }
    if (e.key == "." || e.key == "ю"){
      this.nextLog()
    }
  }

  setFile(e){
    // e.preventDefault()
    // let data = new FormData();
    // data.append("log_file", e.target.files[0]);
    // axios.post('/api/log_read/', data)
    //     .then(response => {
    //       console.log(response)
          
    //   });
  }

  deleteTail(e){
    e.preventDefault()
    this.logReaderManager3d.deleteTail()
    // console.log(this.state.current_start_counter, this.state.current_counter+1)
    this.setState(state => ({
      current_start_counter:this.state.current_counter,
    }))
  }

  loadLog(){
    let response = log_json
    console.log(response)
    this.props.set_loadedLR(true)
    let route_elements_markup = []
    for(let element of response.route_elements){
      let z = {...element}
      z.data = JSON.parse(z.data)
      route_elements_markup.push(z)
    }
    if(response.state_calc_message != ""){
      this.props.update_modal_message({
        active: true,
        heading:"Предрасчет состояния",
        message: response.state_calc_message
      })
      setTimeout(() => {
          this.props.update_modal_message({
              active: false,
              heading: "",
              message: "",
          })
      }, 2000);
    }

    this.frame_keys = response.type=="ulg"?response.headers_topic:Object.keys(response.log[0])
    this.setState(state => ({
      precalculation_accept: response.state_calc_message == "" ? true : false,
      is_log_set: true,
      data: response,
      currentLog: response.log[0],
      current_start_counter:0,
      current_counter:0,
      route_elements_markup:route_elements_markup,
      log_name: "Тестовая запись",
      log_type: response.type
    }))
    this.initLogManager(response)
  }

  componentDidMount(){
    document.addEventListener("keydown", this.keywordPressed)
    this.props.map.resize()
    this.loadLog()
  }

  componentWillUnmount(){
    this.props.set_loadedLR(false)
    document.removeEventListener("keydown", this.keywordPressed)

    this.logReaderManager3d.clearTb()
  }
  componentRefresh(){
    this.props.set_loadedLR(false)
    document.removeEventListener("keydown", this.keywordPressed)
    this.logReaderManager3d.clearTb()

    this.setState(state => ({
      is_log_set:false,
      status_message:"",
      precalculation_accept:true,

      data:{},
      currentLog: null,
      current_counter:null,
      current_start_counter:null,
      route_elements_markup: [],
      log_name:"",
      code:-1,
    }))

    document.getElementById("file-log-input").value = ""
  }

  saveULGData(){
    console.log(this.state)
    console.log(this.props)
    let data = new FormData()
    data.append('keys', JSON.stringify(this.props.app.ulg_keys))
    data.append('log_name', this.state.log_name)
    axios.post('/api/saveULGData/', data).then(response => {
      if (response.data.result==true){
        this.props.update_modal_message({
          active: true,
          heading: "Успех",
          message: "Файл сохранен по пути ./media/ulg_reports/",
        })
      }else{
        this.props.update_modal_message({
          active: true,
          heading: "Ошибка",
          message: "Сохранить файл не удалось",
        })
      }
    })
  }

  render(){
    let chart_slice_new
    
    if(this.state.code == 2){
      navigator.clipboard.writeText(this.state.mission_file_name)
      .then(() => {
        // Получилось!
      })
      .catch(err => {
        console.log('Something went wrong', err);
      });
    }
    // console.log(this.state.current_start_counter, this.state.current_counter+1)
    return (
      <div className={' ' + (this.state.is_log_set == true ? "hide" : "")}>
        <div className={'container__form--log ' + (this.state.is_log_set == true ? "hide" : "")}>
          <div className='logreader__message--logpreload'>
            <p className='logreader__message--logpreload--main'>
              {this.state.status_message} 
            </p>
            {this.state.code == 2 ? <button onClick={(e) => {this.props.change_page(0)}} className='logreader__button--import'>Импортировать?</button>: ""}
            
          </div>
          <div className='container__input--log file'>
            <label htmlFor="file-log-input">
              <div className='container__input--log--icon'>
                <img src={logFile}/>
              </div>
            </label>
            <input onChange={this.setFile} className='log_file--input' id="file-log-input" type='file' accept=".db, .ulg"/>
            <p className='log_file--input--message'>Для просмотра лога полета, пожалуйста, выберите лог</p>
          </div>
        </div>
        {this.state.data.log == null ? "" :
          <NavigateLog
            maxLength={this.dataLength}
            data={this.state.currentLog}
            current_counter={this.state.current_counter}
            nextLog={this.nextLog}
            prevLog={this.prevLog}
            playPause={this.playPauseAnimateInterval}
            intervalOnChange={this.intervalOnChange}
            setCurrentLog={this.setCurrentLog}
            deleteTail={this.deleteTail}
            componentRefresh={this.componentRefresh}
          />
        }
        {this.state.data.log == null ? "" : 
          <LogPanel
            frame_keys={this.frame_keys} 
            setFile={this.setFile}
            precalculation_accept={this.state.precalculation_accept}
            maxLength={this.dataLength}
            data={this.state.currentLog} 
            log_type={this.state.log_type}
            charts_slice={this.state.current_start_counter < this.state.current_counter+1 ? this.state.data.log.slice(this.state.current_start_counter, this.state.current_counter+1) : this.state.data.log.slice(this.state.current_counter, this.state.current_start_counter+1)}
            current_counter={this.state.current_counter}
            log_name={this.state.log_name}
            saveULGData={this.saveULGData}
          />
        }
        {this.state.data.log == null ? "" : 
          <MarkupPanel 
          log={this.state.data} 
          route_elements_markup={this.state.route_elements_markup}
          log_name={this.state.log_name}
          />
        }
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    "update_modal_message": (data) => dispatch(update_modal_message(data)),
    "set_loadedLR": (data) => dispatch(set_loadedLR(data)),
    'change_page': (id) => dispatch(change_page(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogReader)

