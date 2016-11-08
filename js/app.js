var locationData = [
    {
        name: 'Blue Bottle Coffee',
        address: '456 University Ave, Palo Alto, CA 94301',
        lat: 37.4476308, 
        lng: -122.1595775
    },
    {
        name: 'Coupa Cafe - Lytton',
        address: '111 Lytton Ave, Palo Alto, CA 94301',
        lat: 37.4445782, 
        lng: -122.1652114
    },
    {
        name: 'Starbucks',
        address: '376 University Ave, Palo Alto, CA 94301',
        lat: 37.4467141, 
        lng: -122.1604384
    },
    {
        name: 'Cafe Venetia',
        address: '419 University Ave, Palo Alto, CA 94301',
        lat: 37.4474275, 
        lng: -122.1602654
    },
    {
        name: 'Philz Coffee',
        address: '101 Forest Ave, Palo Alto, CA 94301',
        lat: 37.4421463, 
        lng: -122.1615261
    },
    {
        name: "Peet's Coffee",
        address: '436 University Ave, Palo Alto, CA 94301',
        lat: 37.447469, 
        lng: -122.1597397
    }
];

// Data model
var locationList = function(data) {
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.foursquareVenueID = ko.observable();
    this.foursquareLikes = ko.observable();
    this.marker = ko.observable();
};

// View model
var viewModel = function() {
    var self = this;
    self.locations = ko.observableArray([]);
    self.searchText = ko.observable('');

    //Get the location data and fill in our observable Array
    for (var location in locationData) {
      self.locations.push(new locationList(locationData[location]));
    }

    //Set Google Maps Options
    var infowindow = new google.maps.InfoWindow();
    var myLatlng = new google.maps.LatLng(37.4452275,-122.1602654);
    var mapOptions = {zoom: 16, center: myLatlng};
    var marker, i;

    //create the map
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //loop through all locations and add marker for each of them
    self.markers =  function () {
        for (i = 0; i < self.locations().length; i++) {
            self.locations()[i].marker(new google.maps.Marker({
                position: new google.maps.LatLng(self.locations()[i].lat(), self.locations()[i].lng()),
                map: map,
                animation: null,
                visible: true
            }));
            marker = self.locations()[i].marker()
            //add a click listener to all markers
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                //bounce the marker when clicked
                return function() {
                    //check if it is currently bouncing; if so, stop bouncing
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                    //else, make the marker bounce and stop bouncing after 0.71 seconds
                    } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                        window.setTimeout(function() {marker.setAnimation(null);}, 710);
                    }
                    if (infowindow.content != 'Unable to retreive Foursqaure data') {
                        //open the info window and show the number of likes for this venue from Foursqare API
                        infowindow.setContent(String('<h5>'+self.locations()[i].name()+'</h5>'+self.locations()[i].foursquareLikes())+ ' Foursquare Likes');
                    }
                    infowindow.open(map, marker);
                };
            })(marker, i));
        }
    }
    self.markers();

    //Get the Foursquare Venue ID and Likes
    self.foursquare = function() {
        for (var i = 0; i < self.locations().length; i++) {
            //for each location create a custom Foursquare url to get venue ID
            var url = 'https://api.foursquare.com/v2/venues/search?client_id=JYE41Y2DJLVJR1CTWDBP1ZUCZHXJNHDOHB1MAPLZYHC122MQ&client_secret=RNZPA0GEFVCMAJJEX5LJ0DFJHQ4LIKCHU15NN5OW33NMC2HP&v=20161105&limit=1&ll='+self.locations()[i].lat()+','+self.locations()[i].lng()+'&query='+self.locations()[i].name();
            //get the json from this url and run a funtion
            $.getJSON(url, (function() {
                //keep our loop variable
                var ii = i;
                //return the orginal function - this is a workaround to getJSON running after the loop is completed
                //i was not able to save the json data bacause I couldn't pass the *i* variable to the json function
                return function(data) {
                    //sanity check - only run if we actually get the json data else warn the user in infowindow
                    if (data) {
                        //update our foursquareVenueID observable with data from the foursqare data
                        self.locations()[ii].foursquareVenueID(data.response.venues[0].id);
                        //use foursquareVenueID observable to create a custom Foursqaure url to get likes
                        var statsUrl = 'https://api.foursquare.com/v2/venues/'+self.locations()[ii].foursquareVenueID()+'/likes?client_id=JYE41Y2DJLVJR1CTWDBP1ZUCZHXJNHDOHB1MAPLZYHC122MQ&client_secret=RNZPA0GEFVCMAJJEX5LJ0DFJHQ4LIKCHU15NN5OW33NMC2HP&v=20161106';
                        //get the json from this url and run a funtion
                        $.getJSON(statsUrl, (function() {
                            var iii = ii;
                            //again return the data function within another function as a workaround to *i* variable issue
                            return function(statsdata) {
                                //sanity check - only run if we actually get the json data else warn the user in infowindow
                                if (statsdata) {
                                    self.locations()[iii].foursquareLikes(statsdata.response.likes.count);
                                } else {
                                    infowindow.setContent('Unable to retreive Foursqaure data');
                                } 
                            };
                        })())
                        //if we cannot get the json data for likes warn the user in the infowindow
                        .fail(function() {
                            infowindow.setContent('Unable to retreive Foursqaure data');
                        });
                    } else {
                        infowindow.setContent('Unable to retreive Foursqaure data');
                    }
                };
            })())
            //if we cannot get the json data for vanue ids warn the user in the infowindow
            .fail(function() {
                infowindow.setContent('Unable to retreive Foursqaure data');
            });
        }
    };
    //run to populate Foursquare data 
    self.foursquare();

    //Filter the locations
    self.filteredLocations = ko.computed(function () {
        //Filter the list of locations based on search text
        return ko.utils.arrayFilter(self.locations(), function (data) {
            //return locations that do not meet the search criteria
            if (data.name().toLowerCase().indexOf(self.searchText().toLowerCase()) < 0) {
                //hide all markers 
                data.marker().setVisible(false);
            } else {
                //show the markers that match the search results
                data.marker().setVisible(true);
            }
            //return the filtered list to be shown on the location list
            return data.name().toLowerCase().indexOf(self.searchText().toLowerCase()) >= 0;
        });
    }); 

    //Clicking location name should show marker info window for that location
    self.showInfo = function(data) {
        //check if it is currently bouncing; if so, stop bouncing
        if (data.marker().getAnimation() !== null) {
            data.marker().setAnimation(null);
        //else, make the marker bounce and stop bouncing after 0.71 seconds
        } else {
            data.marker().setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout(function() {data.marker().setAnimation(null);}, 710);
        }
        if (infowindow.content != 'Unable to retreive Foursqaure data') {
            //open the info window and show the number of likes for this venue from Foursqare API
            infowindow.setContent(String('<h5>'+data.name()+'</h5>'+data.foursquareLikes())+ ' Foursquare Likes');
        }
        infowindow.open(map, data.marker());
    };

    //Hamburger menu toggle function for responsive menu
    this.newClass = ko.observable();
    this.newClass(false);
    this.changeClass = function() {
        //if menu icon is clicked when newClass is true then change to to false which will remove the css class from our menu div
        if (this.newClass()) {
            this.newClass(false);
        //else if menu icon is clicked when newClass is false then change to to true which will make the side menu visible
        } else {
            this.newClass(true);
        }
    };
}; //End of ViewModel

//Initiative Google Maps which runs automatically because of the Google Maps API callback
function initMap() {
    //Apply the bindings for our ViewModel
    ko.applyBindings(new viewModel());
};

function error() {
    alert('Unable to load Google Maps API, please come back later.');
};
