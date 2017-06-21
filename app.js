"use strict";

var https = require('https');

module.exports.init = function() {
    Homey.manager('speech-input').on('speech', function(speech, callback) {
        getRandomCatFact(speech);
    });
}

Homey.manager('flow').on('action.tell_random_cat_fact', function( callback, args ) {
    getRandomCatFact();
    callback( null, true );
});

function getRandomCatFact(speech) {
    speech = speech || Homey.manager('speech-output');
    https.get('https://catfact.ninja/fact', function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        }).on('end', function() {
            body = JSON.parse(body);
            speech.say( body.fact );
        });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        speech.say('No internet connection');
    });
}
