/*global describe:false, it:false*/

'use strict';

var should = require( 'should' );
var casual = require( 'casual' );
var emitter = require( './testEmitter' );

describe('Gennifer', function(){

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

});