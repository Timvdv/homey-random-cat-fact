"use strict";

var https = require('https');

module.exports.init = function() {
    Homey.manager('speech-input').on('speech', function(speech, callback) {
        getRandomCatFact();
    });
}

Homey.manager('flow').on('action.tell_random_cat_fact', function( callback, args ) {
    getRandomCatFact();
    callback( null, true );
});

function getRandomCatFact() {
    https.get('https://catfact.ninja/fact', function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        }).on('end', function() {
            body = JSON.parse(body);
            Homey.manager('speech-output').say( body.fact );
        });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        Homey.manager('speech-output').say('No internet connection');
    });
}