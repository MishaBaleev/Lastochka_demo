import mapboxgl from 'mapbox-gl';
import { lineChunk, lineString, lineIntersect, lineSlice, length } from '@turf/turf'

async function getElevation(cords) {
  // Construct the API request.
  const query = await fetch(
    `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${cords.cords.lng},${cords.cords.lat}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  if (query.status !== 200) return;
  const data = await query.json();
  // Get all the returned features.
  const allFeatures = data.features;
  // For each returned feature, add elevation data to the elevations array.
  const elevations = allFeatures.map((feature) => feature.properties.ele);
  // In the elevations array, find the largest value.
  const highestElevation = Math.max(...elevations);
return {x:cords.x,y:highestElevation}
}

export function getIntersectAlt(l1, l2, l3) {
  if(l1[0] != l2[0]){
      let line1 = lineString([
          [l1[0], l1[2]],
          [l2[0], l2[2]]
      ])
      let line2 = lineString([
          [l3[0], 0],
          [l3[0], Math.max(l1[2], l2[2])]
      ])
      let intersects = lineIntersect(line1, line2)
      return intersects.features[0].geometry.coordinates[1]
  }
  else if(l1[1] != l2[1]){
      let line1 = lineString([
          [l1[1], l1[2]],
          [l2[1], l2[2]]
      ])
      let line2 = lineString([
          [l3[1], 0],
          [l3[1], Math.max(l1[2], l2[2])]
      ])
      let intersects = lineIntersect(line1, line2)
      return intersects.features[0].geometry.coordinates[1]
  }
  // else return
}
export function calcDistance(point1, point2) {
  var line = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": [
              point1, 
              point2
            ]
          }
        }
      ]
    };
    
    var start = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": point1
      }
    };
    var stop = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": point2
      }
    };
    return length(lineSlice(start, stop, line.features[0]), {units: 'meters'})
}


function segmentateLine(point1, point2, segmentProcent, startDist, manager3D, flag=false) {
  let pwa1 = [
      point1[0],
      point1[1]
  ]
  let pwa2 = [
      point2[0],
      point2[1]
  ]

  let distance = calcDistance(
      pwa1, 
      pwa2
      )
  let interval = 0;
  if(flag){
      interval = 1/1000
  }
  else{
      interval = distance/1000*(segmentProcent/100)
  }
  // console.log(distance/1000*(segmentProcent/100))
  if(distance < 10){
      return {
          cords:[point1, point2]
      }
  }
  else{
      let cords = []
      let AMS = []
      let curDistance = startDist
      let z = [...lineChunk({
          type: 'Feature',
          geometry: {
              type: 'LineString',
              coordinates: [
                  pwa1,
                  pwa2
              ]
          },
          properties: {}
      }, interval).features.map((feature) => {
          let alt;
          //console.log(pwa1, pwa2, feature.geometry.coordinates[0])
          if(pwa1[0] == feature.geometry.coordinates[0][0] && pwa1[1] == feature.geometry.coordinates[0][1]){
              alt = point1[2]
          }
          else if(pwa2[0] == feature.geometry.coordinates[0][0] && pwa2[1] == feature.geometry.coordinates[0][1]){
              alt = point2[2]
          }
          else if(point1[2] == point2[2]){
              alt = point1[2]
          }
          else{
              alt = getIntersectAlt(
                  point1, 
                  point2, 
                  feature.geometry.coordinates[0]
              )
          }
          curDistance+=interval
          let ams = this.props.manager3D.getAMS([...feature.geometry.coordinates[0]])
          cords.push([
              ...feature.geometry.coordinates[0],
              alt
          ])
          // this.props.manager3D.getAMS(coordArr.at(-1))
          return 
  })]

  cords.push(point2)

  return {
          cords:cords,
      }
  }
}


export function timeFormat(time){
    let hours = Math.floor(time / 3600)
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = time - (hours * 3600) - (minutes * 60);

    seconds = Math.trunc(seconds)
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours + ':' + minutes + ':' + seconds;
  }
export function distanceFormat(distance){
    if(distance > 1000){
      let km = Math.trunc(distance/1000)
      let meters = distance-km*1000
      return km + 'км ' +  Math.trunc(meters) + 'м';
    }
    else{
      return Math.trunc(distance) + 'м';
    }
  }