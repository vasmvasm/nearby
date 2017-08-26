var db = require('./dbAccess.js');
var express = require('express');
	var http = require('http');
var path = require('path');
var ejs = require('ejs');
var request = require("request");
var cookie = require('cookie');

var cookieParser = require('cookie-parser');
var faviconExpress = require("serve-favicon");
var sessionExpress = require("cookie-session");
var bodyParserExpress = require("body-parser");
  var loggerExpress = require("morgan");
  var flash = require('connect-flash');
var methodOverrideExpress = require("method-override");
var staticExpress = require("serve-static");
var app = express();


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html',ejs.renderFile);
app.set('view engine','html');
app.use(cookieParser());
app.use(sessionExpress({secret: '1234567890'}));

// app.use(faviconExpress());
app.use(loggerExpress('dev'));
app.use(bodyParserExpress());
app.use(methodOverrideExpress());
  app.use(flash());
// app.use(passport.initialize());
 // app.use(passport.session());
app.use(staticExpress(path.join(__dirname, 'public')));


app.get('/dealer-maps',function(req,res){

		res.render('loadMap');

		
});


app.get('/getDealers',function(req,res){
	db.getDealers(function(err,dealers){
		var responseArray = [];
		console.log(dealers);
		for(var ctr=0;ctr<dealers.length;ctr++){
			var response = {
				name:dealers[ctr],
				webId:dealers[ctr]
			}
			responseArray.push(response);
		}

		res.write(JSON.stringify(responseArray));
		res.end();
	});
})

app.get('/venue-visits/:webId',function(req,res){
	db.getDealerInfo(req.params.webId,function(err,dealer){
		var dealerVisits={
			lat:dealer.latitude,
			long:dealer.longitude
		}
		db.getVenueVisits(req.params.webId,function(err,visits){
			responseArray = [];

			for(var ctr=0;ctr<visits.length;ctr++){
				var response = {
					lat:visits[ctr].lat,
					long:visits[ctr].long,
					checkinsCount:visits[ctr].checkinsCount,
					name:visits[ctr].name
					
				}
				responseArray.push(response);
			}
			dealerVisits.visits= responseArray
			console.log(dealerVisits);
			res.write(JSON.stringify(dealerVisits));
			res.end();
		
		});
		
	})
	

})


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});