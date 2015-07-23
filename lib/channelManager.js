
'use strict';

var gennifer  = require( './gennifer' )();
var log       = require( 'luvely' );
var uuid      = require( 'node-uuid' );
var utils     = require( './utils' );

var ChannelManager = function( channel, opts ) {
  opts                = opts || {};
  this._id            = uuid.v1();
  this._socketId      = opts.socketId;
  this._channel       = channel;
  this._dataInterval  = null;
  this._volume        = opts.volume;
  this._frequency     = opts.frequency;
  this._templates     = {};
  this._subscriptions = {
    disconnect: []
  };

  this._channel.emit( 'configuration', opts );

  return this;
};

ChannelManager.prototype = {

  onDisconnect: function( func ) {
    this._subscriptions.disconnect.push( func );
  },

  monitor: function() {
    var self = this;

    // the client sent a new configuration request, we reset volume and
    // frequency
    this._channel.on('configure', function(data) {
      self._frequency = data.frequency || self._frequency;
      self._volume = data.volume || self._volume;
      log.info( 'Client ' +
                    self._id + ' requested reconfiguration: ', data );
      self.reset();
    });

    this._channel.on('disconnect', function(){
      log.debug( 'Channel %s closed', self._socketId );
      clearInterval( self._dataInterval );
      var listeners = self._subscriptions.disconnect;
      self._fire( listeners );
    });

    this.reset();
    return this;
  },

  id: function() {
    return this._id;
  },

  registerTemplates: function( tmplObj ) {
    var self = this;
    utils.eachItem( tmplObj, function( item, key ) {
      self._templates[ key ] = item;
      gennifer.registerTemplate( key, item );
    });

    return this;
  },

  useTemplate: function( name, tmpl ) {
    if ( tmpl ) {
      gennifer.registerTemplate( name, tmpl );
    }
    this._templateName = name;
    return this;
  },

  reset: function() {
    var self = this;
    if ( this._dataInterval ) {
      clearInterval( self._dataInterval );
    }

    var onInterval = function() {
      log.info( 'Generating \'' + self._templateName + '\' template' );
      gennifer
        .volume( self._volume )
        .channel( self._channel )
        .generate( self._templateName );
    };
    this._dataInterval = setInterval( onInterval, self._frequency );
    return this;
  },

  _fire: function( listeners ) {
    for ( var i = 0; i < listeners.length; i++ ) {
      listeners[ i ]();
    }
  }

};

module.exports = ChannelManager;
