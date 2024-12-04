import "./Spraying.scss";
import Settings from "./Settings/Settings";
import { CommonManager } from "./CommonManager";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { update_modal_message } from "../AppSlice"

const Spraying = (props) => {
    const [manager_obj, _] = useState(new CommonManager(props.map, props.manager3D, props.update_modal_message))
    const [cursor_coords, setCursorCoords] = useState([0, 0])

    const mapClick = (e) => {
        if (manager_obj.translate_cursor === true){
            manager_obj.setStartMarker([e.lngLat.lng, e.lngLat.lat])
        }else{
            manager_obj.setPolygon([e.lngLat.lng, e.lngLat.lat])
        }
    }
    const mouseMove = (e) => {
        if (manager_obj.translate_cursor === true){
            setCursorCoords([e.lngLat.lng, e.lngLat.lat]) 
        }
    }
    useEffect(() => {
        if (props.manager3D !== null){
            props.map.on("mousemove", mouseMove)
            props.map.on("click", mapClick)
        }
    }, [props.manager3D])

    useEffect(() => {
        return () => {
            manager_obj.clearAll()
            props.map.off("mousemove", mouseMove)
            props.map.off("click", mapClick)
        }
    }, [])

    return <div className="spraying">
        <Settings manager={manager_obj} cursor_coords={cursor_coords}/>
    </div>
}
const mapStateToProps = (state) => {return state}
const mapDispatchToProps = (dispatch) => { return{
    "update_modal_message": (data) => {dispatch(update_modal_message(data))}
}}
export default connect(mapStateToProps, mapDispatchToProps)(Spraying)