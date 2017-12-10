"use strict";

const https = require('https');
const Homey = require('homey');
const Log = require('homey-log').Log;

class App extends Homey.App {
    async onInit() {
        this.log(`${Homey.app.manifest.id} is running...`);

        this._initFlow();
        this._initSpeech();
    }

    _initFlow() {
        new Homey.FlowCardAction('tell_random_cat_fact')
            .register()
            .registerRunListener(async args => {
                return this.getRandomCatFact();
            });
    }

    _initSpeech() {
        Homey.ManagerSpeechInput.on('speechEval', (speech, callback) => {
            let match = speech.matches;
            callback(null, match);
        });

        Homey.ManagerSpeechInput.on('speechMatch', (speech, onSpeechEvalData) => {
            this.getRandomCatFact(speech);
        });
    }

    getRandomCatFact(speech) {
        speech = speech || Homey.ManagerSpeechOutput;

        https.get('https://catfact.ninja/fact', (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                body = JSON.parse(body);

                const language = Homey.ManagerI18n.getLanguage();

                if (language === "nl") {
                    this.translateResponse(speech, body.fact);
                } else {
                    speech.say(body.fact);
                }
            });
        }).on('error', (e) => {
            this.log(`Got error: ${e.message}`);
            speech.say('No internet connection');
        });
    }

    translateResponse(speech, fact) {
        const api_key = "trnsl.1.1.20171210T115658Z.8ed4d27cadc8e1ca.8f0ad4b27b3c8b5b19a12e6420a2a0e18a81ccb0";
        const encoded_fact = encodeURI(fact);
        https.get(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${api_key}&text=${encoded_fact}&lang=nl`, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                body = JSON.parse(body);
                const text = body.text && body.text[0];
                speech.say(text);
            });
        }).on('error', (e) => {
            this.log(`Got error: ${e.message}`);
            speech.say('Something went wrong while translating');
        });
    }
}

module.exports = App;