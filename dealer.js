

var request = require("request");
var qs = require('querystring');
var mongoose = require('mongoose');

var db = mongoose.connection;


var venueSchema = mongoose.Schema({
	venueId:String,
	loc:Object,
	name:String,
	checkinsCount:Number,
	usersCount:Number,
	hereNow:Number,
	min:Number,
	hour:Number,
	date:Number,
	city:String
});
var venue_model = mongoose.model('atm', venueSchema);



var nextRequestUrl = "https://api.foursquare.com/v2/venues/search?" +
	"radius=100000" +
	"&categoryId=52f2ab2ebcbc57f1066b8b56" +
	"&limit=50" +
	"&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=20161118";



db.once('open', function callback () {

var requestUrl = "https://api.foursquare.com/v2/venues/search?" +
	"radius=100000" +
	"&categoryId=52f2ab2ebcbc57f1066b8b56" +
	"&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=20161118" +
	"&limit=50";
	var cityArray = ['Pune','Mumbai','Bangalore','Delhi','Chennai','Kolkata','Hyderabad'];
	for(var cnt=0;cnt<cityArray.length;cnt++){
		makeRequest(requestUrl+"&near="+cityArray[cnt],cityArray[cnt]);
	}

  
});

mongoose.connect('mongodb://localhost/foursq');


var currDate = new Date();



function makeRequest(requestUrl,city){

			console.log(requestUrl)
            request.get({url:requestUrl,json:true}, function (e, r, body) {
				var geocode = body.response.geocode;
				if(geocode!=undefined) {
					var neUrl = nextRequestUrl + "&ll=" + geocode.feature.geometry.bounds.ne.lat + "," + geocode.feature.geometry.bounds.ne.lng
					makeRequest(neUrl,city)

					var swUrl = nextRequestUrl + "&ll=" + geocode.feature.geometry.bounds.sw.lat + "," + geocode.feature.geometry.bounds.sw.lng;
					makeRequest(swUrl,city)
				}
                var venuesArray = body.response.venues;
				for(var ctr=0;ctr<venuesArray.length;ctr++){
					var venue = venuesArray[ctr];
					(function(venueVo){
						venue_model.find({venueId:venueVo.id, hour:currDate.getHours(), date: currDate.getDate()},function(err,venues){
							if(venues.length>0){
								return;
							}
							var venueObj={
								venueId:venueVo.id,
								loc:{
									type: "Point",
									coordinates: [ venueVo.location.lat, venueVo.location.lng ]
								},
								name:venueVo.name,
								checkinsCount:venueVo.stats.checkinsCount,
								usersCount:venueVo.stats.usersCount,
								hereNow:venueVo.hereNow.count,
								min:new Date().getMinutes(),
								hour:new Date().getHours(),
								date:new Date().getDate(),
								city:city
							};

							var newObj = new venue_model(venueObj);
							newObj.save();

						});
					})(venue);
				};
		    });
}


setTimeout(function(){
	db.close();
},120000)
