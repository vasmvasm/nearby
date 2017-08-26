var config = {
  'secrets' : {
    'clientId' : 'CLIENT_ID',
    'clientSecret' : 'CLIENT_SECRET',
    'redirectUrl' : 'http://localhost:3000/callback'
  }
}

var foursquare = require('node-foursquare')(config);
var request = require("request");
var qs = require('querystring');
var mongoose = require('mongoose');

var express = require("express");
var app = express();
var access_token;
var props = ["firstName","homeCity"];
var nodeSchema = mongoose.Schema({
	firstName:String,
	homeCity:String
	
});

var friend_model = mongoose.model('friends', nodeSchema);
var db = mongoose.connection;

db.once('open', function callback () {
var requestUrl = "https://api.foursquare.com/v2/users/self/friends?limit=100&offset=0&oauth_token="+access_token;
  makeRequest(requestUrl);
  
});


app.get('/login', function(req, res) {
  console.log("in login");
  res.writeHead(303, { 'location': foursquare.getAuthClientRedirectUrl() });
  res.end();
});


function makeRequest(requestUrl){
	request.get({url:requestUrl,json:true}, function (e, r, body) {
  	  var friends = body.response.friends.items;
  	  var friendArray = [];
  	  friends.forEach(function(friend) {
  		  	var friendObj={};
  		    props.forEach(function(prop){
  		    	friendObj[prop] = friend[prop];
  		    })
  		   var newObj = new friend_model(friendObj);
		   newObj.save(function(){
			   console.log("closing connection");
			   db.close();
		   });
  		});

    });
}


app.get('/callback', function (req, res) {
	console.log("in callback");
  foursquare.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if(error) {
      res.send('An error was thrown: ' + error.message);
    }
    else {
      console.log(accessToken);
      access_token = accessToken;
      console.log("opening connection");
      mongoose.connect('mongodb://localhost/foursq');
      
    }
    res.end();
  });
});

app.listen(3000);
