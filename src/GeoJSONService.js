// https://github.com/PaulLeCam/react-leaflet/issues/176
import data from './observations.json'
// used to retrieve geojson info from some api/file/hard-coded value
function getGeoJson() {
    return data;
}

export default getGeoJson;