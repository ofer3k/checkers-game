function drawBoard(context, board, boardHeight) {
  tileSize = boardHeight/8;
  for (y = 0; y < board.length; y++) {
    for(x = 0; x < board[0].length; x++) {
      if(((x + y) % 2) == 0){
        //context.fillStyle="rgba(167,211,255,1,0)";
        context.fillStyle="#FFFFFF";
      }
      else {
        context.fillStyle='rgba(44,62,80,1.0)';
      }
      context.fillRect(x*tileSize,y*tileSize, tileSize, tileSize);
    }
  }
}

function drawPieces(context,board) {
  for(y = 0; y < board.length; y++) {
    for(x=0; x < board.length; x++){
      if(board[y][x]!=null){
        drawPiece(context, board[y][x]);
      }
    }
  }
}

function drawPiece(context, newPiece) {
  if(newPiece.color == 'red') {
    context.fillStyle = 'rgb(163, 79, 79)';
  }
  else if(newPiece.color == 'blue') {
    context.fillStyle = 'rgba(0, 255, 255, 1)'
  }
  context.beginPath();
  context.arc(newPiece.xPos,newPiece.yPos,(tileSize-10)/2,0,2*Math.PI);
  context.stroke();
  context.fill();
  if(newPiece.king){
    context.fillStyle = "white"
    fontSize = tileSize/2
    context.font=fontSize+"px Impact";
    context.fillText("K",newPiece.xPos-(tileSize/9),newPiece.yPos+(tileSize/5))
  }
}

function drawGameOver(context, boardHeight, gameOver) {
  tileSize = boardHeight/8;
  context.fillStyle= "#000000"
  context.fillRect(tileSize/2,(tileSize/2)*5,(tileSize/2)*14,(tileSize/2)*6)
  context.fillStyle = "#ffffff"
  var fontSize=tileSize
  context.font=fontSize +"px Impact";
  context.fillText(gameOver,(tileSize/2)*4,(tileSize/2)*8.5)
}
