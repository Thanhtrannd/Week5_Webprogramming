const fetchData = async () => {
  const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
  const res = await fetch(url)
  const data = await res.json()
  console.log(data)
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
    attribution: 'Open street map'
  }).addTo(map);

  map.fitBounds(geoJson.getBounds())

}

const getFeature = (feature, layer) => {
  if (!feature.properties.name) return;
  const name = feature.properties.name
  console.log(name)
  layer.bindTooltip(name)
}

fetchData()