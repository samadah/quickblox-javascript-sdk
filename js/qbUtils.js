/*
 * QuickBlox JavaScript SDK
 *
 * Utilities
 *
 */

var config = require('./qbConfig');

var isBrowser = typeof window !== "undefined";
var unsupported = "This function isn't supported outside of the browser (...yet)";

if(!isBrowser){
  var fs = require('fs');
}


// The object for type MongoDB.Bson.ObjectId
// http://docs.mongodb.org/manual/reference/object-id/
var ObjectId = {
  machine: Math.floor(Math.random() * 16777216).toString(16),
  pid: Math.floor(Math.random() * 32767).toString(16),
  increment: 0
};

var Utils = {
  randomNonce: function() {
    return Math.floor(Math.random() * 10000);
  },

  unixTime: function() {
    return Math.floor(Date.now() / 1000);
  },

  getUrl: function(base, id) {
    var protocol = config.ssl ? 'https://' : 'http://';
    var resource = id ? '/' + id : '';
    return protocol + config.endpoints.api + '/' + base + resource + config.urls.type;
  },

  // Generating BSON ObjectId and converting it to a 24 character string representation
  // Changed from https://github.com/justaprogrammer/ObjectId.js/blob/master/src/main/javascript/Objectid.js
  getBsonObjectId: function() {
    var timestamp = this.unixTime().toString(16),
        increment = (ObjectId.increment++).toString(16);

    if (increment > 0xffffff) ObjectId.increment = 0;

    return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
           '000000'.substr(0, 6 - ObjectId.machine.length) + ObjectId.machine +
           '0000'.substr(0, 4 - ObjectId.pid.length) + ObjectId.pid +
           '000000'.substr(0, 6 - increment.length) + increment;
  },

  injectISOTimes: function(data) {
    if (data.created_at) {
      if (typeof data.created_at === 'number') data.iso_created_at = new Date(data.created_at * 1000).toISOString();
      if (typeof data.updated_at === 'number') data.iso_updated_at = new Date(data.updated_at * 1000).toISOString();
    }
    else if (data.items) {
      for (var i = 0, len = data.items.length; i < len; ++i) {
        if (typeof data.items[i].created_at === 'number') data.items[i].iso_created_at = new Date(data.items[i].created_at * 1000).toISOString();
        if (typeof data.items[i].updated_at === 'number') data.items[i].iso_updated_at = new Date(data.items[i].updated_at * 1000).toISOString();
      }
    }
    return data;
  },

  QBLog: function(title, data){
    data = JSON.stringify(data);
    
    if (typeof config.debug === 'object'){
      if(config.debug.mode == 1){
        console.log("%s: %s", title, data);
      }else if(config.debug.mode == 2){
        if(isBrowser){
          throw unsupported;
        }else{
          var toLog = title + ": " + data;
          fs.writeFile(config.debug.file == null ? "qb_js_sdk.log" : config.debug.file, toLog, function(err) {
              if(err) {
                return console.error("Error write to file: " + err);
              }
          });
        }
      }
    }
  }

};

module.exports = Utils;
