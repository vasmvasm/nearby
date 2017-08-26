var request = require("request");
var qs = require('querystring');
var mongoose = require('mongoose');

var events = require('events');


var emitter = new events.EventEmitter();




var conn2 = mongoose.createConnection('mongodb://localhost/foursq');

var conn1 = mongoose.createConnection('mongodb://localhost/foursq');
conn1.once('open', function callback () {
  makeRequest(0,100000);
  makeRequest(100000,100000);
  makeRequest(200000,100000);
  makeRequest(300000,100000);
  makeRequest(400000,100000);
});







var venueSchema = new mongoose.Schema({
	venueId:String,
	lat:Number,
	long:Number,
	distance:Number,
	name:String,
	checkinsCount:Number,
	usersCount:Number,
	hereNow:Number,
	reasonName:String,
	webId:String,
	hour:Number,
	date:Number
});
var venue_model = conn1.model('venue', venueSchema);



var visitSchema = new mongoose.Schema({
	venueId:String,
	lat:Number,
	long:Number,
	name:String,
	webId:String,
	checkinsCount:Number,
	distance:Number,
	startDate:Number,
	endDate:Number
});
var visit_model = conn2.model('visits11', visitSchema);









emitter.on('saverec',function(rec){
	console.log(rec.venueId);
	var newObj = new visit_model(rec);
	newObj.save();
})


var doneIds = [];
var dates = [3,11];




function searchVenue(allvenues,init){
	var currentCount = -1;
	var prevCount = -1;
	var venuediff = {
			venueId:allvenues[init].venueId,
			lat:allvenues[init].lat,
			long:allvenues[init].long,
			distance:allvenues[init].distance,
			name:allvenues[init].name,
			webId:allvenues[init].webId,
			startDate:dates[0],
			endDate:dates[1]
	};
	
	var totalVenues = allvenues.length;
	for(var ctr=init;ctr<totalVenues; ctr++){
		if(prevCount>-1 && currentCount > -1){
			var checkinsCount =  currentCount - prevCount;
			console.log(ctr);
			if(checkinsCount>0){
				venuediff.checkinsCount = checkinsCount;
				emitter.emit('saverec',venuediff);
				return ctr;
			}
		}
		if(venuediff.webId != allvenues[ctr].webId || venuediff.venueId != allvenues[ctr].venueId){
			return ctr;
		}
		if(allvenues[ctr].date==dates[0]){
			prevCount = allvenues[ctr].checkinsCount;
		}else if(allvenues[ctr].date==dates[1]){
			currentCount = allvenues[ctr].checkinsCount;
		}
	}
}

function makeRequest(skip,limit){
	venue_model.find({date:{$in:dates}},{},{skip:skip,limit:limit,sort:{webId:1,venueId:1}},function(err,allvenues){
		console.log(allvenues.length);
		var totalVenues = allvenues.length;
		var init=0;
		while(init<totalVenues){
			var init = searchVenue(allvenues,init);


		// 	var oldcheckin = venues.checkinsCount;
		// 	venue_model.find({venueId:venues.venueId,hour:23,webId:venues.webId},function(err,dealerVenue){
		// 		if(dealerVenue.length>0){
		// 			var checkinDiff = oldcheckin-dealerVenue[0].checkinsCount;
		// 			if(checkinDiff>0){
		// 				var venuediff = {
		// 					venueId:dealerVenue[0].venueId,
		// 					lat:dealerVenue[0].lat,
		// 					long:dealerVenue[0].long,
		// 					distance:dealerVenue[0].distance,
		// 					name:dealerVenue[0].name,
		// 					webId:dealerVenue[0].webId,
		// 					checkinsCount:checkinDiff
		// 				};
		//
		// 				emitter.emit('saverec',venuediff);
		// 			}
		// 		}
		// 	})
		}
	})
}




