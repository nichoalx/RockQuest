// web-maps-mock.js
import React from 'react';

// Mock MapView component for web
export default function MapView(props) {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, 'Map not available on web');
}

// Mock other react-native-maps exports
export const Marker = (props) => null;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
export const Callout = (props) => null;
export const Circle = (props) => null;
export const Polygon = (props) => null;
export const Polyline = (props) => null;