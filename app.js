"use strict";

var http = require('http');

function init()
{	
        Homey.manager('speech-input').on('speech', function(speech)
        {
            http.get('http://catfacts-api.appspot.com/api/facts', function(res)
            {
                var body = '';
                
                res
                    .on('data', function(chunk)
                    {
                        body += chunk;
                    })
                    .on('end', function()
                    {
                        body = JSON.parse(body);
                        Homey.manager('speech-output').say( body.facts[0] );
                    });
                    
            }).on('error', function(e)
            {
                console.log("Got error: " + e.message);
                Homey.manager('speech-output').say( __('internet_error') );
            });
        });
}

module.exports.init = init;