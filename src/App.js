import React from 'react';
import './App.css';
import GeoJSONMap from './GeoJSONMap.js';
import getGeoJson from './GeoJSONService.js';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import hash from 'object-hash';
import Select from 'react-select'


const geoJson = getGeoJson();

const sensorTypes = [{value:"", label:"Reset Filter"},{value:"GHGSat-D", label:"GHGSat-D"},
 {value:"GHGSat-C1",label:"GHGSat-C1"}, {value:"GHGSat-C2",label:"GHGSat-C2"}, 
 {value:"GHGSat-C3",label:"GHGSat-C3"}];

function App() {
  return (
    <div className="App">
      <ObservationMapControl observations={geoJson}>
      </ObservationMapControl>
    </div>
  );
}

class ObservationMapControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: {
        dateRange: null,
        sensorType: ".*",
        description: ".*"
      },// this object can include date/date range, type of sensor, description
      observations: this.props.observations,
      filterChange: false//determines whether we should run the filter on render
    };
  }

  componentDidMount() {
    this.setState({// could find the midpoint here then decide where to set the lng/lat in initial load, this could also get the optimal zoom level
      lat: 0,
      lng: 0
    })
  }

  setSensorFilter(newFilter) {
    var newFilterValue = this.state.filterValue;
    newFilterValue.sensorType = newFilter.value.length > 0 ? ".*" + newFilter.value.toLowerCase() + ".*" : ".*";
    this.filterObservations(newFilterValue);
  }

  setFilter(filterValueEvent) {
    //validate and filter
    var filterTarget = filterValueEvent.target.id;
    var newFilter = filterValueEvent.target.value;
    var newFilterValue = this.state.filterValue;
    // we can just use regex to match the input filters
    if (filterTarget === "descriptionFilter") {
      newFilterValue.description = newFilter.length ? ".*" + newFilter.toLowerCase() + ".*" : ".*";
    }

    this.filterObservations(newFilterValue);
  }

  // set state value for observations based on filter and props observations
  filterObservations(newFilterValue) {
      //do the filtering
      //reset the filter value so that subsequent renders don't need it
      //not handling edge case of GeometryColection since I don't have sample data on where property values are stored...
      var observations = Object.assign({},this.props.observations);
      var features = observations.features != null ? observations.features : [];// filter needs to be based on the original data
      features = features.filter(obs => {
        var desc = (obs.properties.description && obs.properties.description.length > 0) ? obs.properties.description.toLowerCase() : "";
        var sensor = (obs.properties.sensor && obs.properties.sensor.length > 0) ? obs.properties.sensor.toLowerCase() : "";
        var match = true;
        if (! (new RegExp(newFilterValue.sensorType).test(sensor))) {
          match = false;
        } else if (!( new RegExp(newFilterValue.description).test(desc))) {
          match = false;
        }
        
/*         else if (sensor.length == 0 && newFilterValue !== ".*") {
          match = false;
        } else if (desc.length == 0 && newFilterValue !== ".*") {
          match = false;
        } */

        return match;
      });
      observations.features = features;
      if (observations.features.length !== this.state.observations.features.length) {
        this.setState({observations: observations,filterValue: newFilterValue, filterChange: false});// for now not filtering until we have the ui in place
        
      }
  }

  render() {
    return (<div id="observationContainer">
              <GeoJSONMap key={hash(this.state.observations)} id="map" data={this.state.observations} lng={this.state.lng ? this.state.lng : undefined} lat={this.state.lat ? this.state.lat : undefined}></GeoJSONMap>
              <ObservationFilter setFilter={this.setFilter.bind(this)} setSensorFilter={this.setSensorFilter.bind(this)}></ObservationFilter>
              <ObservationMapTable data={this.state.observations.features}></ObservationMapTable>
            </div>
    );
  }
}


// basic date range picker component
// could be used for filtering but do not have access to observation.json data which would tell me the format to expect the date to be in
//as you can see above, there is no use for this function, but with date format info this could be used 
// class ObservationDateRangePicker extends React.Component {
//   render(){
//     const selectionRange = {
//       startDate: new Date(),
//       endDate: new Date(),
//       key: 'dateRangeSelection',
//     }
    
//     return (
//       <DateRangePicker
//         ranges={[selectionRange]}
//         onChange={this.props.setFilter}
//       />
//     )
//   }
// }
 

// uses function hook from controller component to edit state (raising the state to the highest common denom)
//currently the filtering is handled with every change, but in a larger scale application, a smarter solution would need to be implemented
// for example, adding a filter button, along with a clear button would do fine
class ObservationFilter extends React.Component {

  render() {
    return (   
      
      <div id="observationFilterContainer">
        <span>Filters: </span>
        {/* commented out date range picker since I can't actually filter this without an example */}
        {/* the setfilter event could bemanipulated to check the data in the observation filter component then pass to the props.setFilter function */}
        {/* <ObservationDateRangePicker setFilter={this.props.setFilter}></ObservationDateRangePicker> */}
        <Select id="sensorTypeFilter" options={sensorTypes} value="" onChange={this.props.setSensorFilter} placeholder="Filter Sensor"></Select>
        {/* <input id="sensorTypeFilter" onChange={this.props.setFilter} placeholder="Filter Sensor Type"></input> */}
        <input id="descriptionFilter" onChange={this.props.setFilter} placeholder="Filter Description"></input>
      </div>);
  }

}


// to be used to filter objects and add them to cart
class ObservationMapTable extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {data: this.props.data, page: 0, itemsPerPage: 10}
  }
  
  render() {
    var observationMap = [];
    for (var i=0;i<this.props.data.length; i++) {
      observationMap.push(<ObservationEntry key={i} data={this.props.data[i]}></ObservationEntry>)
    }
    return (<table id="observationMapTable">
      <tbody>
        <tr>
          <th>Type</th>
          <th>Geometry Type</th>
          <th>Geometric Information</th>
          <th>Properties</th>
        </tr>
        {observationMap}
        </tbody>
      </table>);
  }
}

// table entry for geojson object
class ObservationEntry extends React.Component {
  render() {
    var geometricInformation;
    if (this.props.data.geometry.coordinates) {
      geometricInformation = <td>{JSON.stringify(this.props.data.geometry.coordinates)}</td>;
    } else if (this.props.data.geomtries) {
      geometricInformation = <td>{JSON.stringify(this.props.data.geomtries)}</td>; // this is an edge case I'm not exactly sure how to show the user
    }

    var properties;
    if (this.props.data.properties) {
      properties = <td>{JSON.stringify(this.props.data.properties)}</td>
    } else {
      properties = <td>{'N/A'}</td>
    }
    return (<tr className="box">
      <td>{this.props.data.type}</td>
      <td>{this.props.data.geometry.type}</td>
      {geometricInformation}
      {properties}
      {/* <td><ObservationMapInfo coordinates={this.props.data.geometry.coordinates} type={this.props.data.geometry.type} geomtries={this.props.data.geometries}></ObservationMapInfo></td> */}
      {/*not sure if geomtryCollection should be displayed as one or multiple entries, probably as one */}
    </tr>);
  }
}
// dead code
// // component to be used as a controller for the canvas
// class ObservationMapInfo extends React.Component {

//   constructor(props) {
//     super(props);
//     // console.log(this.props.coordinates);
//     if (this.props.coordinates != null && this.props.coordinates.length > 0 ) {
//       var coordsArr = [].concat.apply([], this.props.coordinates);
//       var minMax = this.findExtremeCoords(coordsArr);
//     } else if (this.props.geometries != null && this.props.geometries.length > 0) {
//       // find coords in a different way
//     }
    
//     this.state = {maxCoord: minMax.min,
//                   minCoord: minMax.max};
//   }

//   // find the extreme coords and remove any data that doesn't fit in the the coordinate system
//   findExtremeCoords(coordArr) {
//     var ySet = false;
//     var xSet = false;
//     var xMax = 180;
//     var yMax = 90;
//     var min = {};
//     var max = {};
//     for (var i=0;i<coordArr.length;i++) {// O(n)
//       if (i%2===0) {
//         if (Math.abs(coordArr[i]) > xMax) {//this alg is bad, but can be fix later
//           if (coordArr[i] > 0) {
//             while(coordArr[i] > xMax) {
//               coordArr[i] -= xMax;
//             }
//           } else {
//             while(coordArr[i] < xMax) {
//               coordArr[i] += xMax;
//             }
//           }
//         }
//         if (!xSet) {
//           max.x = coordArr[i];
//           min.x = coordArr[i];
//         } else {
//           if (coordArr[i] < min.x) {
//             min.x = coordArr[i];
//           } else if (coordArr[i] > max.x) {
//             max.x = coordArr[i];
//           }
//         }
//         xSet = true;
//       } else {
//         if (Math.abs(coordArr[i]) > yMax) {
//           if (coordArr[i] > 0) {
//             while(coordArr[i] > yMax) {
//               coordArr[i] -= yMax;
//             }
//           } else {
//             while(coordArr[i] < yMax) {
//               coordArr[i] += yMax;
//             }
//           }
//         }
//         if (!ySet) {
//           max.y = coordArr[i];
//           min.y = coordArr[i];
//         } else {
//           if (coordArr[i] < min.y) {
//             min.y = coordArr[i];
//           } else if (coordArr[i] > max.y) {
//             max.y = coordArr[i];
//           }  
//         }
//         ySet = true;
//       }
//     }
//     // console.log(min)
//     return {min, max};
//   }

//   render() {
//     // console.log(this.state)
//     return (<div>
//               <h1>Max x: {this.state.maxCoord.x} Max y: {this.state.maxCoord.y} Min x: {this.state.minCoord.x} Min y: {this.state.minCoord.y}</h1>
//             </div>);
//   }
// }


// will need to add components for point, linestring, polygon, multipolygon, 


export default App;
