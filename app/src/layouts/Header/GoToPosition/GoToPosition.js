import React from "react";
import "./goToPosition.css"
import SearchIcon from "./img/search.png"
import { connect } from 'react-redux';
import axios from 'axios';
import { update_modal_message } from "../../../AppSlice";
import mapboxgl from "mapbox-gl";
import markerIcon from "./img/marker.png"

class GoToPosition extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            targetValue: ""
        }
        this.errors = [
            "Пустая поисковая строка",
            "Некорректное название населенного пункта",
            "Отсутствие интернет-соединения"
        ]
        this.targetValueOnChange = this.targetValueOnChange.bind(this)
        this.gotoPos = this.gotoPos.bind(this)
        this.addTemporaryMarker = this.addTemporaryMarker.bind(this)
    }

    targetValueOnChange(e){
        this.setState(state => ({
            targetValue: e.target.value
        }))
    }

    addTemporaryMarker(coords){
        this.props.params.map.flyTo({
            center: coords
        })
        let marker = new mapboxgl.Marker({draggable: false})
        marker.setLngLat({lng: coords[0], lat: coords[1]}).addTo(this.props.params.map)
        let icon = document.createElement("img")
        icon.src = markerIcon
        icon.width = 35 
        icon.height = 35 
        marker.getElement().querySelector("svg").remove() 
        marker.getElement().append(icon)

        setTimeout(() => {
            marker.remove()
        }, 5000)
    }
    gotoPos(){
        let data = new FormData()
        data.append("target", this.state.targetValue)
        axios.post("/api/gotoPos/", data).then(response => {
            if (response.data.result == true){
                this.addTemporaryMarker(response.data.coords)
            }else{
                this.props.update_modal_message({
                    active: true,
                    heading: "Ошибка названия",
                    message: this.errors[response.data.errorCode]
                })
            }
        })
    }

    render(){
        return(
            <div className="gotoPos">
                <input
                    type="text"
                    value={this.state.targetValue}
                    placeholder="Населенный пункт"
                    onChange={this.targetValueOnChange}
                />
                <button><img src={SearchIcon} onClick={this.gotoPos}/></button>
            </div>
        )
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(GoToPosition)