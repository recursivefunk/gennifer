/*global describe:false, it:false*/

'use strict';

var should = require( 'should' );
var casual = require( 'casual' );

describe('Gennifer', function(){

  var template1 = function() {
    return {
      testProp1: 'testProp1-' + casual.name
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

});