module.exports = {

  getValidMoves: function(turn, board, lastMove) {
    var moves = []
    continueJump = (lastMove!=null && lastMove.piece.color == turn) ? true : false
    for(y = 0; y < board.length; y++) {
      for(x = 0; x < board.length; x++) {
        if(board[y][x]!=null && board[y][x].color == turn) {
          moves = moves.concat(getMoves(board[y][x], x, y, board))
        }
      }
    }
    for(var i = 0; i<moves.length; i++) {
      if(moves[i].jumpX != -1) {
        moves = deleteNonJumps(moves);
      }
    }
    if(continueJump) {
      moves = deleteOtherPiecesMoves(moves, lastMove.piece);
    }
    return moves;
  },

  getJumps: function(piece,x,y,board) {
    var moves = [];
    if(y>=2 && (piece.king || piece.color=="red")) {
      if(x<=5 && board[y-1][x+1]!=null && board[y-1][x+1].color!=piece.color && board[y-2][x+2]==null)
        moves.push(new Move(piece, x+2, y-2, x+1, y-1))
      if(x>=2 && board[y-1][x-1]!=null && board[y-1][x-1].color!=piece.color && board[y-2][x-2]==null)
        moves.push(new Move(piece, x-2, y-2, x-1, y-1))
    }
    if(y<=5 && (piece.king || piece.color=="blue")) {
      if(x<=5 && board[y+1][x+1]!=null && board[y+1][x+1].color!=piece.color && board[y+2][x+2]==null)
        moves.push(new Move(piece, x+2, y+2, x+1, y+1))
      if(x>=2 && board[y+1][x-1]!=null && board[y+1][x-1].color!=piece.color && board[y+2][x-2]==null)
        moves.push(new Move(piece, x-2, y+2, x-1, y+1))
    }
    return moves;
  }

}

function Move(piece, newX, newY, jumpX, jumpY) {
  this.piece = piece
  this.newX = newX
  this.newY = newY
  this.jumpX = jumpX
  this.jumpY = jumpY
}

function getMoves(piece, x, y, board) {
  var moves = []
  moves = moves.concat(getJumps(piece,x,y,board))
  if(y>=1 && (piece.king || piece.color=="red")) {
    if(x<=6 && board[y-1][x+1]==null)
      moves.push(new Move(piece, x+1, y-1, -1, -1))
    if(x>=1 && board[y-1][x-1]==null)
      moves.push(new Move(piece, x-1, y-1, -1, -1))
  }
  if(y<=6 && (piece.king || piece.color=="blue")) {
    if(x<=6 && board[y+1][x+1]==null)
      moves.push(new Move(piece, x+1, y+1, -1, -1))
    if(x>=1 && board[y+1][x-1]==null)
      moves.push(new Move(piece, x-1, y+1, -1, -1))
  }
  return moves
}

function deleteNonJumps(moves) {
  moves = moves.filter(function(a) {
    return a.jumpX != -1;
  })
  return moves;
}

function deleteOtherPiecesMoves(moves, piece) {
  moves = moves.filter(function(a) {
    return a.piece == piece
  })
  return moves
}

function getJumps(piece,x,y,board) {
  var moves = [];
  if(y>=2 && (piece.king || piece.color=="red")) {
    if(x<=5 && board[y-1][x+1]!=null && board[y-1][x+1].color!=piece.color && board[y-2][x+2]==null)
      moves.push(new Move(piece, x+2, y-2, x+1, y-1))
    if(x>=2 && board[y-1][x-1]!=null && board[y-1][x-1].color!=piece.color && board[y-2][x-2]==null)
      moves.push(new Move(piece, x-2, y-2, x-1, y-1))
  }
  if(y<=5 && (piece.king || piece.color=="blue")) {
    if(x<=5 && board[y+1][x+1]!=null && board[y+1][x+1].color!=piece.color && board[y+2][x+2]==null)
      moves.push(new Move(piece, x+2, y+2, x+1, y+1))
    if(x>=2 && board[y+1][x-1]!=null && board[y+1][x-1].color!=piece.color && board[y+2][x-2]==null)
      moves.push(new Move(piece, x-2, y+2, x-1, y+1))
  }
  return moves;
}
