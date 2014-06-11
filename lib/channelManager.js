
'use strict';

var gennifer = require( './gennifer' );
var logger = require( 'luvely' );
var uuid = require( 'node-uuid' );

var ChannelManager = function( channel, opts ) {
  opts = opts || {};
  this._id = uuid.v1();
  this._channel = channel;
  this._dataInterval = null;
  this._volume = opts.volume;
  this._frequency = opts.frequency;
  this._channel.emit( 'configuration', opts );
  this._templates = {};
  this._subscriptions = {
    disconnect: []
  };
  return this;
};

ChannelManager.prototype = {

  onDisconnect: function( func ) {
    this._subscriptions.disconnect.push( func );
  },

  monitor: function() {
    var self = this;

    this._channel.on('configure', function(data){
      self._frequency = data.frequency || self._frequency;
      self._volume = data.volume || self._volume;
      logger.info( 'Client ' + self._id + ' requested reconfiguration: ', data );
      self.reset();
    });

    this._channel.on('disconnect', function(){
      logger.debug( 'Channel closed' );
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
    for ( var i in tmplObj ) {
      this._templates[ i ] = tmplObj[ i ];
      gennifer.registerTemplate( i, tmplObj[ i ] );
    }
    return this;
  },

  useTemplate: function( name, tmpl ) {
    var targetTmpl, tmplName;
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
      logger.info( 'Generating \'' + self._templateName + '\' template' );
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