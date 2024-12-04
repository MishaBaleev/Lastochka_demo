import React from "react";
import { update_modal_message } from "../../AppSlice";
import { connect } from 'react-redux';
import { DecimationOptions } from "chart.js";
import MultipleObserver from "../../MultipleObserver";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Decimation
  } from 'chart.js';
import { Line } from 'react-chartjs-2';
    ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Decimation
);



class ChartBlock extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
        this.colors = [];
        this.getColor = this.getColor.bind(this);
    }
    checkColor(color, key){
        let is_color_used = false
        let is_key_used = false
        for(let item of this.colors){
            if(item.color == color) is_color_used = true
            if(item.key == key) is_key_used = true
        }
        return {
            is_color_used:is_color_used,
            is_key_used:is_key_used
        }
    }
    getNewColor(key){
        let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
        let is_used = this.colors.findIndex(item => (item.color == color))

    }
    getColor(key){
        let color_index = this.colors.findIndex(item => (item.key == key))
        if(color_index != -1) return this.colors[color_index].color
        else{
            let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
            let is_used = this.colors.findIndex(item => (item.color == color)) != -1
            while(is_used){
                let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
                is_used = this.colors.findIndex(item => item.color == color) != -1
            }
            return color
        }

    //   let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
    //   let is_used = this.colors.findIndex(item => (item.color == color)) != -1
    //   while(is_used){
    //     let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
    //     is_used = this.colors.findIndex(item => item.color == color) != -1
    //   }
    //   return color
    }
    render(){
        // let dataset = []

        // for(let i = 0; i < this.props.params.length; i++){
        //     let item = this.props.params[i]
        //     let color = this.getColor()


        // }



        let datasets = this.props.params.map((item, index) => {
            let is_used = this.colors.findIndex(item1 => item1.key == item['key']) != -1
            if(!is_used){
                let color = this.getColor()
                this.colors.push({
                    color:color, 
                    key:item['key']
                })
            }
            let index2 = this.colors.findIndex(item1 => item1.key == item['key'])
            let color = this.colors[index2].color
            if (this.props.log_type=='ulg'){
                if (this.props.is_custom == true){
                    let data_slice = item.data.slice(0, this.props.current_counter)
                    return {
                        data: data_slice,
                        label: item['label'],
                        borderColor: color,
                        fill: true,
                        lineTension: 0.5
                    }
                }else{
                    return {
                        data: this.props.charts_slice.map((item1, index1) => {
                            return parseFloat(item1[item['key']])
                        }),
                        label: item['label'],
                        borderColor: color,
                        fill: true,
                        lineTension: 0.5
                    }
                }
            }else{
                return {
                    data: this.props.charts_slice.map((item1, index1) => {
                        return parseFloat(item1[item['key']])
                    }),
                    label: item['label'],
                    borderColor: color,
                    fill: true,
                    lineTension: 0.5
                }
            }
        })
        let labels 
        if (this.props.log_type == 'ulg' && this.props.is_custom==true){
            labels = this.props.params[0].data.map((item, index) => {return index}).slice(0, this.props.current_counter)
        }else{
            labels = this.props.labels
        }
        return(
            <MultipleObserver>
                <Line
                    type="line"
                    width={220}
                    height={120}
                    options={{
                        title: {
                            display: true,
                            text: "",
                            fontSize: 20
                        },
                        legend: {
                            display: true, //Is the legend shown?
                            position: "top" //Position of the legend.
                        },
                        plugins: {
                        decimation: {
                            enabled: true,
                            algorithm: "min-max"
                        }
                        }
                    }}
                    // a.split(" ")[1].slice(0,11)
                    data={{
                        labels: labels,
                        datasets: datasets
                    }}
                    />
            </MultipleObserver>
        )
    }
}
const mapStateToProps = (state) => {
    return state;
}
const mapDispatchToProps =  (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(ChartBlock)