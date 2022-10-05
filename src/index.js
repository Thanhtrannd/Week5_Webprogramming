var posIndex;
var posLabel;
var posValue;

var negIndex;
var negLabel;
var negValue;



const fetchData = async () => {
  const urlmap = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
  const resmap = await fetch(urlmap)
  const data = await resmap.json()
  console.log(data)

  // Fetch migration data
  // positive
  const urlposmigra = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
  const resposmigra = await fetch(urlposmigra)
  const posdata = await resposmigra.json()
  console.log(posdata)

  posIndex = posdata.dataset.dimension.Tuloalue.category.index;
  posLabel = posdata.dataset.dimension.Tuloalue.category.label;
  posValue = posdata.dataset.value;

  console.log(posIndex)
  console.log(posLabel)
  console.log(posValue)
  // negative
  const urlnegmigra = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"
  const resnegmigra = await fetch(urlnegmigra)
  const negdata = await resnegmigra.json()
  console.log(negdata)
  
  negIndex = negdata.dataset.dimension.Lähtöalue.category.index;
  negLabel = negdata.dataset.dimension.Lähtöalue.category.label;
  negValue = negdata.dataset.value;

  console.log(negIndex)
  console.log(negLabel)
  console.log(negValue)

  // initialize map
  initMap(data)
};

const initMap = (data) => {
  let map = L.map('map', {
    minZoom: -3
  })

  let geoJson = L.geoJson(data, {
    weight: 2,
    onEachFeature: getFeature,
    style: getStyle
  }).addTo(map)

  let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  let baseMaps = {
    'openstreetmap': osm,
  }

  let overlayMaps = {
    'municipalities': geoJson,
  }

  let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map)

  map.fitBounds(geoJson.getBounds())

}

const getFeature = (feature, layer) => {
  if (!feature.properties.name) return;
  const name = feature.properties.name
  console.log(name)
  layer.bindTooltip(name)

  // construct popup
  let {pos_label, pos_value, neg_label, neg_value} = getMigration(name);  
  layer.bindPopup(
    `<ul>
      <li>${pos_label}: ${pos_value}</li>
      <li>${neg_label}: ${neg_value}</li>
    </ul>`
  )
}

const getMigration = (region) => {
  // Index positive migration data
  var pos_index;
  var pos_value = "";
  var pos_label = "";
  for (let key in posLabel) {
    pos_label = posLabel[key];
    if (pos_label.includes(region)) {
      pos_index = posIndex[key]
      pos_value = posValue[pos_index]
      break
    }
  }
  if (pos_value ==="") {
    pos_label = ""
  }
  // Index negative migration data
  var neg_index;
  var neg_value = "";
  var neg_label = "";
  for (let key in negLabel) {
    neg_label = negLabel[key];
    if (neg_label.includes(region)) {
      neg_index = negIndex[key]
      neg_value = negValue[neg_index]
      break
    }
  }
  if (neg_value ==="") {
    neg_label = ""
  }
  return {pos_label, pos_value, neg_label, neg_value};
}

const getStyle = (feature) => {
  if (!feature.properties.name) return;
  const name = feature.properties.name
  
  let {pos_label, pos_value, neg_label, neg_value} = getMigration(name);
  let hue = ((pos_value/neg_value)**3)*60;
  if (hue > 120) {
    hue = 120
  }
  let colour = hslToHex(hue, 75, 50)
  console.log(colour)
  return {
    //color: colour
    color: "hsl(" + hue + "," + "75" + "%," + "50" + "%)",
  }
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

fetchData()