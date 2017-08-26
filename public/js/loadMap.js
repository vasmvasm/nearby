function drawMap(){
	

  $.ajax({
	  url:'/getDealers',
  	  type:'GET'	
  })
    .done(function(data, textStatus, jqXHR){
    	 var dealers = eval('('+data+')');	
		 var dealerSelect = document.getElementById("dealerSelect");
		 var options = [];
		 for(var ctr=0;ctr<dealers.length;ctr++){
			 options.push('<option value='+dealers[ctr].webId+'>'+dealers[ctr].name+'</option>');
		 }
		 dealerSelect.innerHTML = options.join(' ');
		 getVenues();
    })

}


function getVenues(){
  
	var x = document.getElementById("dealerSelect").selectedIndex;
	var y = document.getElementById("dealerSelect").options;
	console.log(y[x].value);
  $.ajax({
	  url:'/venue-visits/'+y[x].value,
  	  type:'GET'	
  })
    .done(function(data, textStatus, jqXHR){
	   var dealerInfo = eval('('+data+')');
		var myLatlng = new google.maps.LatLng(dealerInfo.lat, dealerInfo.long);
       var mapOptions = {
            center: myLatlng,
   			zoom: 12
       };
       var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);



	   	  var marker = new google.maps.Marker({
   	      position: myLatlng,
   	      map: map
   	  });
	  
	  var infowindow = new google.maps.InfoWindow({
	       content: y[x].value
	   });
	   
	   infowindow.open(map,marker);
	   
	  visistsObj = dealerInfo.visits;
 	  for(var ctr=0;ctr<visistsObj.length;ctr++){
 	 	 var venueLatlng = new google.maps.LatLng(visistsObj[ctr].lat,visistsObj[ctr].long);
 	 	 var venueArray = [];

		 var venueMarker
 	 	 for(var cnt=0;cnt<visistsObj[ctr].checkinsCount;cnt++){

			 venueMarker = new google.maps.Marker({
 	 	   	      position: venueLatlng,
 	 	   	      map: map
 	 	   	  })

 	 		  venueArray.push(venueMarker);
			  

 	 	 }

   	   
 		 var cluster = new MarkerClusterer(map, venueArray, {minimumClusterSize: 1, zoomOnClick: false, styles: [{url:"images/mapmarkers/green_puck.png", width: 55, height: 55, textSize: 13}]});
		 

 	  }
  });
}