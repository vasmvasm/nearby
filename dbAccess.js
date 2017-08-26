var mongoose = require('mongoose');

var conn = mongoose.createConnection('mongodb://localhost/foursq');

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
var visit_model = conn.model('visits11', visitSchema);


var dealerSchema = new mongoose.Schema({
	dealerName:String,
	latitude:String,
	longitude:String,
	webId:String
});

var dealer_model = conn.model('dealers', dealerSchema);



module.exports = {

	getVenueVisits: function (webId,callback){
		visit_model.find({webId:webId},callback);
	},
	
	getDealers: function (callback){
		visit_model.find().distinct('webId',callback);
	},
	
	getDealerInfo: function (webId,callback){
		dealer_model.findOne({webId:webId},callback);
	}
}