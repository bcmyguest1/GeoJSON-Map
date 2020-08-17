import React from 'react';
import {
    GeoJSON,
    TileLayer,
    Map as LeafletMap
  } from "react-leaflet";

export default class GeoJSONMap extends React.Component {
  static defaultProps = {
    lat: 0,
    lng: 0,
    zoom: 2,
    data: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      lat: this.props.lat,
      lng: this.props.lng,
      zoom: this.props.zoom
    }
  }

  getStyle(feature, layer) {
    return {
      color: '#006400',
      weight: 5,
      opacity: 0.65
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <div>
      <LeafletMap center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        <GeoJSON data={this.props.data} style={this.getStyle} />
      </LeafletMap>
      </div>
    );
  }
}
