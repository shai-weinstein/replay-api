var kaltura = require('./kaltura'),
    Promise = require('bluebird');

module.exports = {

    initialize: initialize,

    getVideo: function(id) {
        return new Promise(function(resolve, reject) {
            sails.KalturaClient.media.get(function(result) {
                if (result.code) {
                    console.log(result);
                    reject(new Error(result.message));
                } else {
                    resolve(result);
                }
            }, id);
        });
    },

    addVideo: function(path) {
        return new Promise(function(resolve, reject) {
            // add media entry and then add the actual video content to media entry
            addMediaEntry()
                .then(function(mediaEntry) {
                    return addContentToMedia(mediaEntry.id, path);
                })
                .catch(function(err) {
                    if (err) {
                        reject(err);
                    }
                });
        });
    }
}

function addContentToMedia(entryId, path) {
    var kalturaResource = new kaltura.vo.KalturaServerFileResource();    
    kalturaResource.localFilePath = path;

    return new Promise(function(resolve, reject) {
        sails.KalturaClient.media.addContent(kalturaResultCallback(resolve, reject), entryId, kalturaResource);
    });
}

function addMediaEntry() {

    var kalturaMediaEntry = new kaltura.vo.KalturaMediaEntry();
    kalturaMediaEntry.mediaType = kaltura.kc.enums.KalturaMediaType.VIDEO;

    return new Promise(function(resolve, reject) {
        sails.KalturaClient.media.add(kalturaResultCallback(resolve, reject), kalturaMediaEntry);
    });
}

function initialize() {

    // store client in global variable for later use
    sails.KalturaClient = createKalturaClient();

    // create session and store in global variable
    createSession(function(result) {

        // if code is set there was an error
        if (result.code) return console.log(result);

        console.log('Got a kaltura session: ', result);
        sails.kalturaSession = result;
        sails.KalturaClient.setSessionId(sails.kalturaSession);
    });
}

// create an admin session with kaltura
// session is returned to callback, which expects 1 result argument
function createSession(callback) {
    var partner_id = sails.config.settings.services.kaltura.partner_id,
        secret = sails.config.settings.services.kaltura.secret;

    // admin session
    var type = kaltura.kc.enums.KalturaSessionType.ADMIN;
    // 1 year session
    var expiry = 31622400;
    // ignored when admin
    var privileges = null;
    var ks = sails.KalturaClient.session.start(callback, secret, '', type, partner_id, expiry, privileges);
}

function createKalturaClient() {
    var partner_id = sails.config.settings.services.kaltura.partner_id,
        url = sails.config.settings.services.kaltura.url;

    // init kaltura configuration
    var kaltura_conf = new kaltura.kc.KalturaConfiguration(partner_id);

    kaltura_conf.serviceUrl = url;

    console.log(kaltura_conf);

    // init kaltura client
    var client = new kaltura.kc.KalturaClient(kaltura_conf);

    return client;
}

var kalturaResultCallback = function(resolve, reject) {
	return function(result){
		console.trace("Recieved a result: ", result);
	    if (result.code) {
	    	reject(new Error(result.message));
	    }
	    else{
	    	resolve(result);
	    }
	};
}