const fetchData = async () => {
  const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
  const res = await fetch(url)
  const data = await res.json()

  initMap(data)
};

const initMap = (data) => {
  let map = L.map('map', {
    minZoom: -3
  })

  let geoJson = L.geoJson(data, {
    weight: 2,
    onEachFeature: getFeature
  }).addTo(map)

  let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.fitBounds(geoJson.getBounds())

}

const getFeature = (feature, layer) => {

}

fetchData()