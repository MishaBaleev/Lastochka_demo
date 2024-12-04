import React from 'react';
import './Loading.css';

class Loading extends React.Component  {
  constructor(props){
    super(props);
    this.state = {}
  }
  render(){
    return (
    <div className = "centered">
      <p className='loading__message'>{this.props.message}</p>
      <div className = "blob-1"></div>
      <div className = "blob-2"></div>
    </div>
    );
  }
}
export default Loading;

