var token, airportsData, airportWeatherData, map;
let infoWindows = [];
let currentAirports = [];
var map;


/* ======== Model (data) ======== */

let Model = {

            // settings for token for lufthansa API
            token : {
                url: 'https://api.lufthansa.com/v1/oauth/token',

                init: {  method: 'POST',
                         headers: new Headers({
                                 'Accept': 'application/json',
                                 'Content-Type':'application/x-www-form-urlencoded'
                         }),
                         body: 'client_id=pjkr5s9wym4dqam4kptjqchn&client_secret=KuxsDvsgb6&grant_type=client_credentials'

                    },
                },
            // settings for Lufthansa API
            airportsAPI : {
                url: 'https://api.lufthansa.com/v1/references/airports/?lang=en&limit=100&offset=0&LHoperated=1',

                init: {  method: 'GET',
                         headers: new Headers({
                                 'Accept': 'application/json',
                                 'Authorization': 'Berer' + token,
                         }),
                         mode: 'cors',
                         cache: 'default'
                     },
            },

            // settings for Weather API
            weatherAPI: {
                init: {  method: 'GET',
                         mode: 'cors',
                         cache: 'default' },

            },

            // settings for Google MAPS API
            mapOptions: {
                startLatLng: new google.maps.LatLng(32.898898,13.095172),
                startZoom: 3,
                disableDefaultUI: true, // a way to quickly hide all controls
                scaleControl: true,
                zoomControl: true,
                styles: [
                          {
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#f5f5f5"
                              }
                            ]
                          },
                          {
                            "elementType": "labels.icon",
                            "stylers": [
                              {
                                "visibility": "off"
                              }
                            ]
                          },
                          {
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#616161"
                              }
                            ]
                          },
                          {
                            "elementType": "labels.text.stroke",
                            "stylers": [
                              {
                                "color": "#f5f5f5"
                              }
                            ]
                          },
                          {
                            "featureType": "administrative.land_parcel",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#bdbdbd"
                              }
                            ]
                          },
                          {
                            "featureType": "poi",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#eeeeee"
                              }
                            ]
                          },
                          {
                            "featureType": "poi",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#757575"
                              }
                            ]
                          },
                          {
                            "featureType": "poi.park",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#e5e5e5"
                              }
                            ]
                          },
                          {
                            "featureType": "poi.park",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#9e9e9e"
                              }
                            ]
                          },
                          {
                            "featureType": "road",
                            "stylers": [
                              {
                                "visibility": "off"
                              }
                            ]
                          },
                          {
                            "featureType": "road",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#ffffff"
                              }
                            ]
                          },
                          {
                            "featureType": "road.arterial",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#757575"
                              }
                            ]
                          },
                          {
                            "featureType": "road.highway",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#dadada"
                              }
                            ]
                          },
                          {
                            "featureType": "road.highway",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#616161"
                              }
                            ]
                          },
                          {
                            "featureType": "road.local",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#9e9e9e"
                              }
                            ]
                          },
                          {
                            "featureType": "transit.line",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#e5e5e5"
                              }
                            ]
                          },
                          {
                            "featureType": "transit.station",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#eeeeee"
                              }
                            ]
                          },
                          {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#c9c9c9"
                              }
                            ]
                          },
                          {
                            "featureType": "water",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#9e9e9e"
                              }
                            ]
                          }
                        ]
            }
};


/* ======== Controller ======== */

let Controller = {
    init: function() {

        this.fetchAirportsData();

    },

    // fetching data from LUFTHANSA
    fetchAirportsData: function () {

                        // first fetching TOKEN
                        fetch(Model.token.url, Model.token.init)
                        .then((response) => {
                              if(response.ok) {
                                return response.json();
                              } else {
                                throw new Error('Coundnt get token from LH Api');
                              }
                        })
                        .then((tokenjson) => {
                             token = tokenjson.access_token;

                             // when fetching TOKEN done, it will fetch AIRPORTS data
                             fetch(Model.airportsAPI.url, {
                                          method: 'GET',
                                          headers: new Headers({
                                                  'Accept': 'application/json',
                                                  'Authorization': 'Bearer ' + token,
                                          }),
                                          mode: 'cors',
                                          cache: 'default'

                             })
                             .then((response) => {
                                   if(response.ok) {
                                     return response.json();
                                   } else {
                                     throw new Error('Server response wasn\'t OK');
                                   }
                             })
                             .then((json) => {
                                  airportsData = json.AirportResource.Airports.Airport;

                                  airportsData.forEach( function(el, i) {
                                      airportsData[i].latlng = {lat: airportsData[i].Position.Coordinate.Latitude, lng: airportsData[i].Position.Coordinate.Longitude};
                                      string =  airportsData[i].AirportCode + " - " + airportsData[i].Names.Name.$;
                                      airportsData[i].string = string;
                                  });
                             })
                             .then(() => {
                                 ko.applyBindings(ViewList());
                             })
                             .then(() => {
                                  ViewMap.init();
                             }).catch((error) => {
                               error = 'Cound not get data from Lufthansa API';
                               alert(error);
                           });
                        }).catch((error) => {
                          error = 'Something went wrong with getting a token from Lufthansa API';
                          alert(error);
                        });
                        /* ; */
    },

    matchClick: function(match) {
        airportsData.forEach( function(el, i) {
            if( match === airportsData[i].string) {
                ViewMap.markerClick(i);
            }
        });
    }
};


/* ======== View (Google Map) ======== */
let ViewMap = {

    // generating google map, settings from Model
    generateMap: function() {
                var myOptions = {
                    zoom: Model.mapOptions.startZoom,
                    center: Model.mapOptions.startLatLng,
                    styles: Model.mapOptions.styles,
                    disableDefaultUI: Model.mapOptions.disableDefaultUI, // a way to quickly hide all controls
                    scaleControl: Model.mapOptions.scaleControl,
                    zoomControl: Model.mapOptions.zoomControl,

                };
                map = new google.maps.Map(document.getElementById("map"),
                        myOptions);


    },

    // generateing Markers
    generateMarker: function(i) {
        var marker = new google.maps.Marker({
            position : airportsData[i].latlng,
            map : map,
            airportCode: airportsData[i].AirportCode,
            icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                    fillColor: '#FFC02C',
                    fillOpacity: 1,
                    strokeColor: "#333333",
                    strokeWeight: 2,
                    strokeOpacity: 1.0
                  },
        });

        airportsData[i].marker = marker;
        airportsData[i].marker.addListener('click', function() {
          ViewMap.markerClick(i);
        });
    },

    // generating Info window and fetching weather data
    generateInfoWindow: function(i) {
        fetch(`https://api.apixu.com/v1/current.json?key=928964bcff1a4aa3ab891917172610&q=${airportsData[i].Position.Coordinate.Latitude},${airportsData[i].Position.Coordinate.Longitude}`, Model.weatherAPI.init)
        .then((response) => {
              if(response.ok) {
                return response.json();
              }
        })
        .then((wheaterjson) => {
             airportWeatherData = wheaterjson;
             var info = `
             <div class="airport-info">
                 <p class="airport-code">${airportsData[i].AirportCode}</p>
                 <p class="city">${airportsData[i].Names.Name.$}</p>
             </div>
             <div class="weather">
                <p class="temp">${airportWeatherData.current.feelslike_c}</p>
                <p class="condition"><img src="http:${airportWeatherData.current.condition.icon}" width="40" alt="${airportWeatherData.current.condition.text}"></p>
             </div>
             `;
             $('.info-window').html(info);
        }).catch((error) => {
          error = 'App cound not get weather data from the server';
          alert(error);
        });


    },

    // what happens when marker is clicked
    markerClick: function(i) {
            this.resetMarkers(i);
            this.setCurrentMarker(i);
            this.generateInfoWindow(i);
    },


    // Sets the map on all markers in the array.
    setMapOnAll: function(map) {
        for (var i = 0; i < airportsData.length; i++) {
          airportsData[i].marker.setMap(map);
        }
    },

    // Removes the markers from the map and reseting icon
      resetMarkers: function(i) {
          airportsData.forEach( function(el,i) {
              airportsData[i].marker.setAnimation(null);

              var iconRegular = {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 5,
                      fillColor: '#FFC02C',
                      fillOpacity: 1,
                      strokeColor: "#333333",
                      strokeWeight: 2,
                      strokeOpacity: 1.0
                    };
              airportsData[i].marker.setIcon(iconRegular);
          });
    },


    // Deletes all markers in the array by removing references to them.
      deleteMarkers: function() {
        for (var i = 0; i < airportsData.length; i++) {
          airportsData[i].marker.setMap(null);
        }
    },

    // centering and selecting current marker
    setCurrentMarker: function(i) {
        map.setZoom(5); //Zoom map view
        map.panTo(airportsData[i].latlng);

        airportsData[i].marker.setAnimation(google.maps.Animation.BOUNCE);
        var iconSelected = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#333333',
            fillOpacity: 1,
            strokeColor: "#333333",
            strokeWeight: 2,
            strokeOpacity: 1.0
        };
        airportsData[i].marker.setIcon(iconSelected);
    },

    // initialization for View Map
    init: function() {

        this.generateMap();

        // generate markers on init
        airportsData.forEach( function(el, i) {
            ViewMap.generateMarker(i);
        });

        // observe input and filter markers
        $('.filter').on('input', function() {
            ViewMap.render();
        });
    },

    // rendering Map View
    render: function() {
        currentAirports = [];
        this.deleteMarkers();
        $( ".airport" ).each(function() {
          currentAirports.push($( this ).text());
        });

        currentAirports.forEach( function(el, i) {
            for (x = 0; x < airportsData.length; x++) {
                if (currentAirports[i] === airportsData[x].string) {
                    ViewMap.generateMarker(x);
                }
            }
        });

    }
};


/* ======== View (Airports List) ======== */


var ViewList = function () {
    this.markers = [];

    //Copies the values of airportsData and stores them in sortedLocations(); observableArray
    this.sortedLocations = ko.observableArray(airportsData);

    //Click on item in list view
    this.listViewClick = function(match) {
      match = this.string;
      Controller.matchClick(match);
      $('body').removeClass('aside-visible');
    };

    // Stores user input
    this.query = ko.observable('');

    //Filter through observableArray and filter results using knockouts utils.arrayFilter();
    this.search = ko.computed(function() {
      return ko.utils.arrayFilter(this.sortedLocations(), function(listResult) {
        return listResult.string.toLowerCase().indexOf(this.query().toLowerCase()) >= 0;
      });
    });

};



Controller.init();



$(document).ready(function() {
    $('.search-btn').on('click', function(){
        $('body').toggleClass('aside-visible');
    });
});
