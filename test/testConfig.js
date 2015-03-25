
/*global describe:false, it:false, before: false*/

'use strict';

                  require( 'should' );
var fs          = require( 'fs' );
var path        = require( 'path' );
var casual      = require( 'casual' );
var engine      = require( '../lib/engineUtils' );
var log         = require( '../lib/logger' )().verbose();

describe('Configuring Gennifer', function(){

  var configObj = {};

  before(function(){
    engine.useEngine( casual );
  });

  it('Parses a simple type', function(){
    var nameStr = 'name';
    var results = engine.parseEngineType( nameStr );
    results.should.be.instanceof( Object );
    results.should.have.property( 'type' );
    results.type.should.be.equal( nameStr );
    results.should.have.property( 'params' );
    results.params.should.be.instanceof( Array );
    results.params.length.should.be.equal( 0 );
  });

  it('Parses a complex type (1) param', function(){
    var type = 'date';
    var param = 'YYYY-MM-DD';
    // forms "date%YYYY-MM-DD"
    var nameStr = type + '%' + param;
    var results = engine.parseEngineType( nameStr );

    results.should.be.instanceof( Object );
    results.should.have.property( 'type' );
    results.type.should.be.equal( type );
    results.should.have.property( 'params' );
    results.params.should.be.instanceof( Array );
    results.params.length.should.be.equal( 1 );
    results.params[ 0 ].should.be.equal( param );
  });

  it('Parses a complex type (2) params', function(){
    var nameStr = 'integer%1,5';
    var results = engine.parseEngineType( nameStr );

    results.should.be.instanceof( Object );
    results.should.have.property( 'type' );
    results.type.should.be.equal( 'integer' );
    results.should.have.property( 'params' );
    results.params.should.be.instanceof( Array );
    results.params.length.should.be.equal( 2 );
    results.params[ 0 ].should.be.equal( 1 );
    results.params[ 1 ].should.be.equal( 5 );
  });

  it('parses a config file', function(){
    var file    = path.resolve( './test/resources/gennifer.config' );
    var exists  = fs.existsSync( file );
    var config  = {};

    if ( exists ) {
      var tmp = fs.readFileSync( file ).toString();
      try {
        config = JSON.parse( tmp );
        config.should.have.property( 'templates' );
        var parsedTemplates = engine.parseConfig( config.templates );
        configObj = parsedTemplates;

      } catch( e ) {
        log.error( e );
      }
    }

  });

  it('creates templates from config', function(){

    // from the config file
    // "aTweet": {
    //     "created_at": "date%YYYY-MM-DD",
    //     "username": "name",
    //     "num": "integer%1,100"
    // }

    var aTweet = engine
      .def( 'aTweet', configObj[ 'aTweet' ] )
      .gen('aTweet');

    aTweet.should.have.property( 'created_at' );
    aTweet.should.have.property( 'username' );
    aTweet.should.have.property( 'num' );

  });


});
