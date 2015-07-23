### Deps
```
  npm install
```

### Usage & installation
#### As a module
```
  npm install gennifer --save
```
```javascript

  var gennifer = require( 'gennifer' )();
  var tweetTmpl = function() {
    return {
      user: '@recursivefunk',
      text: 'I am the one'
    };
  };

  gennifer.registerTemplate( 'tweet', tweetTmpl );

  // generate a data item
  var item = gennifer.generate( 'tweet' );

  // use a stream

  gennifer
    // optional
    .channel( anEventEmitter )
    // will return the genrated data and automatically emit the new data
    .pipeGen( 'tweet' );

```
#### Loading templates from a file
```javascript

  // in templates.js

  // casual is the preferred underlying data generator but you can generate
  // data with your templates in any manner you wish
  var casual = require('casual');

  module.exports = {
    aTemplate: function() {
      return {
        dateFoo: casual.date,
        aName: casual.name
      }
    }
  }

  // later...
  gennifer.loadTemplates( './templates.js' );
  var templates = gennifer.templates();
  console.log( templates );
  // { aTemplate: [Function] }

```


#### As a standalone-socket server
```
  [sudo] npm install -g gennifer
  genneifer [ -f 1000 -v 1 -p 8080 -t ]
```
Just type
```
  genneifer -h
```
For available options


### Streams
Gennifer is also a native nodejs stream.
```javascript
    gennifer
      .on('data', function( items ){
        // do something perhaps
      })
      .pipeGen( 'tmpl1' )
      .pipe( process.stdout );    
```

### Run Tests
You'll need to have redis running locally for all tests to pass
```
  npm test
```

### To Do
Check the issues section
