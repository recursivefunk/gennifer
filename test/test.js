/*global describe:false, it:false, before: false*/

'use strict';

var stream = require( 'stream' );
var should = require( 'should' );
var casual = require( 'casual' );
var engine = require( '../lib/engineUtils' ).useEngine( casual );
var fs     = require('fs');
var decoder = require( '../lib/objectDecoder' );
var emitter = require( './resources/testEmitter' );

describe('Gennifer', function(){
  var socketPort = 3000;
  var io = require( 'socket.io' ).listen( socketPort );

  var template1 = function() {
    return {
      testProp1: 'testProp1-' + engine.gen( 'name' ),
      foodata: casual.date( 'YYYY-MM-DD' )
    };
  };

  var template2 = function() {
    return {
      testProp2: 'testProp2-' + engine.gen( 'name' )
    };
  };

  var gennifer = require( '../lib/gennifer' )();

  it('registers a template', function(done) {
    gennifer
      .registerTemplate( 'tmpl1', template1 )
      .on('tmpl1', function(data){
        data.should.be.instanceOf( Array );
        data[ 0 ].should.have.property( 'testProp1' );
        var parts = data[ 0 ].testProp1.split( '-' );
        parts[ 0 ].should.equal( 'testProp1' );
        parts[ 1 ].should.be.ok;
        gennifer.removeAllListeners();
        done();
      })
      .generate( 'tmpl1' );
  });

  it('is a stream', function(done) {

    // duck type checks
    var streamFuncs = [ 'pipe', 'on', 'emit', 'once' ];

    streamFuncs.forEach(function( funcName ) {
      gennifer[ funcName ].should.be.instanceOf( Function );
    });

    gennifer
      .on('data', function( items ){
        var obj = JSON.parse( items );
        var data = obj.data;
        obj.should.be.instanceOf( Object );
        obj.should.have.property( 'template' );
        data.should.be.instanceOf( Array );
        gennifer.removeAllListeners();
        done();
      })
      .generate( 'tmpl1' )
      .pipe( process.stdout );
  });

  it('works with an event emitter', function(done){
    emitter.on('tmpl2', function(data){
      data[ 0 ].should.have.property( 'testProp2' );
      var parts = data[ 0 ].testProp2.split( '-' );
      parts[ 0 ].should.equal( 'testProp2' );
      parts[ 1 ].should.be.ok;
      emitter.removeAllListeners( 'tmpl2' );
      done();
    });

    gennifer
      .registerTemplate( 'tmpl2', template2 )
      .channel( emitter )
      .generate( 'tmpl2' );
  });

  it('works with socket.io', function(done){

    var socketClient = require('socket.io-client');
    var client = socketClient.connect( 'http://localhost:' + socketPort );

    io.sockets.on('connection', function (socket) {
      gennifer
        .registerTemplate( 'tweet', template2 )
        .channel( socket )
        .generate( 'tweet' );
    });

    client.on('tweet', function(tweets){
      var data = tweets[ 0 ];
      data.should.have.property( 'testProp2' );
      var parts = data.testProp2.split( '-' );
      parts[ 0 ].should.equal( 'testProp2' );
      parts[ 1 ].should.be.ok;
      done();
    });
  });

  it('changes data volume', function(done){
    gennifer
      .registerTemplate( 'tmpl1', template1 )
      .on('tmpl1', function( data ) {
        data.should.be.instanceOf( Array );
        data.length.should.equal( 2 );
        data[ 0 ].should.have.property( 'testProp1' );
        var parts = data[ 0 ].testProp1.split( '-' );
        parts[ 0 ].should.equal( 'testProp1' );
        parts[ 1 ].should.be.ok;
        gennifer.removeAllListeners();
        done();
      })
      .volume( 2 )
      .generate( 'tmpl1' );

  });

  it('loads templates from a js file', function(){
    gennifer.loadConfig( 'test/resources/templates.js' );
    var templates = gennifer.templates();
    templates.should.have.property( 'aTweet' );
  });

  // it('loads templates from a config file', function(){
  //   gennifer.loadConfig( 'test/resources/gennifer.config' );
  //   var templates = gennifer.templates();
  //   templates.should.have.property( 'aTweet' );
  // });


  it('detects api props', function(done){
    var obj = {
      foo: {
        bar: 'bardata',
        another: 'moredatea',
        when: new Date(),
        itWorks: true,
        created_at: 'Fri Oct 24 23:22:09 +0000 2008',
        someStuff: function() {},
        moreStuff: {
          foo: [ 'foo' , 'bar' ]
        }
      }
    };

    var expected = {
      foo: {
        bar: 'String',
        another: 'String',
        when: 'Date',
        itWorks: 'Boolean',
        created_at: 'Date',
        someStuff: 'Function',
        moreStuff: {
          foo: 'Array'
        }
      }
    };

    var decoded = gennifer.resolveTypes( obj, { created_at: 'Date' } );
    should( decoded ).eql( expected );
    done();
  });

});
