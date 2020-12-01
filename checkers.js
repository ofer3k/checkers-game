var moves = require('./moves.js')

module.exports = {

  grabPiece: function(board, turn, clientColor, heldPiece, heldX, heldY, e) {
    if(heldPiece == null && turn==clientColor) {
      for(y=0; y<board.length; y++){
        for(x=0; x<board.length; x++){
          if(board[y][x]!=null && board[y][x].color == turn && e.x>board[y][x].xPos-40 && e.x<board[y][x].xPos+40 && e.y>board[y][x].yPos-40 && e.y<board[y][x].yPos+40) {
            heldPiece = board[y][x];
            heldX = x;
            heldY = y;
          }
        }
      }
    }
    var grab = {
      x: heldX,
      y: heldY,
      piece: heldPiece
    };
    return grab;
  },

  checkWin: function(board) {
    var gameOver = "";
    redExists = false;
    blueExists = false;
    for(y = 0; y < board.length && (!redExists || !blueExists); y++) {
      for(x = 0; x < board.length && (!redExists || !blueExists); x++) {
        if(board[y][x] != null && board[y][x].color == "red")
          redExists = true
        else if(board[y][x] != null && board[y][x].color == "blue")
          blueExists = true
      }
    }
    if(!redExists)
      gameOver = "Blue Wins"
    else if(!blueExists) {
      gameOver = "Red Wins"
    }
    return gameOver;
  }

}
