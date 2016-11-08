                  //Clicking location name should show marker info window for that location
                self.makerInfo = ko.observable();
                self.makerInfo(false);
                self.showInfo = function() {
                    var thisMarker = data.marker()
                    //if menu icon is clicked when newClass is true then change to to false which will remove the css class from our menu div
                    if (self.makerInfo()) {
                        self.makerInfo(false);
                    //else if menu icon is clicked when newClass is false then change to to true which will make the side menu visible
                    } else {
                        self.makerInfo(true);
                        self.infoWindow = function(thisMarker, i) {
                        //bounce the marker when clicked
                        return function() {
                            //check if it is currently bouncing; if so, stop bouncing
                            if (thisMarker.getAnimation() !== null) {
                                thisMarker.setAnimation(null);
                            //else, make the marker bounce and stop bouncing after 0.71 seconds
                            } else {
                                thisMarker.setAnimation(google.maps.Animation.BOUNCE);
                                window.setTimeout(function() {thisMarker.setAnimation(null);}, 710);
                            }
                            if (infowindow.content != 'Unable to retreive Foursqaure data') {
                                //open the info window and show the number of likes for this venue from Foursqare API
                                infowindow.setContent(String('<h5>'+data.name()+'</h5>'+data.foursquareLikes())+ ' Foursquare Likes');
                            }
                            infowindow.open(map, thisMarker);
                            };
                        };
                                        self.infoWindow();
                        console.log(self.makerInfo());
                    }
                };  
    
    
    
    
    
    

    data-bind="click: showInfo()"
    
    
    
    
    
    
    //Set Google Maps Options
    var infowindow = new google.maps.InfoWindow();
    var myLatlng = new google.maps.LatLng(37.4452275,-122.1602654);
    var mapOptions = {zoom: 16, center: myLatlng};
    var marker, i;

    //Filter the locations
    self.filteredLocations = ko.computed(function () {
        //if there is no searcText to filter the list
        if (!self.searchText()) {
            //create the map
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            //loop through all locations and add marker for each of them
            for (i = 0; i < self.locations().length; i++) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(self.locations()[i].lat(), self.locations()[i].lng()),
                    map: map,
                    animation: null
                });
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
                        
                        //open the info window and show the number of likes for this venue from Foursqare API
                        infowindow.setContent(String('<h5>'+self.locations()[i].name()+'</h5>'+self.locations()[i].foursquareLikes())+ ' Foursquare Likes');
                        infowindow.open(map, marker);
                    };
                })(marker, i));
            }
            return self.locations();
        //else if there is a searchText to filter the list
        } else {
            //Filter the list of locations
            return ko.utils.arrayFilter(self.locations(), function (data) {
                //return locations that start with the searchText
                if (data.name().toLowerCase().startsWith(self.searchText().toLowerCase()) === true) {
                    //draw the map
                    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
                    //add markers for filtered locations
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(data.lat(), data.lng()),
                        map: map,
                        animation: null
                    });
                    //add a click listener to each of the filtered markers
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

                            //open the info window and show the number of likes for this venue from Foursqare API
                            infowindow.setContent('<h5>'+data.name()+ '</h5>'+String(data.foursquareLikes())+ ' Foursquare Likes');
                            infowindow.open(map, marker);
                        };
                    })(marker, i));
                }
                //return the filtered list to be shown on the location list
                return data.name().toLowerCase().startsWith(self.searchText().toLowerCase());
            });
        }
    }); 