#!/usr/bin/env node

var twitter = require('ntwitter'),
     querystring = require('querystring'),
     http = require('http'),
     net = require('net'),
     config = require('./config');

var twit = new twitter(config.twitterSettings);



var matchSidpiraya1 = /\s*give\s+\@sidpiraya\s+candy\s*/
    ,matchSidpiraya2 = /\s*\@sidpiraya\s+.*#?candy\s*/
    ,matchMacke1 =  /\s*give\s+\@_macke_\s+candy\s*/
    ,matchMacke2 = /\s*\@_macke_\s+.*#?candy\s*/
    ,matchHattrick = /.*thank[s]*\s+.*\@hattrick.*/
    ,stillAlive = /\s*\@slickstreamer\s+\d{10}\.0 alive message\s*/

var storeGiverHTTPHeader = {
    host: config.host,
    port: 80,
    path: '/givers',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

var storeGiver = function(tweet, system){
    var giver = { 'type':'stream','system':system, 'content':tweet };
	console.log(JSON.stringify(giver));
	var req = http.request(storeGiverHTTPHeader, function(res) {
		    res.setEncoding('utf8');
		    res.on('data', function (chunk) {
		        console.log("body: " + chunk);
		    });
		});

		req.write(JSON.stringify(giver));
		req.end();

};

var releaseCandy = function(){
	var client = net.connect({port: 50000},
    	function() { 
  			console.log('client connected');
  
		}).
		on('error', function (error) {
			    console.log("error connecting to tellnetserver");
	    		console.log(error);
	  	}).
		on("connection", function (socket) {
	 		socket.on("data", function (data) {
	    		console.log(data);
	  		});
	  		socket.on("end", function () {
	    
	  	});
	 
	});	
};

var doGive = function(tweet, system){
	storeGiver(tweet, system);
	releaseCandy();
	releaseCandy();
};

var sendAlliveMessageHTTPHeader = {
    host: config.host,
    port: 80,
    path: '/alive',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};



var sendAliveMessage = function(){
	var req = http.request(sendAlliveMessageHTTPHeader, function(res) {
		    res.setEncoding('utf8');
		    res.on('data', function (chunk) {
		        console.log("body: " + chunk);
		    });
		});

		req.write(config.token);
		req.end();
};


var giveCandy = function(tweet){
	if( matchSidpiraya1.test(tweet.text) || matchSidpiraya2.test(tweet.text)
		|| matchMacke1.test(tweet.text) || matchMacke2.test(tweet.text)){
		doGive(tweet,"giveawaycandy");
	}else if(matchHattrick.test(tweet.text)){
	    doGive(tweet, "hattrick");
	}else if(stillAlive.test(tweet.text)){
		sendAliveMessage();
	}
};



twit.stream('statuses/filter', {track:'@sidpiraya,@hattrick,@slickstreamer,@_macke_'}, function(stream) {
  stream.on('data', function (data) {
  	giveCandy(data);
    console.log(data);
  });
  stream.on('end', function (response) {
  	console.log('end');
    // Handle a disconnection
  });
  stream.on('destroy', function (response) {
  	console.log('destroy');
    // Handle a 'silent' disconnection from Twitter, no end/error event fired
  });
  // Disconnect stream after five seconds
  //setTimeout(stream.destroy, 5000);
});
/*
var test = { text: 'give @sidpiraya candy',
  created_at: 'Thu Aug 16 20:42:43 +0000 2012',
  id_str: '236201342606118912',
  coordinates: null,
  retweeted: false,
  retweet_count: 0,
  in_reply_to_status_id_str: null,
  entities: { user_mentions: [ [Object] ], hashtags: [], urls: [] },
  in_reply_to_status_id: null,
  place: null,
  in_reply_to_screen_name: null,
  source: 'web',
  in_reply_to_user_id_str: null,
  contributors: null,
  favorited: false,
  truncated: null,
  geo: null,
  user: 
   { is_translator: false,
     profile_background_image_url_https: 'https://si0.twimg.com/images/themes/theme9/bg.gif',
     created_at: 'Wed Dec 17 20:02:12 +0000 2008',
     profile_background_color: '1A1B1F',
     followers_count: 178,
     id_str: '18197961',
     show_all_inline_media: true,
     profile_background_tile: false,
     url: 'http://www.slickstreamer.info/',
     statuses_count: 1339,
     profile_sidebar_fill_color: '252429',
     default_profile_image: false,
     lang: 'en',
     verified: false,
     time_zone: 'Stockholm',
     description: 'Hacker, geek, software developer. \r\nhttp://www.everymote.com/',
     geo_enabled: true,
     favourites_count: 24,
     profile_sidebar_border_color: '181A1E',
     location: 'Malmö, Sweden',
     notifications: null,
     profile_image_url_https: 'https://si0.twimg.com/profile_images/1674912558/image_normal.jpg',
     following: null,
     profile_use_background_image: true,
     profile_image_url: 'http://a0.twimg.com/profile_images/1674912558/image_normal.jpg',
     friends_count: 236,
     profile_text_color: '666666',
     protected: false,
     listed_count: 12,
     profile_background_image_url: 'http://a0.twimg.com/images/themes/theme9/bg.gif',
     screen_name: '_macke_',
     name: 'Marcus Olsson',
     follow_request_sent: null,
     contributors_enabled: false,
     profile_link_color: '2FC2EF',
     id: 18197961,
     default_profile: false,
     utc_offset: 3600 },
  id: 236201342606118900,
  in_reply_to_user_id: null }

  giveCandy(test);

*/

process.on('uncaughtException', function(err){
	console.log('Something bad happened: ');
	console.log(err);
	process.exit(0);
});
