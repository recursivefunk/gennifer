
'use strict';

const fs      = require( 'fs' );
const path    = require( 'path' );
const stream  = require( 'stream' );
const faker   = require( 'faker' );
const decoder = require( './objectDecoder' );
const engine  = require( './engineUtils' ).useEngine( faker );
const log     = require( './logger' )();
const utils   = require( './utils' );

module.exports = () => {

  let _templates  = {};
  let _volume     = 1;
  let _config     = {};
  let _channel    = null;

  const _proto = {

    registerTemplate( templateName, tmpl ) {
      _templates[ templateName ] = tmpl;
      engine.def( templateName, tmpl );
      return this;
    },

    pipeGen( templateName ) {
      let tmp = [];

      utils.nTimes( _volume, () => {
        let data =  engine.gen( templateName );
        tmp.push( data );
      });

      // emit a generic event for every new instance of a
      // template over our native stream
      this.emit( 'data',
        JSON.stringify( { template: templateName, data: tmp } )
      );

      // emit a specific event for this template over our native stream
      this.emit( templateName, tmp );

      // emit data over a foreign channel
      if ( _channel ) {
        _channel.emit( templateName, tmp );
      }

      return this;
    },

    generate( templateName ) {
      let tmp = [];

      utils.nTimes( _volume, () => {
        tmp.push(
          engine.gen( templateName )
        );
      });

      return tmp;
    },

    volume( vol ) {
      if ( typeof vol === 'number' ) {
        _volume = vol;
        return this;
      } else {
        return _volume;
      }
    },

    loadConfig( pathToConfig ) {
      const self    = this;
      const file    = path.resolve( pathToConfig );
      const exists  = fs.existsSync( file );
      let   templates;
      let   tmp;

      if ( exists ) {
        if ( utils.endsWith( file, '.js' ) ) {
          templates = require( file )( faker );
        } else {
          tmp = fs.readFileSync( file ).toString();
          try {
            _config = JSON.parse( tmp );
            templates = engine.parseConfig( _config.templates );
          } catch( e ) {
            log.error( e );
          }
        }

        utils.forIn( templates, ( i ) => {
          self.registerTemplate( i, templates[ i ] );
        });

      }
    },

    channel( foreignChannel ) {
      if ( foreignChannel ) {
        _channel = foreignChannel;
        return this;
      } else {
        return _channel;
      }
    },

    resolveTypes( obj, overrides ) {
      overrides = overrides || {};
      return decoder.override( overrides ).decodeObject( obj );
    },

    templates() {
      return _templates;
    }

  };

  return utils.extend( stream, _proto );

};
