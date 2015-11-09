

'use strict';

const test    = require( 'tape' );
const check   = require( 'check-types' );
const faker   = require( 'faker' );
const emitter = require( './resources/test-emitter' );

const getTemplates = () => {
  return {
    template1() {
      return {
        testProp1: 'testProp1-' + faker.name.firstName(),
        foodata: faker.date.recent()
      };
    },
    template2() {
      return {
        testProp2: 'testProp2-' + faker.name.firstName()
      };
    }
  };
};

const setupGennifer = () => {
  const gennifer  = require( '../lib/gennifer' )();
  const templates = getTemplates();
  gennifer.registerTemplate( 'tmpl1', templates.template1 );
  return gennifer;
};

const teardown = ( gennifer ) => {
  gennifer.removeAllListeners();
  gennifer = null;
};

test('registers a template', ( t ) => {
  const gennifer = setupGennifer();
  gennifer
    .on('tmpl1', ( data) => {
      t.equal( check.array( data ), true );
      t.ok( data[ 0 ].testProp1, 'Data has the test property' );
      const parts = data[ 0 ].testProp1.split( '-' );
      t.equal( parts[ 0 ], 'testProp1' );
      t.ok( parts[ 1 ] );
      teardown( gennifer );
      t.end();
    })
    .pipeGen( 'tmpl1' );
});

test('generates a data item', ( t ) => {
  t.plan( 1 );
  const gennifer  = setupGennifer();
  const obj       = gennifer.generate( 'tmpl1' );
  t.equal( check.array( obj ), true );
  teardown( gennifer );
});

test('is a stream', ( t ) => {
  const gennifer  = setupGennifer();
  // duck type checks
  const streamFuncs = [ 'pipe', 'on', 'emit', 'once' ];

  streamFuncs.forEach( ( funcName ) => {
    t.equal( check.function( gennifer[ funcName ] ), true );
  });

  gennifer
    .on('data', ( items ) => {
      t.end();
      const obj = JSON.parse( items );
      const data = obj.data;

      t.equal( check.object( obj ), true );
      t.ok( obj.template );
      t.equal( check.array( data ), true );
      teardown( gennifer );
    })
    .pipeGen( 'tmpl1' )
    .pipe( process.stdout );
});

test('works with an event emitter', ( t ) => {
  const gennifer  = setupGennifer();
  const templates = getTemplates();
  gennifer.on('tmpl2', ( data ) => {
    t.equal( check.array( data ), true );
    t.ok( data[ 0 ].testProp2 );
    const parts = data[ 0 ].testProp2.split( '-' );
    t.equal( parts[ 0 ], 'testProp2' );
    t.ok( parts[ 1 ] );
    t.end();
  });

  gennifer
    .registerTemplate( 'tmpl2', templates.template2 )
    .channel( emitter )
    .pipeGen( 'tmpl2' );
});


test('changes data volume', ( t ) => {
  const gennifer  = setupGennifer();
  const templates = getTemplates();
  gennifer
    .registerTemplate( 'tmpl1', templates.template1 )
    .on('tmpl1', ( data ) => {
      t.equal( check.array( data ), true );
      t.equal( data.length, 2 );
      t.ok( data[ 0 ].testProp1 );
      const parts = data[ 0 ].testProp1.split( '-' );
      t.equal( parts[ 0 ], 'testProp1' );
      t.ok( parts[ 1 ] );
      teardown( gennifer );
      t.end();
    })
    .volume( 2 )
    .pipeGen( 'tmpl1' );
});

test('loads templates from a js file', ( t ) => {
  t.plan( 1 );
  const gennifer = setupGennifer();
  gennifer.loadConfig( 'test/resources/templates.js' );
  const templates = gennifer.templates();
  t.ok( templates.aTweet );
});


test('detects api props', ( t ) => {
  const gennifer = setupGennifer();

  let obj = {
    foo: {
      bar: 'bardata',
      another: 'moredatea',
      when: new Date(),
      itWorks: true,
      created_at: 'Fri Oct 24 23:22:09 +0000 2008', // jshint ignore:line
      someStuff: function() {},
      moreStuff: {
        foo: [ 'foo' , 'bar' ]
      }
    }
  };

  let expected = {
    foo: {
      bar: 'String',
      another: 'String',
      when: 'Date',
      itWorks: 'Boolean',
      created_at: 'Date', // jshint ignore:line
      someStuff: 'Function',
      moreStuff: {
        foo: 'Array'
      }
    }
  };

  var decoded = gennifer.resolveTypes( obj, { created_at: 'Date' } ); // jshint ignore: line
  t.same( decoded, expected );
  t.end();
});


