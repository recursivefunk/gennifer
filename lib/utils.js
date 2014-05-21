
'use strict';

exports.printHelp = function() {
  console.log('\n');
  console.log( '    Gennifer Options' );
  console.log('\n');
  console.log( '    -f --frequency  [optional] How often (in milliseconds) to send new data - defaults to 1000ms' );
  console.log( '    -v --volume     [optional] How many data items to send at each tick/interval - defaults to 1' );
  console.log( '    -p --port       [optional] The port - defaults to 8080' );
  console.log('\n');
};