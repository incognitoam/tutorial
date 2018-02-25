'use strict';
var fs = require('fs');

 exports.get = function(event, context) {
   var contents = fs.readFileSync("public/index.html");
   context.succeed({
     statusCode: 400,
     body: contents.toString(),
     headers: {'Content-Type': 'text/html'}
   });
 };
