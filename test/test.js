/*global describe:false, it:false, before: false*/

'use strict';

var should = require( 'should' );
var casual = require( 'casual' );
var utils = require( '../lib/utils' );
var emitter = require( './resources/testEmitter' );

describe('Gennifer', function(){

  var io = require( 'socket.io' ).listen( 3000 );

  var template1 = function() {
    return {
      testProp1: 'testProp1-' + casual.name
    };
  };

  var template2 = function() {
    return {
      testProp2: 'testProp2-' + casual.name
    };
  };

  var gennifer = require( '../index' );

  it('registers a template', function(){
    gennifer.registerTemplate( 'tmpl1', template1 );
    var data = gennifer.generate( 'tmpl1' );
    data.should.have.property( 'testProp1' );
    var parts = data.testProp1.split( '-' );
    parts[ 0 ].should.equal( 'testProp1' );
    parts[ 1 ].should.be.ok;
  });

  it('works with an event emitter', function(){
    emitter.on('tmpl2', function(data){
      data.should.have.property( 'testProp2' );
      var parts = data.testProp2.split( '-' );
      parts[ 0 ].should.equal( 'testProp2' );
      parts[ 1 ].should.be.ok;
    });

    gennifer
      .registerTemplate( 'tmpl2', template2 )
      .usingChannel( emitter )
      .generate( 'tmpl2' );
  });

  it('works with socket.io', function(done){

    var socketClient = require('socket.io-client');
    var client = socketClient.connect( 'http://localhost:3000' );

    io.sockets.on('connection', function (socket) {
      gennifer
        .registerTemplate( 'tweet', template2 )
        .usingChannel( socket )
        .generate( 'tweet' );
    });

    client.on('tweet', function(data){
      data.should.have.property( 'testProp2' );
      var parts = data.testProp2.split( '-' );
      parts[ 0 ].should.equal( 'testProp2' );
      parts[ 1 ].should.be.ok;
      done();
    });
  });

  it('detects api props', function(done){
    var obj = {
      foo: {
        bar: 'bardata',
        another: 'moredatea',
        when: new Date(),
        someStuff: function() {},
        moreStuff: {
          foo: []
        }
      }
    };

    var expected = {
      foo: {
        bar: 'String',
        another: 'String',
        when: 'Date',
        someStuff: 'Function',
        moreStuff: {
          foo: 'Array'
        }
      }
    };

    var decoded = utils.decodeObject( obj );
    should( decoded ).eql( expected );
    done();
  });

});