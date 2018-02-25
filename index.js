'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

// Handler entry point
exports.handler = function(event, context, callback) {
	console.log('Received event:', JSON.stringify(event, null, 2));

    // standard response
    const calldone = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
//    trialAndError();
	var result = processRequest (event, context, calldone);

	//calldone(null, JSON.stringify(result));
};
 
// Parse the method and call corresponding API handler
function processRequest (event, context, calldone) {
    var result = "Unknown request";
    switch (event.httpMethod) {
        case 'DELETE':
            result = "DELETE unsupported";
            break;
        case 'GET':
            result = "GET unsupported";
            break;
        case 'POST':
            result = functionProcessPOST( event.body, calldone );
            break;
        case 'PUT':
            result = "PUT unsupported";
            break;
        default:
            result = "Unknown request";
    }
    return result;
};



// TODO: use Environment Variables
// https://docs.aws.amazon.com/lambda/latest/dg/env_variables.html
// Simple table model to avoid field naming issues throughout the code
// there may be a more appropirate way
var TableModel = 
{
    TableName : "tutorialGame",
        Item:{
            "game_id"    : "game_id", 
            "player1"   : "player1", 
//            "player2"   : "player2",      // removed for now, can't scan for null, only for not exists
            "board"     : "board",        // binary, flattened array[15][15]
            "state"     : "state"
        }
};

// Define possible game states, basically an enum 
// with values being string to store in db
var GameStates =
{
    pending : "pending",
    inprogress: "inprogress",
    winner1 : "winner1",
    winner2 : "winner2",
    draw : "draw"
};

const BoardSide = 15;
// TODO: standardise all item names in table

// Matchmaking 
// Current approach is prone to race condition due to it being split into
// 2 ops: scan for open games and then racing to match to an open game
// Solution? ConditionalWrite in matchToGame if player 2 is still empty, 
// otherwise retry matchmaking or create a new game

function functionProcessPOST( body, calldone )
{
    var parsed = JSON.parse(body);
    var player = parsed.name;
    console.log("functionProcessPOST:", JSON.stringify(body, null, 2));
    performMatchmaking( player, calldone );

};

function performMatchmaking( playerName, calldone )
{
    // Scan if game exists, then matchToGame, otherwise createNewGame
    var openGame = openGameExists( playerName, createNewGame, matchToGame, calldone );
}


function openGameExists( playerName, createGame, matchGame, calldone )
{
    // scan will get longer the more games are played. 
    // TODO: solve. e.g. finished games can be moved to a new table?
    // TODO: replace with query - more efficient and we only need first found.
    // TODO: check if same player tries to open another game and reject
    var scanIsGameOpen = {
        TableName : TableModel.TableName,
        FilterExpression: `attribute_not_exists(${TableModel.Item.player2})`
    };
    
    dynamo.scan(scanIsGameOpen, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Scan returned:", JSON.stringify(data, null, 2));
        if( data.Count == 0 )
        {
            createGame( playerName, calldone );
        }else
        {
            matchGame( data.Items[0].game_id, playerName, calldone );
        }
    }
    });
};

function matchToGame( game_id, playerName, calldone )
{
    console.log("matchToGame:", `"${game_id}"`);
    //calldone( new Error(`Not implemented: matchToGame`));
    
    var updateRequest = {
            TableName: TableModel.TableName,
            Key: {
                "game_id": game_id
            },
            UpdateExpression: "SET player2 = :player2",
            ExpressionAttributeValues: {
                ":player2": playerName
            },
            ReturnValues: "UPDATED_NEW"
        };

    dynamo.updateItem(updateRequest, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Update returned:", JSON.stringify(data, null, 2));
    }
    });
    calldone( null, `Game matched for "${playerName}": "${game_id}"`);
};

function createNewGame( playerName, calldone )
{
    console.log("createNewGame:", JSON.stringify(playerName));
    
    // calldone( new Error(`Not implemented: createNewGame`));
    var createRequest = TableModel;
    createRequest.Item.game_id = `${Date.now()} - ${playerName}`;// unique game id. TODO: how to use UUID?
    createRequest.Item.player1 = playerName;
    //createRequest.Item.player2 = null; // can't scan for null, only for not exists
    var board = []; board.length = BoardSide*BoardSide;
    createRequest.Item.board = board;// flatten array[15][15] array of zeroes
    createRequest.Item.state = GameStates.pending; 
    
    console.log("createNewGame:", JSON.stringify(createRequest));
    
    dynamo.putItem(createRequest, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Put returned:", JSON.stringify(data, null, 2));
    }
    });
    
    calldone( null, `Game created for "${playerName}": "${createRequest.Item.gameId}"`);
};


function trialAndError()
{
    var req = {
        TableName: TableModel.TableName,
        KeyConditionExpression: "player1 = :a",
        ExpressionAttributeValues: {
            ":a": "Player X"
        }
    };
    dynamo.query(req, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Scan returned:", JSON.stringify(data, null, 2));
    }
    });
}