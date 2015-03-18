
/*global describe:false, it:false, before: false*/

'use strict';

                  require( 'should' );
var fs          = require( 'fs' );
var path        = require( 'path' );
var casual      = require( 'casual' );
var cu          = require( '../lib/casualUtils' );
var log         = require( '../lib/logger' )().verbose();


describe('Configuring Gennifer', function(){

  var configObj = {};

  before(function(){
    cu.useInstance( casual );
  });

  it('Parses a simple type', function(done){
    var nameStr = 'name';
    var results = cu.parseCasualType( nameStr );
    results.should.be.instanceof( Object );
    results.should.have.property( 'type' );
    results.type.should.be.equal( nameStr );
    results.should.have.property( 'params' );
    results.params.should.be.instanceof( Array );
    results.params.length.should.be.equal( 0 );
    done();
  });

  it('Parses a complex type (1) param', function(done){
    var type = 'date';
    var param = 'YYYY-MM-DD';
    // forms "date%YYYY-MM-DD"
    var nameStr = type + '%' + param;
    var results = cu.parseCasualType( nameStr );

    results.should.be.instanceof( Object );
    results.should.have.property( 'type' );
    results.type.should.be.equal( type );
    results.should.have.property( 'params' );
    results.params.should.be.instanceof( Array );
    results.params.length.should.be.equal( 1 );
    results.params[ 0 ].should.be.equal( param );
    done();
  });

  it('Parses a complex type (2) params', function(done){
    var nameStr = 'integer%1,5';
    var results = cu.parseCasualType( nameStr );

    results.should.be.instanceof( Object );
    results.should.have.property( 'type' );
    results.type.should.be.equal( 'integer' );
    results.should.have.property( 'params' );
    results.params.should.be.instanceof( Array );
    results.params.length.should.be.equal( 2 );
    results.params[ 0 ].should.be.equal( 1 );
    results.params[ 1 ].should.be.equal( 5 );
    done();
  });

  it('loads config', function(done){
    var file    = path.resolve( './test/resources/gennifer.config' );
    var exists  = fs.existsSync( file );
    var config  = {};

    if ( exists ) {
      var tmp = fs.readFileSync( file ).toString();
      try {
        config = JSON.parse( tmp );
        config.should.have.property( 'templates' );
        var parsedTemplates = cu.parseConfig( config.templates );
        // log.debug( parsedTemplates );
        configObj = parsedTemplates;

      } catch( e ) {
        log.error( e );
      }
    }

    done();
  });

  it('creates templates from config', function(){
    // var i = configObj[ 'aTweet' ];
    // log.debug( cu.def( 'anotherThing', configObj[ 'anotherThing' ] ).gen('anotherThing') );
    // for ( var i in configObj ) {
    //   log.info(i)
    //   var template = configObj[ i ];
    //   var foo = cu.def( i, template ).gen( i );
    //   // log.debug( foo );
    // }
    // done();
  });


});
