var express = require('express');
const fetch=require('node-fetch')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port,function() {
  console.log('Server listening at port ' + port);
});

app.use(express.static(__dirname + '/public'));

var gamesetup = require('./gamesetup');
var checkers = require('./checkers');
var moves = require('./moves');
let users=[]
var numUsers = 0;

function Game() {
  this.boardHeight = 600;
  this.board = gamesetup.newBoard();
  this.turn = "red";
  this.redLoggedIn= false;
  this.blueLoggedIn=false;
  gamesetup.initializePieces(this.board, this.boardHeight);
  this.heldPiece=null;
  this.heldX = -1;
  this.heldY = -1;
  this.gameOver = "";
  this.lastMove = null;
}

let currentGameClients=[]
let clients=[]
let clientIdToGame=new Map()
let gamePartners= new Map()

io.on('connection', function(client) {
 

  client.on('add user', function(username) {
    numUsers++;
    clients.push(client.id)
    client.username = username;
    currentGameClients.push(username)
    console.log(client.username + " has logged in.");
    console.log(numUsers + " users are connected.");
 
    if(clientIdToGame.size%2===0)
    {
      console.log('enterd'+ client.id)
      console.log('size before'+clientIdToGame.size)
      clientIdToGame.set(client.id, new Game());
      console.log('size after'+clientIdToGame.size)
    }
    else{
      clientIdToGame.set(client.id, clientIdToGame.get(clients[clients.length-2]))
      gamePartners.set(client.id, clients[clients.length-2])
      gamePartners.set(clients[clients.length-2], client.id)
    }
    game=clientIdToGame.get(client.id)
    if(!game.redLoggedIn) {
          client.color = "red";
          game.redLoggedIn = true;
        }
        else if(!game.blueLoggedIn) {
          client.color = "blue";
          game.blueLoggedIn = true;
        }
        else {
          client.color = "spectator";
        }
        console.log(client.username + " will play as " + client.color + ".");
        client.emit('newGame', game, client.color);
  });

  
  
  client.on('disconnect', function() {
    if(client.username) {
      numUsers--;
      console.log(client.username + " has logged out.")
      console.log(numUsers + " users are connected.");
      if(client.color === "red") {
        // redLoggedIn = false;
      }
      else if(client.color === "blue") {
        // blueLoggedIn = false;
      }
    }
  });

  client.on('mouseDown', function(e) {
    game=clientIdToGame.get(client.id)
    var grab = checkers.grabPiece(game.board, game.turn, client.color, game.heldPiece, game.heldX, game.heldY, e);
    game.heldPiece = grab.piece;
    game.heldX = grab.x;
    game.heldY = grab.y;
  });

  client.on('mouseMove', function(e) {
    //
    game=clientIdToGame.get(client.id)
    if(game.heldPiece!=null && game.turn == client.color){
      game.heldPiece.xPos = e.x;
      game.heldPiece.yPos = e.y;
      // io.emit('sync', game.board);
      io.to(client.id).emit('sync', game.board);
      io.to(gamePartners.get(client.id)).emit('sync', game.board);
    }
    
  });

  client.on('mouseUp', function(e) {
    game=clientIdToGame.get(client.id)
    if(game.heldPiece != null && game.turn == client.color) {
          placePiece(e,game);
          gamesetup.initializePieces(game.board, game.boardHeight);
          io.to(client.id).emit('sync', game.board);
          io.to(gamePartners.get(client.id)).emit('sync', game.board);
        }
    
  });

  client.on('mouseOut', function(e) {
    //
    game=clientIdToGame.get(client.id)
    if(game.heldPiece != null && game.turn == client.color) {
      game.heldPiece = null;
      game.heldX = -1;
      game.heldY = -1;
      gamesetup.initializePieces(game.board, game.boardHeight);
      io.to(client.id).emit('sync', game.board);
      io.to(gamePartners.get(client.id)).emit('sync', game.board);
    }

  
  });

});

function placePiece(e,currentGame) {
  var tileSize = currentGame.boardHeight / 8;
  var kinged = false;
  var dropX = Math.floor(e.x/tileSize);
  var dropY = Math.floor(e.y/tileSize);
  var validMoves = moves.getValidMoves(currentGame.turn, currentGame.board, currentGame.lastMove);
  if(validMoves.length == 0) {
    currentGame.gameOver = currentGame.turn + " can't move.";
  }
  var move = null
  for(x = 0; x < validMoves.length; x++) {
    if(currentGame.heldPiece == validMoves[x].piece && dropX == validMoves[x].newX && dropY == validMoves[x].newY) {
      move = validMoves[x]
    }
  }
  if(move != null) {
    currentGame.board[dropY][dropX] = currentGame.board[currentGame.heldY][currentGame.heldX];
    currentGame.board[currentGame.heldY][currentGame.heldX] = null;
    if(move.jumpX != -1) {
      currentGame.board[move.jumpY][move.jumpX] = null;
      currentGame.gameOver = checkers.checkWin(currentGame.board);
    }
    if(!currentGame.heldPiece.king && currentGame.heldPiece.color=="red" && dropY==0){
      currentGame.heldPiece.king=true;
      kinged = true;
    }
    else if(!currentGame.heldPiece.king && currentGame.heldPiece.color=="blue" && dropY==currentGame.board.length-1){
      currentGame.heldPiece.king=true;
      kinged = true;
    }
    if(kinged || move.jumpX == -1) {
      currentGame.turn = currentGame.turn == "red" ? "blue" : "red";
    }
    else if(!(move.jumpX != -1 && moves.getJumps(currentGame.board[dropY][dropX],dropX,dropY,currentGame.board).length > 0)) {
      currentGame.turn = currentGame.turn == "red" ? "blue" : "red";
    }
    currentGame.lastMove = move;
  }
  currentGame.heldPiece=null;
  currentGame.heldX = -1;
  currentGame.heldY = -1;

  if(currentGame.gameOver != null) {
    let winner;
    let check=checkers.checkWin(currentGame.board)
    console.log(check)
   if(check==="Red Wins")
   {
    winner=currentGameClients[0]
   }
   else if(check==="Blue Wins")
   {
    winner=currentGameClients[1]
   }
   console.log(winner)
   console.log(check)
   if(winner!=undefined)
   {
    fetch('http://localhost:3001/users/update/'+winner)
    .then(response => response.json())
    .then(data => console.log(data));
   }
   io.emit('gameOver', currentGame.gameOver);
  }
}
