$(function() {

 
  var INTERVAL=50;
  var socket = io();
  var username = "";
  var $userNameInput = $('.login-screen__input');
  var $loginScreen = $('.login-screen');
  var canvas = $('.game-canvas').get(0);
  var context = canvas.getContext('2d');
  var board;
  var boardHeight;
  var color;
  var gameOver = "";
  canvas.addEventListener('mousedown', clientMouseDown);
  canvas.addEventListener('mousemove', clientMouseMove);
  canvas.addEventListener('mouseup', clientMouseUp);
  canvas.addEventListener('mouseout', clientMouseOut);

  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);
  const name = urlParams.get('name')
  console.log(name);
  document.getElementById('nameInput').value=name
  
  function cleanInput (input) {
    return $('<div/>').text(input.trim()).text();
  }
  $userNameInput.keydown(function (event) {
    if(event.which == 13) {
      setUserName();
    }
  });
  function setUserName() {
    username = cleanInput($userNameInput.val());
    if(username) {
      $loginScreen.fadeOut();
      socket.emit('add user', username);
    }
  }
  
  socket.on('msg',function(msg){
    alert(msg)
  })

  socket.on('newGame', function(serverGame, newColor) {
    board = serverGame.board;
    boardHeight = serverGame.boardHeight;
    color = newColor;
    drawBoard(context, board, boardHeight);
    drawPieces(context, board);
    setInterval(function() {
      mainLoop();
    }, INTERVAL);
  });

  socket.on('sync', function(serverBoard) {
    board = serverBoard;
  });

  socket.on('gameOver', function(serverGameOver) {
    gameOver = serverGameOver;
  });

  function mainLoop() {
    drawBoard(context, board, boardHeight);
    drawPieces(context, board);
    if(gameOver != "")
      drawGameOver(context,boardHeight, gameOver);
  }

  function clientMouseDown(e) {
    var click = {
      x: e.x,
      y: e.y
    };
    socket.emit('mouseDown', click);
  }

  function clientMouseMove(e) {
    var move = {
      x: e.x,
      y: e.y
    };
    socket.emit('mouseMove', move);
  }

  function clientMouseUp(e) {
    var release = {
      x: e.x,
      y: e.y
    }
    socket.emit('mouseUp', release);
  }

  function clientMouseOut() {
    socket.emit('mouseOut');
  }
  socket.emit('join',{userName,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
  
  })
});


