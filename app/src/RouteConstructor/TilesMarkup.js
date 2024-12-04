import React from 'react';

function fromLngLatToMercator(cords, flag){
  if(flag == true){
      let source = new temp1.Proj('EPSG:4326')
      let dist = new temp1.Proj('EPSG:3785')
      let point = new temp1.Point(cords);
      return temp1.transform(source, dist, point)
  }
  else{
      let dist = new temp1.Proj('EPSG:4326')
      let source = new temp1.Proj('EPSG:3785')
      let point = new temp1.Point(cords);
      return temp1.transform(source, dist, point)
  }
}
function XYZtoLng(x,z){
  return x/Math.pow(2,z)*360-180
}
function XYZtoLat(y,z){
  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))
}
function getCorners(x, y, z){
  let NW = [XYZtoLng(x,z), XYZtoLat(y,z)]
  let NE = [XYZtoLng(x+1,z), XYZtoLat(y,z)]
  
  let SW = [XYZtoLng(x,z), XYZtoLat(y+1,z)]
  let SE = [XYZtoLng(x+1,z), XYZtoLat(y+1,z)]

  return {
      NW:NW,
      NE:NE,
      SW:SW,
      SE:SE,
  }
}
function getTileInfo(x, y, z, img_size) {
  let corners = getCorners(x, y, z)
  return {
    corners:{
      NW:fromLngLatToMercator(corners.NW, true),
      NE:fromLngLatToMercator(corners.NE, true),
      SW:fromLngLatToMercator(corners.SW, true),
      SE:fromLngLatToMercator(corners.SE, true),
    },
    size:img_size
  }
}