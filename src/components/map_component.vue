<template>
  <div id="map">
  </div>
</template>

<script>
    import axios from 'axios';
    import router from '../router/main';

    export default {
        name: "Map",
        
        mounted() {

            // Initializing map
            const map = L.map('map', {
                drawControl: false,
            }).setView([41.31, 69.28], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
            // Variable for saving single layer data
            var layer;
            
            // Variable for saving all layers data
            var allLayers;
            
            // Variable for saving popup content
            var popupContent;
            
            // Variable for saving area data
            var area;
            
            // Variable for saving polygon data
            var polygon;
            
            // Variable for saving geometry data
            var geometry;
            
            // Variable for saving DrawControl data
            var drawControl;
            
            // Variable for saving options for DrawControl
            var drawOptions;
            
            // Variable for saving latitude & longitute data
            var latlngs;
            var Layer;
            
            // Variable for preventing new layers from clicking
            var layerClickPrevent = false;
            
            // Variable for checking status of delete operations
            var deleteStartStatus = false;
            
            // Variable for checking status of edit operations
            var editStartStatus = false;
            
            // Variable for saving data to
            var data
            
            // Creating a FeatureGroup for drawn items & adding it to map
            var drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            // Creating a FeatureGroup for edited items & adding it to map
            var editItems = new L.FeatureGroup();
            map.addLayer(editItems);

            // Function for defining options for DrawControl
            const defineDrawOptions = (options) => {
                drawOptions = {
                    position: 'topright',
                    draw: options.can_draw ? {
                        polygon: options.polygons ? {
                            allowIntersection: false, // Restricts shapes to simple polygons
                            drawError: {
                                color: 'red', // Color the shape will turn when intersects
                                message: 'Lines should not intersect', // Message that will show when intersect
                            },
                            shapeOptions: {
                                color: '#50b8e7',
                            }
                        } : false,
                        circle: false,
                        circlemarker: false,
                        marker: options.markers ? true : false,
                        polyline: false,
                        rectangle: false,
                    } : false,
                    edit: options.can_edit ? {
                    featureGroup: options.operatingLayer,
                    remove: options.can_delete ? true : false,
                    } : false,
                }
            }

            // Function for loading DrawControl (idk why I called it reload, bc it both load and reloads the DrawControl)
            const reloadDrawControl = (events, options) => {
                if (events === 'initial') {
                    defineDrawOptions(options);
                    drawControl = new L.Control.Draw(drawOptions);
                    map.addControl(drawControl);
                } else if (events === 'secondary') {
                    map.removeControl(drawControl);
                    defineDrawOptions(options);
                    drawControl = new L.Control.Draw(drawOptions);
                    map.addControl(drawControl);
                }
            }

            // Function for area calculation of a polygon
            const findAreaPolygon = (layer, events) => {
                if (events === 'created') {
                    var objects = layer.getLatLngs()[0];
                    geometry = [[]];
                    var first = "";
                    for (var i = 0; i < objects.length; i++) {
                        if (i == 0) {
                            first = new L.latLng(objects[i].lat, objects[i].lng)
                        };

                        var latlng = new L.latLng(objects[i].lat, objects[i].lng);
                        var point = latlng;

                        geometry[0].push([point['lng'], point['lat']]);
                    }
                    geometry[0].push([first['lng'], first['lat']]);

                    polygon = turf.polygon(geometry);
                    area = turf.area(polygon) / 10000;
                } else if (events === 'edited') {
                    var objects = layer.getLatLngs()[0];
                    geometry = [[]];
                    var first = "";
                    for (var i = 0; i < objects.length; i++) {
                        if (i == 0) {
                            first = new L.latLng(objects[i].lat, objects[i].lng)
                        };

                        var latlng = new L.latLng(objects[i].lat, objects[i].lng);
                        var point = latlng;

                        geometry[0].push([point['lng'], point['lat']]);
                    }
                    geometry[0].push([first['lng'], first['lat']]);

                    polygon = turf.polygon(geometry);

                    layer.feature.geometry = geometry;
                    layer.feature.properties.area = turf.area(polygon) / 10000;
                }
            }

            // Function for loading popups
            const loadPopupPolygon = (layer_type, events, layer) => {

                if (layer_type === 'polygon') {
                    if (events === 'created') {
                        popupContent = `
                        <div id="popup-content">
                            <table id="created-table">
                                <tr>
                                    <td><label for="name" class="label-name"></label><span class="content-name">Name</span></td>
                                    <td><input name="name" type="text" required></td>
                                </tr>
                                <tr>
                                    <td><label for="area" class="label-name"></label><span class="content-name">Area (ha)</span></td>
                                    <td><input name="area" type="number" value="${area.toFixed(2)}" required disabled></td>
                                </tr>
                                <tr>
                                    <td><label for="description"></label><span class="content-name">Description</span></td>
                                    <td><input name="description" type="text" required></td>
                                </tr>
                            </table>
                            <div id="save-layer">
                                <button id="save-button">save</button>
                                <button id="cancel-button">cancel</button>
                            </div>
                        </div>
                        `;

                        layer.bindPopup(popupContent).openPopup();

                        $('#cancel-button').click(() => {
                            drawnItems.clearLayers();
                        });

                        $('#save-button').click(() => {
                            data = polygon;
                            data.properties = {
                                'name': $('input[name="name"]').val(),
                                'area': $('input[name="area"]').val(),
                                'description': $('input[name="description"]').val()
                            }
                            if (data.properties['name'] != null && 
                                data.properties['name'].length != 0 && 
                                data.properties['area'] != null && 
                                data.properties['area'].length != 0 && 
                                data.properties['description'] != null &&
                                data.properties['description'].length != 0) {
                                    createBuilding(data);
                                    layer.closePopup();
                            } else {
                                fireAlert('Please, fill in all the fields!', 'error');
                            }
                            
                        });

                    } else if (events === 'generated') {
                        data = layer.feature.properties;
                        return popupContent = `
                            <div id="popup-content">
                                <table id="generated-table">
                                    <tr>
                                        <td>Name</td>
                                        <td>${data.name}</td>
                                    </tr>
                                    <tr>
                                        <td>Area</td>
                                        <td>${data.area}</td>
                                    </tr>
                                    <tr>
                                        <td>Description</td>
                                        <td>${data.description}</td>
                                    </tr>
                                </table>
                            </div>
                        `;
                    } else if (events === 'edited') {

                        data = layer.feature;
                        var id = data.id;

                        layer.unbindPopup();

                        popupContent = `
                        <div id="popup-content">
                            <table id="created-table">
                                <tr>
                                    <td><label for="name" class="label-name"></label><span class="content-name">Name</span></td>
                                    <td><input name="name" type="text" value="${data.properties.name}" required></td>
                                </tr>
                                <tr>
                                    <td><label for="area" class="label-name"></label><span class="content-name">Area (ha)</span></td>
                                    <td><input name="area" type="number" value="${data.properties.area.toFixed(2)}" required disabled></td>
                                </tr>
                                <tr>
                                    <td><label for="description"></label><span class="content-name">Description</span></td>
                                    <td><input name="description" type="text" value="${data.properties.description}" required></td>
                                </tr>
                            </table>
                            <div id="save-layer">
                                <button id="save-button">save</button>
                                <button id="cancel-button">cancel</button>
                            </div>
                        </div>
                        `;
                        layer.bindPopup(popupContent).openPopup();

                        $('.leaflet-popup-close-button').click((e) => {
                            layer.closePopup();
                        })

                        $('#cancel-button').click((e) => {
                            editItems.clearLayers();
                            var options = {
                                can_draw: true, 
                                can_edit: true, 
                                can_delete: true,
                                polygons: true,
                                markers: false,
                                operatingLayer: drawnItems,
                            }
                            reloadDrawControl('secondary', options);
                            getAllBuildings();
                        });

                        $('#save-button').click(() => {
                            data = polygon;
                            data.properties = {
                                'name': $('input[name="name"]').val(),
                                'area': $('input[name="area"]').val(),
                                'description': $('input[name="description"]').val(),
                            }
                            if (data.properties['name'] != null && 
                                data.properties['name'].length != 0 && 
                                data.properties['area'] != null && 
                                data.properties['area'].length != 0 && 
                                data.properties['description'] != null &&
                                data.properties['description'].length != 0) {
                                    updateBuilding(data, id);
                                    layer.closePopup();
                            } else {
                                fireAlert('Please, fill in all the fields!', 'error');
                            }
                        });
                    }
                } else if (layer_type === 'marker') {
                    if (events === 'created') {
                        popupContent = `
                            <div id="popup-content">
                                <table id="generated-table">
                                    <tr><td>Добавление объекта</td></tr>
                                    <tr><td>Локация</td><td><input name='location' type='text' required></td></tr>
                                    <tr><td>Изображения</td><td><input name='link' type='url' required></td></tr>
                                    <tr><td>Описание</td><td><input name='description' type='text' required></td></tr>
                                    <tr><td>Время появления</td><td><input name='start_time' type='date' required></td></tr>
                                </table>
                                <div id="save-layer">
                                    <button id="save-button">save</button>
                                    <button id="cancel-button">cancel</button>
                                </div>
                            </div>
                        `

                        const point = turf.point([Object.values(layer._latlng)[1], Object.values(layer._latlng)[0]]);
                        layer.bindPopup(popupContent).openPopup();
                        $('#cancel-button').click(() => {
                            drawnItems.clearLayers();
                        });
                        $('#save-button').click(() => {
                            const data = point;
                            point.properties = {
                                'location': $('input[name="location"]').val(),
                                'link': $('input[name="link"]').val(),
                                'description': $('input[name="description"]').val(),
                                'start_time': $('input[name="start_time"]').val(),
                                'relevance': '+',
                            }
                            createMarker(data);
                            layer.closePopup();
                        })

                    } else if ('generated') {

                        let marker = layer.feature;
                        data = layer.feature.properties;
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };

                        popupContent = `
                            <div id="popup-content">`

                        popupContent += `
                                <a href="${data.link}"><img style="width: 100%;" id="${marker.id}" src="${data.link}"></a>
                                <table id="generated-table">
                                    <tr>
                                        <td>Локация</td>
                                        <td>${data.location}</td>
                                    </tr>
                                    <tr>
                                        <td>Описание</td>
                                        <td>${data.description}</td>
                                    </tr>
                                    <tr>
                                        <td>Время появления</td>
                                        <td>${new Date(marker.createdAt).toLocaleDateString('ru-EN', options)}</td>
                                    </tr>
                                    <tr>
                                        <td>Ссылка</td>
                                        <td><p class="marker-link" value="/?marker=${marker.id}">Скопировать <span>>>></span></p></td>
                                    </tr>
                                </table>
                            </div>
                        `;
                        return popupContent;
                    }
                }
            }

            // Function for firing alerts
            const fireAlert = (message, icon) => {
                Swal.fire({
                    icon: icon,
                    title: message,
                    showConfirmButton: false,
                    timer: 2500
                })
            }

            // Getting all buildings from DB and diplaying them on map
            const getAllBuildings = () => {
                axios.get('/get-all-buildings')
                .then(function (response) {
                    var states = {
                        features: [],
                        type: "FeatureCollection"
                    }
                    allLayers = response.data;
                    for (var i in Object.keys(allLayers)) {
                        layer = allLayers[i];
                        var state = {
                            "type": "Feature",
                            "properties": layer.properties,
                            "geometry": layer.geometry
                        }
                        state.id = layer._id;
                        states.features.push(state);
                    }
                    Layer = L.geoJSON(states, {
                        onEachFeature: function (feature, layer) {
                            layer.setStyle({
                                color: '#42C2FF'
                            });
                                layer.on('click', (e) => {
                                    if (layerClickPrevent === true) {
                                        // UPDATE CODE HERE
                                    } else {
                                        if (deleteStartStatus === 'true') {
                                            // PDATE CODE HERE TOO
                                        } else {
                                            editItems.clearLayers();
                                            layerClickPrevent = true;
                                            editItems.addLayer(layer);
                                            var options = {
                                                can_draw: false, 
                                                can_edit: true, 
                                                can_delete: true,
                                                polygons: true,
                                                markers: false,
                                                operatingLayer: editItems,
                                            }
                                            reloadDrawControl('secondary', options);
                                        }
                                    }
                                    $('.leaflet-popup-close-button').click((e) => {
                                        layerClickPrevent = false;
                                        editItems.clearLayers();
                                        getAllBuildings();
                                        var options = {
                                            can_draw: true, 
                                            can_edit: true, 
                                            can_delete: true,
                                            polygons: true,
                                            markers: false,
                                            operatingLayer: drawnItems,
                                        }
                                        reloadDrawControl('secondary', options);
                                    })
                                });
                        }
                    }).bindPopup(function (layer) {
                        return popupContent = loadPopupPolygon('polygon', 'generated', layer);
                    }).addTo(map);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
            };

            // Getting all buildnigs from DB and diplaying them on map
            const getAllMarkers = () => {
                axios.get('/get-all-markers')
                .then(function (response) {
                    var states = {
                        features: [],
                        type: "FeatureCollection"
                    }
                    allLayers = response.data;
                    for (var i in Object.keys(allLayers)) {
                        layer = allLayers[i];
                        var state = {
                            "type": "Feature",
                            "properties": layer.properties,
                            "geometry": layer.geometry
                        }
                        state.id = layer._id;
                        state.createdAt = allLayers[i].createdAt;
                        states.features.push(state);
                    }
                    Layer = L.geoJSON(states, {
                        onEachFeature: function (feature, layer) {
                            layer.on('click', (e) => {
                                setTimeout((e) => {
                                    $('.marker-link').click((e) => {
                                        console.log(e);
                                        const base_url = import.meta.env.VITE_link_base_url;
                                        navigator.clipboard.writeText(base_url + e.target.attributes[1].nodeValue);
                                        fireAlert('Ссылка успешно скопирована!', 'success');
                                    })
                                }, 500);
                            })
                        }
                    }).bindPopup(function (layer) {
                        return popupContent = loadPopupPolygon('marker', 'generated', layer);
                    }).addTo(map);

                    for (let x in Layer._layers) {
                        if (Layer._layers[x].feature.id === window.location.search.split('?marker=')[1]) {
                            Layer._layers[x].openPopup();
                            map.fitBounds([[Layer._layers[x].getLatLng().lat, Layer._layers[x].getLatLng().lng]]);
                        }
                    }
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
            };
            
            // Defining options for DrawControl
            var options;
            var cookies = document.cookie.split("=");

            if (cookies[2] === '001') {
                options = {
                    can_draw: true, 
                    can_edit: false, 
                    can_delete: false,
                    polygons: false,
                    markers: true,
                    operatingLayer: drawnItems,
                }
                reloadDrawControl('initial', options);
            }

            // getAllBuildings();
            getAllMarkers();

            // Wrapper function for axios method of creating buildings
            const createBuilding = (data) => {
                axios.post('/add-building', data)
                .then((response) => {
                    // handle success
                    fireAlert('Building created successfully!', 'success');
                    drawnItems.clearLayers();
                    getAllBuildings();
                })
                .catch((error) => {
                    // handle error
                    console.log(error);
                    fireAlert('Some thing went wrong while creating the buliding!', 'error');
                });
            }

            const createMarker = (data) => {
                axios.post('/add-marker', data)
                .then((response) => {
                    fireAlert('Marker created successfully!', 'success');
                    drawnItems.clearLayers();
                    getAllMarkers();
                })
            }

            // Wrapper function for axios method of updating buildings
            const updateBuilding = (data, id) => {
                axios.post('/update-building/' + id, data)
                .then((response) => {
                    // handle success
                    fireAlert('Building updated successfully!', 'success');
                    drawnItems.clearLayers();
                    getAllBuildings();
                })
                .catch((error) => {
                    // handle error
                    console.log(error);
                    fireAlert('Some thing went wrong while updating the building!', 'error');
                });
            }

            const deleteBuilding = (id) => {
                axios.post('/delete-building/' + id)
                .then((response) => {
                    // handle success
                    fireAlert('Building deleted successfully!', 'success');
                    drawnItems.clearLayers();
                    getAllBuildings();
                })
                .catch((error) => {
                    // handle error
                    console.log(error);
                    fireAlert('Some thing went wrong while deleting the building!', 'error');
                });
            }

            // Map event for creating layers
            map.on("draw:created", (e) => {
                if (e.layerType === 'marker') {
                    layer = e.layer;
                    drawnItems.addLayer(layer);
                    loadPopupPolygon('marker', 'created', layer);

                    var options = {
                        can_draw: false, 
                        can_edit: false, 
                        can_delete: false,
                        polygons: false,
                        markers: false,
                        operatingLayer: drawnItems,
                    }
                    reloadDrawControl('secondary', options);
                } else {
                    layer = e.layer;
                    drawnItems.addLayer(layer);

                    findAreaPolygon(layer, 'created');
                    loadPopupPolygon('polygon', 'created', layer);

                    var options = {
                        can_draw: false, 
                        can_edit: true, 
                        can_delete: true,
                        polygons: true,
                        markers: false,
                        operatingLayer: drawnItems,
                    }
                    reloadDrawControl('secondary', options);
                }
            
            });
            
            // Map event for editing layers
            map.on("draw:edited", (e) => {
                
                e.layers._layers = Object.values(editItems._layers);
                layer = Object.values(editItems._layers)[0];
                findAreaPolygon(layer, 'edited');
                loadPopupPolygon('polygon', 'edited', layer);
            
            });
            
            // Map event for deleting layers
            map.on("draw:deleted", (e) => {

                var id = Object.values(e.layers._layers)[0].feature.id;
                deleteBuilding(id);

            });
        },
    }

</script>

<style scoped>

</style>
