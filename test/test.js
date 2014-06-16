/*global describe:false, it:false, before: false*/

'use strict';

var should = require( 'should' );
var casual = require( 'casual' );
var decoder = require( '../lib/objectDecoder' );
var emitter = require( './resources/testEmitter' );
var Remitter = require( 'remitter' );

describe('Gennifer', function(){
  var socketPort = 3000;
  var io = require( 'socket.io' ).listen( socketPort );

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

  var gennifer = require( '../lib/gennifer' );
  gennifer.registerTemplate( gennifer );

  it('registers a template', function(){
    gennifer.registerTemplate( 'tmpl1', template1 );
    var data = gennifer.generate( 'tmpl1' );
    data.should.be.instanceOf( Array );
    data[ 0 ].should.have.property( 'testProp1' );
    var parts = data[ 0 ].testProp1.split( '-' );
    parts[ 0 ].should.equal( 'testProp1' );
    parts[ 1 ].should.be.ok;
  });

  it('buffers stream results', function(done){
    var numWrites = 2;
    gennifer.stream( 'tmpl1' );
    gennifer
      .writeStream( 'tmpl1', numWrites )
      .dumpStream( 'tmpl1', function(writes){
        writes.length.should.equal( numWrites );
        done();
      });
  });

  it('works with streams', function(done){
    var stream = gennifer.stream( 'tmpl1' );
    stream.pull(function(err, items){
      should.not.exist( err );
      items.should.be.instanceOf( Array );
      var data = items[ 0 ];
      data.should.have.property( 'testProp1' );
      done();
    });
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

  it('maps data', function(done){
    emitter.on('tmpl2', function(data){
      data[ 0 ].should.have.property( 'testProp2' );
      data[ 0 ].should.have.property( 'foo' );
      data[ 0 ].foo.should.equal( 'bar' );
      var parts = data[ 0 ].testProp2.split( '-' );
      parts[ 0 ].should.equal( 'testProp2' );
      parts[ 1 ].should.be.ok;
      emitter.removeAllListeners( 'tmpl2' );
      gennifer.removeMap();
      done();
    });

    gennifer
      .map(function(item){
        item.foo = 'bar';
        return item;
      })
      .channel( emitter )
      .generate( 'tmpl2' );
  });

  it('filters data', function(done){
    emitter.on('tmpl2', function(data){
      data.length.should.equal( 0 );
      gennifer.removeFilter();
      done();
    });

    gennifer
      .filter(function(item){
        ( item.testProp2 === 'blah' );
      })
      .channel( emitter )
      .generate( 'tmpl2' );
  });

  it('works with socket.io', function(done){

    var socketClient = require('socket.io-client');
    var client = socketClient.connect( 'http://localhost:socketPort' );

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

  it('works with redis', function(done){
    var redisChannel = new Remitter();

    function onConnect() {
      redisChannel.on('tweet', function(tweets){
        var data = tweets[ 0 ];
        data.should.have.property( 'testProp2' );
        var parts = data.testProp2.split( '-' );
        parts[ 0 ].should.equal( 'testProp2' );
        parts[ 1 ].should.be.ok;
        done();
      });

      gennifer
        .registerTemplate( 'tweet', template2 )
        .channel( redisChannel )
        .generate( 'tweet' );
    }

    redisChannel.connect( onConnect );
  });

  it('changes data volume', function(){
    gennifer.registerTemplate( 'tmpl1', template1 );
    var data =
      gennifer
        .volume( 2 )
        .generate( 'tmpl1' );

    data.should.be.instanceOf( Array );
    data.length.should.equal( 2 );
    data[ 0 ].should.have.property( 'testProp1' );
    var parts = data[ 0 ].testProp1.split( '-' );
    parts[ 0 ].should.equal( 'testProp1' );
    parts[ 1 ].should.be.ok;
  });

  it('loads templates from a js file', function(){
    gennifer.loadTemplates( 'test/resources/templates.js' );
    var templates = gennifer.templates();
    templates.should.have.property( 'aTweet' );
  });


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