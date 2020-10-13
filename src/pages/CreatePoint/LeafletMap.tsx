import { LatLngTuple, LeafletMouseEvent } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';

type State = {
  lat: number,
  lng: number,
  zoom: number,
}

interface Props {
  handleClick: any;
}

const LeafletMap = (props: Props) => {
  const state: State = {
    lat: 51.505,
    lng: -0.89,
    zoom: 13,
  }
  const [selectedPosition, setSelectedPosition] = useState<LatLngTuple>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<LatLngTuple>([0, 0]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setInitialPosition([
        position.coords.latitude,
        position.coords.longitude
      ]);

      setSelectedPosition([
        position.coords.latitude,
        position.coords.longitude
      ]);
    });
  }, [])

  function handleMapClick (event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);

    props.handleClick([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  }

  return (
    <Map center={initialPosition} zoom={state.zoom} onclick={handleMapClick}>
      <TileLayer 
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={selectedPosition}></Marker>
    </Map>
  );  
}

export default LeafletMap;
