'use strict';
var fs = require('fs');

 exports.get = function(event, context) {
   var contents = fs.readFileSync("public/index.html");
   context.succeed({
     statusCode: 200,
     body: contents.toString(),
     headers: {'Content-Type': 'text/html'}
   });
 };

 'use strict';

 console.log('Loading function');

 const doc = require('dynamodb-doc');

 const dynamo = new doc.DynamoDB();


 // Handler entry point
 exports.handler = function(event, context, callback) {
 	console.log('Received event:', JSON.stringify(event, null, 2));

     // standard response
     const done = (err, res) => callback(null, {
         statusCode: err ? '400' : '200',
         body: err ? err.message : JSON.stringify(res),
         headers: {
             'Content-Type': 'application/json',
         },
     });

 	var result = processRequest (event, context);

 	done(null, JSON.stringify(result));
 };
  
 function processRequest (event, context) {
     var result = "Unknown request";
     switch (event.httpMethod) {
         case 'DELETE':
             result = "DELETE unsupported";
             break;
         case 'GET':
             result = "GET unsupported";
             break;
         case 'POST':
             result = "POST unsupported";
             break;
         case 'PUT':
             result = "PUT unsupported";
             break;
         default:
             result = "Unknown request";
     }
     return result;
 };

 function functionProcessPOST( body )
 {
     	// MyLambdaFunction logic here
 	
 	var table = "tutorialTicTacToeGames";
     
     var params = {
         TableName:table,
         Item:{
                 "game_id" : 1, 
                 "user1" : 1, 
                 "user2" : 2
             }
         };

 };

 /**
  * Demonstrates a simple HTTP endpoint using API Gateway. You have full
  * access to the request and response payload, including headers and
  * status code.
  *
  * To scan a DynamoDB table, make a GET request with the TableName as a
  * query string parameter. To put, update, or delete an item, make a POST,
  * PUT, or DELETE request respectively, passing in the payload to the
  * DynamoDB API as a JSON body.
  */
  /*
 exports.handler = (event, context, callback) => {
     console.log('Received event:', JSON.stringify(event, null, 2));

     const done = (err, res) => callback(null, {
         statusCode: err ? '400' : '200',
         body: err ? err.message : JSON.stringify(res),
         headers: {
             'Content-Type': 'application/json',
         },
     });
     
//     done(new Error(`Debug: request received: "${JSON.stringify(event, null, 2)}"`));
     var table = "tutorialTicTacToeGames";
     
     var params = {
         TableName:table,
         Item:{
                 "game_id" : 1, 
                 "user1" : 1, 
                 "user2" : 2
             }
         }

     switch (event.httpMethod) {
         case 'DELETE':
             dynamo.deleteItem(JSON.parse(event.body), done);
             break;
         case 'GET':
             dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
             break;
         case 'POST':
             dynamo.putItem(params, done);
             break;
         case 'PUT':
             dynamo.updateItem(JSON.parse(event.body), done);
             break;
         default:
             done(new Error(`Unsupported method "${event.httpMethod}"`));
     }
     
 };
 */