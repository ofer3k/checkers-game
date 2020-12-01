var express = require('express');
var app = express();
// const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
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
const { stringify } = require('querystring');

function Game() {
  this.boardHeight = 600;
  this.board = gamesetup.newBoard();
  this.turn = "red";
  gamesetup.initializePieces(this.board, this.boardHeight);
  this.heldPiece=null;
  this.heldX = -1;
  this.heldY = -1;
  this.gameOver = "";
  this.lastMove = null;
}

// var game = new Game();

let socketToUsername =new Map()
let usernameToSocket =new Map()
let socketIdToGame =new Map()
let waitingUsers=[]
let runningGames = []

io.on('connection', function(client) {
// //
// client.on('join',({userName,room},callback)=>{
//       //adding this user to array
//   const{error,user}=addUser({id:client.id,userName,room})
//   if(error){
//       return callback(error)
//   }
//   client.join(user.room)
//   //
//   io.to(user.room).emit('msg','welcome to room number '+user.room);
//   //alert other users in this room
//   client.broadcast.to(user.room).emit('message',user.username+' has joined the room')
//   //room data
//   // io.to(user.room).emit('roomData',{
//   //     room:user.room,
//   //     users:getUsersInRoom(user.room)
//   // })
//   callback()
// })
function placePiece(game, e) {
  var tileSize = game.boardHeight / 8;
  var kinged = false;
  var dropX = Math.floor(e.x/tileSize);
  var dropY = Math.floor(e.y/tileSize);
  var validMoves = moves.getValidMoves(game.turn, game.board, game.lastMove);
  if(validMoves.length == 0) {
    game.gameOver = game.turn + " can't move.";
  }
  var move = null
  for(x = 0; x < validMoves.length; x++) {
    if(game.heldPiece == validMoves[x].piece && dropX == validMoves[x].newX && dropY == validMoves[x].newY) {
      move = validMoves[x]
    }
  }
  if(move != null) {
    game.board[dropY][dropX] = game.board[game.heldY][game.heldX];
    game.board[game.heldY][game.heldX] = null;
    if(move.jumpX != -1) {
      game.board[move.jumpY][move.jumpX] = null;
      game.gameOver = checkers.checkWin(game.board);
    }
    if(!game.heldPiece.king && game.heldPiece.color=="red" && dropY==0){
      game.heldPiece.king=true;
      kinged = true;
    }
    else if(!game.heldPiece.king && game.heldPiece.color=="blue" && dropY==game.board.length-1){
      game.heldPiece.king=true;
      kinged = true;
    }
    if(kinged || move.jumpX == -1) {
      game.turn = game.turn == "red" ? "blue" : "red";
    }
    else if(!(move.jumpX != -1 && moves.getJumps(game.board[dropY][dropX],dropX,dropY,game.board).length > 0)) {
      game.turn = game.turn == "red" ? "blue" : "red";
    }
    game.lastMove = move;
  }
  game.heldPiece=null;
  game.heldX = -1;
  game.heldY = -1;
  if(game.gameOver != null) {
    io.emit('gameOver', game.gameOver);
  }
}

  client.on('login', function(username) {
      // <username> connected
    usernameToSocket[username] = client
    waitingUsers.push(client)
    client.username = username;
    console.log(client.username + " has logged in.");
    tryToCreateNewGame()
  });

  const tryToCreateNewGame = () => {
    if(waitingUsers.length >= 2) {
      game = createNewGame(waitingUsers.pop(), waitingUsers.pop())
      runningGames.push(game)
      return game
    }
    return undefined
  }
  
  const createNewGame = (client2, client1) => {
    let game = new Game()
    client1.color = "blue"
    client2.color = "red"
    console.log(client1.username + " will play as " + client1.color + ".");
    console.log(client2.username + " will play as " + client2.color + ".");

    socketIdToGame[client1.id] = game
    socketIdToGame[client2.id] = game
    client1.emit('newGame', game, client1.color)
    client2.emit('newGame', game, client2.color)
    return game
  } 

  // winningUserName = socketToUsername[winningUser.id]
  
  client.on('disconnect', function() {
    if(client.username) {
      console.log(client.username + " has logged out.")
    }
  });

  client.on('mouseDown', function(e) {
    game = socketIdToGame[client.id]
    var grab = checkers.grabPiece(game.board, game.turn, client.color, game.heldPiece, game.heldX, game.heldY, e);
    game.heldPiece = grab.piece;
    game.heldX = grab.x;
    game.heldY = grab.y;
  });

  client.on('mouseMove', function(e) {
    game = socketIdToGame[client.id]
    if(game.heldPiece!=null && game.turn == client.color){
      game.heldPiece.xPos = e.x;
      game.heldPiece.yPos = e.y;
      io.emit('sync', game.board);
    }
  });

  client.on('mouseUp', function(e) {
    game = socketIdToGame[client.id]
    console.log(game.turn)
    if(game.heldPiece != null && game.turn == client.color) {
      placePiece(game, e);
      gamesetup.initializePieces(game.board, game.boardHeight);
      io.emit('sync', game.board);
    }
  });

  client.on('mouseOut', function(e) {
    game = socketIdToGame[client.id]
    if(game.heldPiece != null && game.turn == client.color) {
      game.heldPiece = null;
      game.heldX = -1;
      game.heldY = -1;
      gamesetup.initializePieces(game.board, game.boardHeight);
      io.emit('sync', game.board);
    }
  });

});


