
'use strict';

var gennifer = require( './gennifer' );
var logger = require( 'luvely' );

var SocketManager = function( socket, opts ) {
  opts = opts || {};
  this._socket = socket;
  this._dataInterval = null;
  this._volume = opts.volume;
  this._frequency = opts.frequency;
  this._socket.emit( 'configuration', opts );
  return this;
};

SocketManager.prototype = {

  run: function() {
    var self = this;

    this._socket.on('configure', function(data){
      self._frequency = data.frequency || self._frequency;
      self._volume = data.volume || self._volume;
      logger.info( 'Client ' + self._socket.id + ' requested reconfiguration: ', data );
      self.reset();
    });

    this._socket.on('disconnect', function(){
      clearInterval( self._dataInterval );
    });

    this.reset();
  },

  setTemplate: function( name, tmpl ) {
    this._template = tmpl;
    this._templateName = name;
    gennifer.registerTemplate( name, tmpl );
    return this;
  },

  reset: function() {
    var self = this;
    if ( this._dataInterval ) {
      clearInterval( self._dataInterval );
    }
    this._dataInterval = setInterval(function(){
      gennifer
        .volume( self._volume )
        .usingChannel( self._socket )
        .generate( self._templateName );
    }, self._frequency);
    return this;
  }

};

module.exports = SocketManager;