let map, token;
let airports = [];

/* ======== Model  ======== */
let Model = {

    // settings for token for lufthansa API
    token: {
        url: 'https://api.lufthansa.com/v1/oauth/token',

        init: {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
            body: 'client_id=pjkr5s9wym4dqam4kptjqchn&client_secret=KuxsDvsgb6&grant_type=client_credentials'

        },
    },
    // settings for Lufthansa API
    airportsAPI: {
        url: 'https://api.lufthansa.com/v1/references/airports/?lang=en&limit=100&offset=0&LHoperated=1',

        init: {
            method: 'GET',
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
        init: {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        },

    },

    // settings for Google MAPS API
    mapOptions: {
        startLatLng: {
            lat: 32.898898,
            lng: 13.095172
        },
        startZoom: 3,
        disableDefaultUI: true, // a way to quickly hide all controls
        scaleControl: true,
        zoomControl: true,
        styles: [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}]
    }
};


/* ======== Fetching Airports infromation from Lufthasna API  ======== */

fetchAirportsData = function () {

    // first fetching TOKEN
    fetch(Model.token.url, Model.token.init)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            else {
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
                        'Authorization': 'Bearer ' +
                            token,
                    }),
                    mode: 'cors',
                    cache: 'default'

                })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    else {
                        throw new Error(
                            'Server response wasn\'t OK'
                        );
                    }
                })
                .then((json) => {
                    let airportsData = json.AirportResource.Airports.Airport;

                    // storing fetched data as in a aiports array
                    airportsData.forEach(function (el, i) {
                        let airport = {};
                        airport.name = airportsData[i].Names.Name.$;
                        airport.code = airportsData[i].AirportCode;
                        airport.fullName = airportsData[i].AirportCode + " - " + airportsData[i].Names.Name.$;
                        airport.latlng = {
                            lat: airportsData[i].Position.Coordinate.Latitude,
                            lng: airportsData[i].Position.Coordinate.Longitude
                        };
                        airports.push(airport);
                    });

                })
                .then(() => {
                    ko.applyBindings(new ViewModel());
                })
                .then(() => {

                }).catch((error) => {
                    error =
                        'Cound not get data from Lufthansa API';
                    alert(error);
                });
        }).catch((error) => {
            error =
                'Something went wrong with getting a token from Lufthansa API';
            alert(error);
        });
};


/* ======== View Map  ======== */


let Airport = function (data) {
    let self = this;
    this.name = data.name;
    this.fullName = data.fullName;
    this.code = data.code;
    this.latlng = data.latlng;
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.latlng),
        map: map,
        title: data.name,
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

    // data for info window,
    // fetching weather from APIXU API
    // open infoWindow when fetch done
    this.infoWindow = new google.maps.InfoWindow({
        content: "",
        position: data.latlng,
        pixelOffset: new google.maps.Size(0, -20),
        weather: function () {
            fetch(
                    `https://api.apixu.com/v1/current.json?key=928964bcff1a4aa3ab891917172610&q=${data.latlng.lng},${data.latlng.lng}`,
                    Model.weatherAPI.init)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                })
                .then((wheaterjson) => {
                    self.weather = wheaterjson;
                    let info =
                        `<div class="airport-info">
                               <p class="airport-code">${self.code}</p>
                               <p class="city">${self.name}</p>
                           </div>
                           <div class="weather">
                              <p class="temp">${self.weather.current.feelslike_c}</p>
                              <p class="condition"><img src="http:${self.weather.current.condition.icon}" width="40" alt="${self.weather.current.condition.text}"></p>
                           </div>`;
                    self.infoWindow.setContent(info);
                    self.infoWindow.open(map);
                }).catch((error) => {
                    error =
                        'App cound not get weather data from the server';
                    alert(error);
                });
        },

    });

    // add listener to marker
    this.marker.addListener('click', function () {
        self.infoWindow.weather();
        self.setCurrentMarker();
    });

    // change selected marker icon and set map center to this marker + zoom in
    // after some time reset to normal & stop animation
    this.setCurrentMarker = function () {
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        const iconSelected = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#333333',
            fillOpacity: 1,
            strokeColor: "#333333",
            strokeWeight: 2,
            strokeOpacity: 1.0
        };
        const iconRegular = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#FFC02C',
            fillOpacity: 1,
            strokeColor: "#333333",
            strokeWeight: 2,
            strokeOpacity: 1.0
        };
        self.marker.setIcon(iconSelected);

        map.panTo(data.latlng);
        map.setZoom(6);

        setTimeout(function () {
            self.marker.setAnimation(null);
            self.marker.setIcon(iconRegular);
        }, 3000);
    };

};

let ViewModel = function () {
    let self = this;

    self.listLoc = ko.observableArray();

    airports.forEach(function (locItem) {
        self.listLoc.push(new Airport(locItem));
    });

    self.filter = ko.observable('');

    self.filteredAirports = ko.computed(function () {
        let filter = self.filter().toLowerCase();
        if (!filter) {
            ko.utils.arrayForEach(self.listLoc(), function (item) {
                item.marker.setVisible(true);
            });
            return self.listLoc();
        }
        else {
            return ko.utils.arrayFilter(self.listLoc(), function (
                item) {
                // set all markers visible (false)
                let result = (item.fullName.toLowerCase().search(
                    filter) >= 0);
                item.marker.setVisible(result);
                return result;
            });
        }
    });

    self.toggleClass = ko.observable(false);

    self.clickAirportInList = function () {
        google.maps.event.trigger(this.marker, 'click');
        self.clickSearch();
    };

    self.clickSearch = function () {
        this.toggleClass(!this.toggleClass());
    };

};


/* ======== functions for Google Map  ======== */

initMap = function () {
    let myOptions = {
        zoom: Model.mapOptions.startZoom,
        center: Model.mapOptions.startLatLng,
        styles: Model.mapOptions.styles,
        disableDefaultUI: Model.mapOptions.disableDefaultUI, // a way to quickly hide all controls
        scaleControl: Model.mapOptions.scaleControl,
        zoomControl: Model.mapOptions.zoomControl,

    };
    map = new google.maps.Map(document.getElementById("map"),
        myOptions);

};

fetchAirportsData();
