import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';


export const appSlice = createSlice({
    name: 'app',
    initialState: {
        active_page_id:localStorage.getItem('active_page_id') ? JSON.parse(localStorage.getItem('active_page_id'))['active_page_id'] : 0,
        page_names:[
            {id:0,name:"Создание полетных заданий"},
            {id:1,name:"Мониторинг"},
            {id:2,name:"Управление полетными заданиями"},
            {id:3,name:"Просмотр логов"},
            {id:4, name:"Разметка изображений"},
            {id:5, name:"АгроТех"},
            {id:6,name:"Настройки"}
        ],
        header_content:{
            0:[0,1],
            1:[],
            2:[],
            3:[],
            4:[],
            5:[0],
            6:[]
        },
        is_menu_opened:false,

        is_page_blocked:false,
        modal:{
            'name':"",
            'description':""
        },

        modal_message:{
            active:"",
            heading:"",
            message:"",
            aftermath:""
        },
        active_RC_button:null,

        settings:[
          {id: 1, name: 'Размер интервала для обновления метео данных', type: 'number', tip: 'В зависимости от установленного значения будет изменяться время между обновлениями прогнозов погоды', value: '5'},
          {id: 2, name: 'Сохранение карт', type: 'checkbox', tip: 'В зависимости от установленного значения при загрузке источника они будут сохраняться локально', value: '0'},
          {id: 3, name: 'Интерактивные подсказки', type: 'checkbox', tip: 'В зависимости от установленного значения при испол…дут/не будут отображаться интерактивные подсказки', value: '1'},
          {id: 4, name: 'Использование сохраненных карт', type: 'checkbox', tip: 'В зависимости от установленного значения будет использоваться глобальный или локальный источник карт', value: '0'}
        ],
        group_of_settings:[],
        route_elements:[
          {id: 1, type: 0, name: 'MissionStart', label: 'Стартовые параметры'},
          {id: 2, type: 1, name: 'Takeoff', label: 'Точка взлета'},
          {id: 3, type: 1, name: 'Waypoint', label: 'Путевая точка'},
          {id: 4, type: 2, name: 'Polygon', label: 'Облет полигона'},
          {id: 5, type: 3, name: 'RTL', label: 'Возврат на точку взлета'},
          {id: 6, type: 1, name: 'Land', label: 'Точка приземления'}
        ],
        route_parameters_default:[
            {id: 1, name: 'alt', value: '3', min: 1, max: 100},
            {id: 2, name: 'yaw', value: '', min: -359, max: 359},
            {id: 3, name: 'hold', value: '0', min: 0, max: 1000},
            {id: 4, name: 'speed', value: '1', min: 1, max: 100},
            {id: 5, name: 'line_distance', value: '10', min: 1, max: 200},
            {id: 6, name: 'turnaround_distance', value: '0', min: 0, max: 200},  
            {id: 7, name: 'distance_angle', value: '0', min: 0, max: 359},
            {id: 8, name: 'lng', value: '', min: 0, max: 0},
            {id: 9, name: 'lat', value: '', min: 0, max: 0},
            {id: 10, name: 'conture', value: '', min: 0, max: 0},
            {id: 11, name: 'reverse', value: '0', min: 0, max: 1},
            {id: 12, name: 'angle', value: '0', min: -359, max: 359}, 
            {id: 13, name: 'markup', value: '', min: 0, max: 0}
        ],
        wp_azimuth:0,
        wp_distance:0,
        distance:0,
        time:0,

        monitoring_cur_azimuth:0,
        monitoring_wp_azimuth:0,
        monitoring_wp_distance:0,
        monitoring_distance:0,
        monitoring_time:0,
        
        current_azimuth:0,

        RC_mission_id: null,
        RC_mission_name: "",

        alt_route:[{x:1,y:1}],

        layers:[],

        uavs:[],
        telemetry:{
          1: [],
          2: []
        },
        current_commands:{},
        current_telemetry:{},

        is_mission_completing:false,
        current_log: 0,

        currentIDConstr: 0,

        loadedLR: false,

        telemetryDataPrev1: null,
        telemetryDataPrev2: null,
        ulg_keys: []
    },
    reducers: {
        set_mission_completing:  (state, action) => {
            state.is_mission_completing = action.payload
        },
        set_current_command:  (state, action) => {
            let current_commands = state.current_commands

            let obj = current_commands[action.payload.id]
            obj = {...obj, ...(action.payload.command)}
            current_commands[action.payload.id] = obj
            state = {...state, current_commands:current_commands}
        },
        set_uavs:  (state, action) => {
            state.uavs = action.payload
        },
        update_uav:  (state, action) => {
            let uavs = state.uavs
            let index = uavs.findIndex(i=>{
                if(i.id == action.payload.id) 
                return i
            })
            let obj1 = uavs[index]
            let obj = {...obj1, ...(action.payload)}
            uavs[index] = obj
            state = {...state, uavs:uavs}
        },
        clear_telemetry:(state, action) => {
          let telemetry = state.telemetry
          if(telemetry[action.payload.id].length != 0){
            telemetry[action.payload.id] = [
              telemetry[action.payload.id].at(-1),
            ]
          }
          state = {...state, telemetry:telemetry}
        },
        update_telemetry:  (state, action) => {
            let telemetry = state.telemetry
            if(!(action.payload.id in telemetry)){
                telemetry[action.payload.id] = []
            }
            else if(action.payload.data){
              



              telemetry[action.payload.id].push(action.payload.data)
            }
            state = {...state, telemetry:telemetry}
        },
        set_layer:  (state, action) => {
            let layers = state.layers
            let index = state.layers.findIndex(i=>{if(i.id == action.payload.index) return i})
            let obj1 = state.layers[index]
            let obj = {...obj1, active:action.payload.value}
            layers[index] = obj

            state = {...state, layers:layers}
        },
        set_layers: (state, action) => {
            state.layers = action.payload
        },
        change_active_RC_button: (state, action) => {
            state.active_RC_button = action.payload
        },
        update_modal_message: (state, action) => {
            state.modal_message = {
                ...(state.modal_message),
                active:action.payload.active,
                heading:action.payload.heading,
                message:action.payload.message,
                aftermath:action.payload.aftermath?action.payload.aftermath:"",
                actions:action.payload.actions?action.payload.actions:false,
                dataForUpload:action.payload.dataForUpload?action.payload.dataForUpload:""
            }
        },
        set_info_mission: (state, action) => {
            // if(action.payload.all_altitude.length != 0){
            //     state.alt_route = action.payload.all_altitude
            // }
            // state.AMS_alt_route = action.payload.AMS_alt_route

            state.wp_azimuth = action.payload.current_azimuth
            state.wp_distance = action.payload.current_distance

            state.distance = action.payload.all_distance
            state.time = action.payload.all_time
        },
        get_route_elements: (state, action) => {
            state.route_elements = action.payload
        },
        get_route_parameters_default: (state, action) => {
            state.route_parameters_default = action.payload
        },
        change_page: (state, action) => {
            localStorage.setItem('active_page_id', JSON.stringify(action.payload));
            state.active_page_id = action.payload
            localStorage.setItem('active_page_id', JSON.stringify({
              active_page_id:action.payload
            }));
        },
        get_settings: (state, action) => {
            state.settings = action.payload
        },
        get_group_of_settings: (state, action) => {
            state.group_of_settings = action.payload
        },
        toggle_menu: (state, action) => {
            state.is_menu_opened = action.payload
        },
        toggle_page_block: (state, action) => {
            state.is_page_blocked = action.payload.is_page_blocked
            state.modal = {
                'name':action.payload.name,
                'description':action.payload.description
            }
        },
        update_setting:  (state, action) => {
            let settings = state.settings
            let index = state.settings.findIndex(i=>{if(i.id == action.payload.index) return i})
            let obj1 = state.settings[index]
            let obj = {...obj1, value:action.payload.value}
            settings[index] = obj

            state = {...state, settings:settings}
        },
        change_RC_mission_id: (state, action) => {
            state.RC_mission_id = action.payload
        },
        change_RC_mission_name: (state, action) => {
            state.RC_mission_name = action.payload
        },
        set_monitoring_info: (state, action) => {
            //console.log(action.payload)
            // monitoring_cur_azimuth:0,
            // monitoring_wp_azimuth:0,
            // monitoring_wp_distance:0,
            // monitoring_distance:0,
            // monitoring_time:0,
            state.monitoring_wp_azimuth = action.payload.wp_azimuth
            state.monitoring_wp_distance = action.payload.current_distance

            state.monitoring_distance = action.payload.all_distance
            state.monitoring_time = action.payload.all_time

            state.monitoring_cur_azimuth = action.payload.current_azimuth
        },
        set_currentIDConstr: (state, action) => {
            state.currentIDConstr = action.payload
        },
        set_loadedLR: (state, action) => {
          state.loadedLR = action.payload
        },
        append_ulgKeys: (state, action) => {
          let keys = state.ulg_keys
          keys.push(action.payload)
          state.ulg_keys = keys
        }
    }
  })
  
  // Action creators are generated for each case reducer function
  export const { change_page, get_settings, get_group_of_settings, toggle_menu, update_setting,
    toggle_page_block, get_route_elements, get_route_parameters_default, set_info_mission, update_modal_message,
    change_active_RC_button, change_RC_mission_id, set_AMS_alt_route, set_layers, set_layer, set_uavs, update_uav,
    update_telemetry, set_current_command, set_monitoring_info, set_mission_completing, set_currentIDConstr, set_loadedLR,
    change_RC_mission_name, clear_telemetry, append_ulgKeys } = appSlice.actions
  
  export default appSlice.reducer