module.exports = {
  Piece: function(color) {
    this.color = color
    this.xPos = 0
    this.yPos = 0
    this.king = false
  },

  newBoard: function() {
    var board = new Array(8);
    for(var i = 0; i < board.length; i++) {
      board[i] = new Array(8);
    }
    for(y=0; y<board.length; y++){
      for(x=0; x<board.length; x++){
        if(y>=0 && y<=2 && (x+y) % 2 != 0)
          board[y][x] = new this.Piece("blue")
        else if(y>= 5 && y <= 7 && (x+y) % 2 != 0)
          board[y][x] = new this.Piece("red")
        else
          board[y][x] = null
      }
    }
    return board;
  },

  initializePieces: function(board, boardHeight) {
    tileSize = boardHeight/8;
    for(y = 0; y < board.length; y++) {
      for(x = 0; x < board[0].length; x++) {
        if(board[y][x] != null) {
          board[y][x].xPos = (tileSize/2)+(x*tileSize)
          board[y][x].yPos = (tileSize/2)+(y*tileSize)
        }
      }
    }
  },

  printBoard: function(board) {
    console.log("board:")
    for(y = 0; y < board.length; y++) {
      var str = ""
      for(x = 0; x < board.length; x++){
        str += board[y][x] + " "
      }
      console.log(str)
    }
  }
};
