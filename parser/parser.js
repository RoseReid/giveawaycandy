#!/usr/bin/env node

var twitter = require('ntwitter'),
    //library to handle querystring
     querystring = require('querystring'),
     http = require('http'),
     //net is for tcp (tcp is a network protocol) Http uses tcp. Http a layer above tcp
     net = require('net'),
     //configs for the application- twitter accounts/logins/URL's etc'
     config = require('./config');

//ntweet lib to listen to twitterstream
var twit = new twitter(config.twitterSettings);


//Regular expressions (RegEx- what the tweets should contain)
var matchSidpiraya1 = /\s*give\s+\@sidpiraya\s+candy\s*/
    ,matchSidpiraya2 = /\s*\@sidpiraya\s+.*#?candy\s*/
    ,matchMacke1 =  /\s*give\s+\@_macke_\s+candy\s*/
    ,matchMacke2 = /\s*\@_macke_\s+.*#?candy\s*/
    ,matchHattrick = /.*thank[s]*\s+.*\@hattrick.*/
    ,stillAlive = /\s*\@slickstreamer\s+\d{10}\.0 alive message\s*/

//
var storeGiverHTTPHeader = {
    host: config.host,
    port: 80,
    path: '/givers',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};
//StoreGiver is the place to log who have given candy to an external server
var storeGiver = function(tweet, system){
    var giver = { 'type':'stream','system':system, 'content':tweet };
	console.log(JSON.stringify(giver));
    //setting up a plain http request 
    //Storegiverheader - what it should call. 
    //Callback is the response from the server after the request
	var req = http.request(storeGiverHTTPHeader, function(res) { //create req
        //utf8 encoding for text (how many bites each character is)
		    res.setEncoding('utf8');  //set up
            //listening on data- just console logging it.
		    res.on('data', function (chunk) {
		        console.log("body: " + chunk);
		    });
		});

		req.write(JSON.stringify(giver)); //formatting the data to json to send to server
		req.end();//Done with the call //when server receives then do the callback (res)

};

var releaseCandy = function(){
    //Setting up a TCP client on port 5000 
	var client = net.connect({port: 50000},
    	function() { 
  			console.log('client connected');
  
		}).
		on('error', function (error) {
			    console.log("error connecting to tellnetserver");
	    		console.log(error);
	  	}).
          //Logging the connection
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
	releaseCandy();//Call to release the Candy
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
    //if the tweet is containing any of the text in the regEx 
	if( matchSidpiraya1.test(tweet.text) || matchSidpiraya2.test(tweet.text)
		|| matchMacke1.test(tweet.text) || matchMacke2.test(tweet.text)){
            //send tweet data
		doGive(tweet,"giveawaycandy");
        //If hattrick is one that is mentioned
	}else if(matchHattrick.test(tweet.text)){
	    doGive(tweet, "hattrick");
        //Sending a heartbeat to see if everything is rnnning as it should
	}else if(stillAlive.test(tweet.text)){
		sendAliveMessage();
	}
};
//Go to DoGive*****

//setting up what to listen to and track on twitter
//track mentin of specific users
twit.stream('statuses/filter', {track:'@sidpiraya,@hattrick,@slickstreamer,@_macke_'}, function(stream) {
  //Will be called when we get any of the above mentions in the twitter stream
  stream.on('data', function (data) {
      //give candy function
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
//exception handler
process.on('uncaughtException', function(err){
	console.log('Something bad happened: ');
	console.log(err);
	process.exit(0);
});
