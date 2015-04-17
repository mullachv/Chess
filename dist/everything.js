(function() {
'use strict';

/*global angular */

  /**
   * This is the logic service for Chess. The game board is represented as a
   * two dimensional array (8*8). All elements are listed below:
   *
   * For 12 kinds of piece of the game:
   * WK: White KING           BK: Black KING
   * WQ: White QUEEN          BQ: Black QUEEN
   * WR: White ROOK           BR: Black ROOK
   * WN: White KNIGHT         BN: Black KNIGHT
   * WB: White BISHOP         BB: Black BISHOP
   * WP: White PAWN           BP: Black PAWN
   *
   * Example - The initial state:
   *
   *        0     1     2     3     4     5     6     7
   * 0:  [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
   * 1:  ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
   * 2:  ['', '', '', '', '', '', '', ''],
   * 3:  ['', '', '', '', '', '', '', ''],
   * 4:  ['', '', '', '', '', '', '', ''],
   * 5:  ['', '', '', '', '', '', '', ''],
   * 6:  ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
   * 7:  ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]
   *
   * Note: The number of row and col are both zero based, so the last row for white
   * is 0 and for black is 7.
   *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * The move operation is an array consist of several parts:
   *
   * 0 - setTurn: {setTurn: {turnIndex: 0}}
   * 0 - endMatch: {endMatch: {endMatchScores: [1, 0]}}
   * 1 - setBoard: {set: {key: 'board', value: [[...], ..., [...]]}}
   * 2 - setDeltaFrom: {set: {key: 'deltaFrom', value: {row: row, col: col}}}
   * 3 - setDeltaTo: {set: {key: 'deltaTo', value: {row: row, col: col}}}
   * 4 - setIsUnderCheck: {set: {key: 'isUnderCheck', value: [fasle, false]}},
   * 5 - setCanCastleKing: {set: {key: 'canCastleKing', value: [true, true]}},
   * 6 - setCanCaseltQueen: {set: {key: 'canCastleQueen', value: [true, true]}},
   * 7 - setEnpassantPosition: {set: {key: 'enpassantPosition', value: {row: null, col: null}}}
   *
   * Notes: move[0] can be either setTurn or endMatch
   *
   * e.g. [
   *       {setTurn: {turnIndex: 1}},
   *       {set: {key: 'board', value:
   *         [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
   *          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
   *          ['', '', '', '', '', '', '', ''],
   *          ['', '', '', '', '', '', '', ''],
   *          ['', '', '', '', '', '', 'WP', ''],
   *          ['', '', '', '', '', '', '', ''],
   *          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],
   *          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]
   *       }},
   *       {set: {key: 'deltaFrom', value: {row: 6, col: 4}}},
   *       {set: {key: 'deltaTo', value: {row: 4, col: 4}}},
   *       {set: {key: 'isUnderCheck', value: [false, false]}},
   *       {set: {key: 'canCastleKing', value: [true, true]}},
   *       {set: {key: 'canCastleQueen', value: [true, true]}},
   *       {set: {key: 'enpassantPosition', value: {row: null, col: null}}}
   *      ]
   *
   * some helpful background knowledge of Chess rules:
   * Casling: http://en.wikipedia.org/wiki/Castling
   * En Passant: http://en.wikipedia.org/wiki/En_passant
   *
   */

angular.module('myApp', []).factory('gameLogic', function() {

/** Returns the initial Chess board, which is a 8x8 matrix containing ''. */
  function getInitialBoard() {
    return [
      ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
      ['', '', '', '', '', '', '', ''],  
      ['', '', '', '', '', '', '', ''], 
      ['', '', '', '', '', '', '', ''],  
      ['', '', '', '', '', '', '', ''], 
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
      ];
  }

/**
 * Returns true if the game ended in a tie because there are no available moves for any pieces
 * 
 * @board: the board representation
 * @turnIndex: current player
 * @isUnderCheck: array of length two indicating the under check status of each player
 * @canCastleKing: true if the player have never castled to King side
 * @canCastleQueen: true if the player have never castled to Queen side
 * @enpassantPosition: coordinate object indicating the enpassant position
 */
  function isTie(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {   
    if (!isUnderCheck[turnIndex]) {
      var curPlayer = getTurn(turnIndex);

      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          if (board[i][j] !== '' && board[i][j].charAt(0) === curPlayer) {
            var curPiece = board[i][j];
            var curPos = {row: i, col: j};
            switch (curPiece.charAt(1)) {
              case 'K': 
                if (canKingMoveAnywhere(board, turnIndex, curPos, 
                    isUnderCheck, canCastleKing, canCastleQueen)) {
                  return false; 
                }            
                break;
              case 'Q': 
                if (canQueenMoveAnywhere(board, turnIndex, curPos)) {
                  return false; 
                }              
                break;
              case 'R': 
                if (canRookMoveAnywhere(board, turnIndex, curPos)) {
                  return false; 
                }     
                break;
              case 'B': 
                if (canBishopMoveAnywhere(board, turnIndex, curPos)) {
                  return false;
                }  
                break;
              case 'N': 
                if (canKnightMoveAnywhere(board, turnIndex, curPos)) {
                  return false;
                }    
                break;
              case 'P': 
                if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition)) {
                  return false;
                }   
                break;
            }
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

/**
 * Return the winner (either 'W' or 'B') or '' if there is no winner
 * @parameters are the same with isTie()
 */
 function getWinner(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {
    if (isUnderCheck[turnIndex]) {
      var curPlayer = getTurn(turnIndex);
      var kingsPosition = findKingsPosition(board, turnIndex);

      // if there is no available moves for king
      if (!canKingMoveAnywhere(board, turnIndex, kingsPosition, 
          isUnderCheck, canCastleKing, canCastleQueen)) {
        for (var i = 0; i < 8; i++) {
          for (var j = 0; j < 8; j++) {
            if (board[i][j] !== '' && board[i][j].charAt(0) === curPlayer) {
              var curPiece = board[i][j];
              var curPos = {row: i, col: j};
              switch (curPiece.charAt(1)) {
                case 'Q': 
                  if (canQueenMoveAnywhere(board, turnIndex, curPos, canCastleKing, canCastleQueen)) {
                    return ''; 
                  }              
                  break;
                case 'R': 
                  if (canRookMoveAnywhere(board, turnIndex, curPos)) {
                    return ''; 
                  }   
                  break;
                case 'B':
                  if (canBishopMoveAnywhere(board, turnIndex, curPos)) {
                    return '';
                  }     
                  break;
                case 'N': 
                  if (canKnightMoveAnywhere(board, turnIndex, curPos)) {
                    return '';
                  }       
                  break;
                case 'P': 
                  if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition)) {
                    return '';
                  }         
                  break;
              }
            }
          }
        }
        // if we reached here then there is no piece to save the king
        return getOpponent(turnIndex);
      }
    } 
    return '';
 }

 /**
 * Returns the move that should be performed when player givin a state
 * @deltaFrom: start position of the piece
 * @deltaTo: destination position of the piece
 */
  function createMove(board, deltaFrom, deltaTo, turnIndexBeforeMove, 
                      isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, promoteTo) {
    console.log("CreateMove arguments: " + angular.toJson([
board, deltaFrom, deltaTo, turnIndexBeforeMove,isUnderCheck, canCastleKing, canCastleQueen,
enpassantPosition, promoteTo
]));
    
    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    // initialize all variables
    if (!isUnderCheck) { isUnderCheck = [false, false]; }
    if (!canCastleKing) { canCastleKing = [true, true]; }
    if (!canCastleQueen) { canCastleQueen = [true, true]; }
    if (!enpassantPosition) { enpassantPosition = {row: null, col: null}; }
    if (!promoteTo) { promoteTo = ''; }

    var destination = board[deltaTo.row][deltaTo.col];

    if (destination !== '' && destination.charAt(0) === (turnIndexBeforeMove === 0 ? 'W' : 'B')) {
      throw new Error("One can only make a move in an empty position or capture opponent's piece!");
    }

    if (deltaFrom.row === deltaTo.row && deltaFrom.col === deltaTo.col) {
      throw new Error ("Cannot move to same position.");
    }
    
    if (getWinner(board, turnIndexBeforeMove, isUnderCheck, 
          canCastleKing, canCastleQueen, enpassantPosition) !== '' || 
        isTie(board, turnIndexBeforeMove, isUnderCheck, 
          canCastleKing, canCastleQueen, enpassantPosition)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    
    var boardAfterMove = angular.copy(board),
        isUnderCheckAfterMove = angular.copy(isUnderCheck),
        canCastleKingAfterMove = angular.copy(canCastleKing),
        canCastleQueenAfterMove = angular.copy(canCastleQueen),
        enpassantPositionAfterMove = angular.copy(enpassantPosition),
        promoteToAfterMove = angular.copy(promoteTo);

    var piece = board[deltaFrom.row][deltaFrom.col];
    var turn = getTurn(turnIndexBeforeMove);

    if (turn !== piece.charAt(0)) {
      throw new Error("Illegal to move this piece!");
    }

    // update the board according to the moving piece
    switch(piece.charAt(1)) {
      case 'K':  
        if (isCastlingKing(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleKing)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col - 1] = turn + 'R';
          boardAfterMove[deltaTo.row][7] = '';
          canCastleKingAfterMove[turnIndexBeforeMove] = false;
          canCastleQueenAfterMove[turnIndexBeforeMove] = false;
        }
        else if (isCastlingQueen(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleQueen)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col + 1] = turn + 'R';
          boardAfterMove[deltaTo.row][0] = '';
          canCastleKingAfterMove[turnIndexBeforeMove] = false;
          canCastleQueenAfterMove[turnIndexBeforeMove] = false;
        }
        else if(canKingMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for king.");
        }
        break;
      case 'Q':
        if(canQueenMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
            boardAfterMove[deltaTo.row][deltaTo.col] = piece;
            boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Queen");
        }
        break;
      case 'R':
        if(canRookMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
            boardAfterMove[deltaTo.row][deltaTo.col] = piece;
            boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Rook");
        }
        break;
      case 'B':
        if(canBishopMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Bishop");
        }
        break;
      case 'N':
        if(canKnightMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Knight");
        }
        break;
      case 'P':
        if(canPawnMove(board, deltaFrom, deltaTo, turnIndexBeforeMove, enpassantPosition)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          // capture the opponent pawn with enpassant
          if (enpassantPosition.row && deltaFrom.row === enpassantPosition.row && 
            deltaFrom.col !== deltaTo.col &&
            (Math.abs(deltaFrom.col - enpassantPosition.col) === 1)) {
            boardAfterMove[enpassantPosition.row][enpassantPosition.col] = '';
          }
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          enpassantPositionAfterMove.row = null;
          enpassantPositionAfterMove.col = null;

          // check for enpassant
          if (turn === "W" && deltaTo.row === 4) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "BP" || 
              boardAfterMove[deltaTo.row][deltaTo.col + 1] === "BP") {
              enpassantPositionAfterMove.row = deltaTo.row;
              enpassantPositionAfterMove.col = deltaTo.col;
            }          
          }
          if (turn === "B" && deltaTo.row === 3) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "WP" || 
              boardAfterMove[deltaTo.row][deltaTo.col + 1] === "WP") {
              enpassantPositionAfterMove.row = deltaTo.row;
              enpassantPositionAfterMove.col = deltaTo.col;
            }
          }

          // check for promotion
          if (deltaTo.row === 0 || deltaTo.row === 7) {
            boardAfterMove[deltaTo.row][deltaTo.col] = (promoteToAfterMove ? promoteToAfterMove : turn + "Q");
            // promoteToAfterMove = '';
          }
        } else {
          throw new Error("Illegal move for Pawn");
        }
        break;
      default:
        throw new Error("Unknown piece type!");
    }
    var turnIndexAfterMove = 1 - turnIndexBeforeMove;
    if (isUnderCheckByPositions(boardAfterMove, turnIndexAfterMove)) {
      isUnderCheckAfterMove[turnIndexAfterMove] = true;
    }
    var winner = getWinner(boardAfterMove, turnIndexAfterMove, isUnderCheckAfterMove, 
                  canCastleKingAfterMove, canCastleQueenAfterMove, enpassantPositionAfterMove);
    // console.log("winner: " + winner);
    var firstOperation;
    if (winner !== '' || isTie(boardAfterMove, turnIndexAfterMove, isUnderCheckAfterMove, 
        canCastleKingAfterMove, canCastleQueenAfterMove, enpassantPositionAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        (winner === 'W' ? [1, 0] : (winner === 'B' ? [0, 1] : [0, 0]))}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: turnIndexAfterMove}};
    }
    
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'deltaFrom', value: {row: deltaFrom.row, col: deltaFrom.col}}},
            {set: {key: 'deltaTo', value: {row: deltaTo.row, col: deltaTo.col}}},
            {set: {key: 'isUnderCheck', value: isUnderCheckAfterMove}},
            {set: {key: 'canCastleKing', value: canCastleKingAfterMove}},
            {set: {key: 'canCastleQueen', value: canCastleQueenAfterMove}},
            {set: {key: 'enpassantPosition', value: enpassantPositionAfterMove}},
            {set: {key: 'promoteTo', value: promoteToAfterMove}},
            ];
  }

  /**
  * Returns true if the conditions of castle to king side satisfied
  */
  function isCastlingKing(board, deltaFrom, deltaTo, turnIndex, canCastleKing) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toCol = deltaTo.col,
        caslingRow = (turnIndex === 0 ? 7 : 0),
        turn = getTurn(turnIndex);
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) { return false; }
    if (canCastleKing[turnIndex] && fromRow === caslingRow && 
      fromCol === 4 && toCol - fromCol === 2) {
      for (var j = 5; j <= 6; j++) {
        if (board[fromRow][j] !== '') { return false; }
        if (isPositionUnderAttack(board, turnIndex, {row: fromRow, col: j})) { return false; }
      }
      return board[caslingRow][7] === turn + 'R';
    }
    return false;
  }

  /**
  * Returns true if the conditions of castle to queen side satisfied
  */
  function isCastlingQueen(board, deltaFrom, deltaTo, turnIndex, canCastleQueen) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toCol = deltaTo.col,
        caslingRow = (turnIndex === 0 ? 7 : 0),
        turn = getTurn(turnIndex);
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) { return false; }
    if (canCastleQueen[turnIndex] && fromRow === caslingRow && 
      fromCol === 4 && fromCol - toCol === 2) {
      for (var j = 1; j <= 3; j++) {
        if (board[fromRow][j] !== '') { return false; }
        if (isPositionUnderAttack(board, turnIndex, {row: fromRow, col: j})) { return false; }
      }
      return board[caslingRow][0] === turn + 'R';
    }
    return false;
  }

  /**
  * Returns true if the deltaTo is available for king to move
  */
  function canKingMove(board, deltaFrom, deltaTo, turnIndex) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col;
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) { return false; }
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) { return false; }
        
    for (var i = fromRow - 1; i <= fromRow + 1; i++) {
      for (var j = fromCol - 1; j <= fromCol + 1; j++) {
        if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
          if (i === toRow && j === toCol) {
            return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
          }
        }
      }
    }
    return false;
  }

  /**
  * Returns true if the king has any place to move
  * @startPos is the king's current position
  */
  function canKingMoveAnywhere(board, turnIndex, startPos, isUnderCheck, canCastleKing, canCastleQueen) {
    return getKingPossibleMoves(board, turnIndex, startPos, isUnderCheck, 
            canCastleKing, canCastleQueen).length !== 0;
  }

  /**
  * Returns a list of positions available for king to move
  */
  function getKingPossibleMoves(board, turnIndex, startPos, isUnderCheck, canCastleKing, canCastleQueen) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        destinations = [];
    // standard moves
    for (var i = fromRow - 1; i <= fromRow + 1; i++) {
      for (var j = fromCol - 1; j <= fromCol + 1; j++) {
        if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
          if (board[i][j] === '') {
            var curPos = {row: i, col: j};
            if (moveAndCheck(board, turnIndex, startPos, curPos)) {
              destinations.push(curPos);
            }      
          }
        }
      }
    }
    // casling moves
    if (!isUnderCheck[turnIndex] &&
      isCastlingKing(board, startPos, {row: fromRow, col: fromCol + 2}, turnIndex, canCastleKing)) {
      destinations.push({row: fromRow, col: fromCol + 2});
    }
    if (!isUnderCheck[turnIndex] &&
      isCastlingQueen(board, startPos, {row: fromRow, col: fromCol - 2}, turnIndex, canCastleQueen)) {
      destinations.push({row: fromRow, col: fromCol - 2});
    }
    return destinations;
  }

  /**
  * Returns true the current player's king is under check for given board
  */
  function isUnderCheckByPositions(board, turnIndex) {  
    var kingsPosition = findKingsPosition(board, turnIndex);

    if (kingsPosition) {
      return isPositionUnderAttack(board, turnIndex, kingsPosition);
    } else {
      throw new Error("Your king is missing and the game should end!");
    }
  }

  /**
  * Returns true if the position is under attack by any opponent pieces
  * @position is the coordinate of the position
  */
  function isPositionUnderAttack(board, turnIndex, position) {
    var opponent = getOpponent(turnIndex);
    var attPositions = [];

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (board[i][j] !== '' && board[i][j].charAt(0) === opponent) {
          var opponentPiece = board[i][j];
          var curPos = {row: i, col: j};
          switch (opponentPiece.charAt(1)) {
            case 'K': 
              if (canKingMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'Q':
              if (canQueenMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos); 
              }
              break;
            case 'R':
              if (canRookMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'B':
              if (canBishopMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'N':
              if (canKnightMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'P':
              if (canPawnMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
          }
        }
      }
    }
    return attPositions.length !== 0;
  }
  /**
  * Returns the position of the current player's king
  */
  function findKingsPosition(board, turnIndex) {
    var kingPiece = (turnIndex === 0 ? "WK" : "BK");

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (board[i][j] === kingPiece) { return {row: i, col: j}; }
      }
    }
    return;
  }

  /**
  * Returns true if queen can move from deltaFrom to deltaTo
  */
  function canQueenMove(board, deltaFrom, deltaTo, turnIndex) {
    return canRookMove(board, deltaFrom, deltaTo, turnIndex) || 
    canBishopMove(board, deltaFrom, deltaTo, turnIndex);
  }

  /**
  * Returns true if the queen has any place to move
  */
  function canQueenMoveAnywhere(board, turnIndex, startPos) {
    return canRookMoveAnywhere(board, turnIndex, startPos) || 
    canBishopMoveAnywhere(board, turnIndex, startPos);
  }

  /**
  * Returns all available positions for queen to move
  */
  function getQueenPossibleMoves(board, turnIndex, startPos) {
    return getRookPossibleMoves(board, turnIndex, startPos).concat(
            getBishopPossibleMoves(board, turnIndex, startPos));
  }

  /**
  * Returns true if the rook can move from deltaFrom to deltaTo
  */
  function canRookMove(board, deltaFrom, deltaTo, turnIndex) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col;
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) { return false; }
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) { return false; }
        
    if (fromRow === toRow) {
      if (fromCol === toCol) { return false; }
      for (var i = (fromCol < toCol ? fromCol + 1 : toCol + 1); i < (fromCol < toCol ? toCol : fromCol); i++) {
        if (board[fromRow][i] !== '') { return false; }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    else if (fromCol === toCol) {
      if (fromRow === toRow) { return false; }
      for (var j = (fromRow < toRow ? fromRow + 1 : toRow + 1); j < (fromRow < toRow ? toRow : fromRow); j++) {
        if (board[j][fromCol] !== '') { return false; }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else {
      return false;
    }
  }

  /**
  * Returns true if the rook has any place to move
  */
  function canRookMoveAnywhere(board, turnIndex, startPos) {
    return getRookPossibleMoves(board, turnIndex, startPos).length !== 0;
  }

  /**
  * Returns all available positions for rook to move
  */
  function getRookPossibleMoves(board, turnIndex, startPos) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        toPos = [];
    for (var i = 1; i <=7; i++) {
      var endPos1 = {row: fromRow + i, col: fromCol},
          endPos2 = {row: fromRow - i, col: fromCol},
          endPos3 = {row: fromRow, col: fromCol + i},
          endPos4 = {row: fromRow, col: fromCol - i};
      if (canRookMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
      if (canRookMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
      if (canRookMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
      if (canRookMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
    }
    return toPos;
  }

  /**
  * Returns true if the bishop can move from deltaFrom to deltaTo
  */
  function canBishopMove(board, deltaFrom, deltaTo, turnIndex) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col;
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) { return false; }
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) { return false; }
        
    if ((fromRow === toRow && fromCol === toCol) || 
      (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol))) {
      return false;
    } 
    else {
      for (var i = 1; i < Math.abs(fromRow - toRow); i++) {
        var cell = '';
        if (fromRow < toRow) {
          cell = board[fromRow + i][fromCol < toCol ? fromCol + i : fromCol - i];
        } else {
          cell = board[fromRow - i][fromCol < toCol ? fromCol + i : fromCol - i];
        }
        if (cell !== '') { return false; }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
  }

  /**
  * Returns true if the rook has any place to move
  */
  function canBishopMoveAnywhere(board, turnIndex, startPos) {
    return getBishopPossibleMoves(board, turnIndex, startPos).length !== 0;
  }

  /**
  * Returns the list of available positions for bishop to move
  */
  function getBishopPossibleMoves(board, turnIndex, startPos) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        toPos = [];
    for (var i = 1; i <=7; i++) {
      var endPos1 = {row: fromRow - i, col: fromCol - i},
          endPos2 = {row: fromRow - i, col: fromCol + i},
          endPos3 = {row: fromRow + i, col: fromCol - i},
          endPos4 = {row: fromRow + i, col: fromCol + i};
      if (canBishopMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
      if (canBishopMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
      if (canBishopMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
      if (canBishopMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
    }
    return toPos;
  }

  /**
  * Returns true if the knight can move from deltaFrom to deltaTo
  */
  function canKnightMove(board, deltaFrom, deltaTo, turnIndex) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col;
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) { return false; }
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) { return false; }

    if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else if (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    return false;
  }

  /**
  * Returns true if the knight has any place available to move
  */
  function canKnightMoveAnywhere(board, turnIndex, startPos) {
    return getKnightPossibleMoves(board, turnIndex, startPos).length !== 0;
  }

  /**
  * Returns the list of available positions for knight to move
  */
  function getKnightPossibleMoves(board, turnIndex, startPos) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        toPos = [];

    for (var i = fromRow - 2; i <= fromRow + 2; i++) {
      if (i !== fromRow) {
        var endPos1 = {row: i, col: fromCol - 1};
        var endPos2 = {row: i, col: fromCol - 2};
        var endPos3 = {row: i, col: fromCol + 1};
        var endPos4 = {row: i, col: fromCol + 2};
        if (canKnightMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
        if (canKnightMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
        if (canKnightMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
        if (canKnightMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
      }
    }
    return toPos;   
  }   

  /**
  * Returns true if the pawn can move from deltaFrom to deltaTo
  */
  function canPawnMove(board, deltaFrom, deltaTo, turnIndex, enpassantPosition) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col,
        turn = getTurn(turnIndex);
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) { return false; }
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) { return false; }

    // check if is first move with two squares
    if (Math.abs(fromRow - toRow) === 2 && toCol === fromCol && 
      fromRow === (turn === "W" ? 6 : 1) && 
      board[(fromRow > toRow ? fromRow : toRow) - 1][toCol] === '' && 
        endPiece === '') {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else if (Math.abs(fromRow - toRow) === 1 && fromCol === toCol &&
      endPiece === '') {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else if (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1 &&
      (endPiece.charAt(0) === opponent || 
        endPiece === '' && enpassantPosition && 
        enpassantPosition.row && enpassantPosition.col &&
        fromRow === enpassantPosition.row && 
        Math.abs(fromCol - enpassantPosition.col) === 1)) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else {
      return false;
    }
  }

  /**
  * Returns true if the pawn has any place available to move
  */
  function canPawnMoveAnywhere(board, turnIndex, startPos, enpassantPosition) {
    return getPawnPossibleMoves(board, turnIndex, startPos, enpassantPosition).length !== 0;
  }

  /**
  * Returns the list of available positions for pawn to move
  */
  function getPawnPossibleMoves(board, turnIndex, startPos, enpassantPosition) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        toPos = [],
        turn = getTurn(turnIndex),
        endRow;

    for (var j = fromCol - 1; j <= fromCol + 1; j++) {
      endRow = (turn === 'W' ? fromRow - 1 : fromRow + 1);
      var endPos = {row: endRow, col: j};
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        toPos.push(endPos);
      }
    }
    endRow = (turn === 'W' ? fromRow - 2 : fromRow + 2);
    var endPos2 = {row:endRow, col: fromCol};
    if (canPawnMove(board, startPos, endPos2, turnIndex, enpassantPosition)) {
      toPos.push(endPos2);
    }
    return toPos;
  }

  /**
  * Take the move from startPos to endPos and update the board acocrdingly,
  * see if the current player's king is under check.
  * Returns true if the move does not lead king to check
  * @startPos the start position of moving
  * @endPos the end position of moving
  */
  function moveAndCheck(board, turnIndex, startPos, endPos) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        toRow = endPos.row,
        toCol = endPos.col,
        opponent = getOpponent(turnIndex);
    if (board[toRow][toCol] === opponent + 'K') { return true; }
    var boardAfterMove = angular.copy(board);
    boardAfterMove[toRow][toCol] = boardAfterMove[fromRow][fromCol];
    boardAfterMove[fromRow][fromCol] = '';
    if (isUnderCheckByPositions(boardAfterMove, turnIndex)) { return false; }
    return true;
  }

  /**
  * Returns opponent initial
  */
  function getOpponent(turnIndex) {
    return (turnIndex === 0 ? 'B' : 'W');
  }

  /**
  * Returns turnIndex initial
  */
  function getTurn(turnIndex) {
    return (turnIndex === 0 ? 'W' : 'B');
  }


 /**
  * Check if the move is OK.
  *
  * @param params the match info which contains stateBeforeMove, turnIndexBeforeMove and move.
  * @returns return true if the move is ok, otherwise false.
  */
  function isMoveOk(params) {
    var move = params.move;   
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove = params.stateBeforeMove;

    /* We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
     * to verify that move is legal. */
    try {
      var deltaFrom = move[2].set.value;
      var deltaTo = move[3].set.value;
      var isUnderCheck = stateBeforeMove.isUnderCheck;
      var canCastleKing = stateBeforeMove.canCastleKing;
      var canCastleQueen = stateBeforeMove.canCastleQueen;
      var enpassantPosition = stateBeforeMove.enpassantPosition;
      var board = stateBeforeMove.board;
      var promoteTo = move[8].set.value;

console.log("isMoveOk arguments: " + angular.toJson([board, deltaFrom, deltaTo, turnIndexBeforeMove, 
                          isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, promoteTo]));
      var expectedMove = createMove(board, deltaFrom, deltaTo, turnIndexBeforeMove, 
                          isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, 
                          promoteTo);
// console.log("jane!!!!");
// console.log("move:    " + JSON.stringify(move));
// console.log("expmove: " + JSON.stringify(expectedMove));
      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

  /**
   * Returns all the possible moves for the given state and turnIndex.
   * Returns an empty array if the game is over.
   * @params is the state
   */
  function getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {
    // the list of possible moves of deltaFrom and deltaTo
    if (!board) { return []; }
    var possibleMoves = [],
        turn = (turnIndex === 0 ? 'W' : 'B');
    for (var i = 0; i <= 7; i++) {
      for (var j = 0; j <= 7; j++) {
        var piece = board[i][j];
        if (piece !== '' && piece.charAt(0) === turn) {
          var startPos = {row: i, col: j};
          switch(piece.charAt(1)) {
            case 'K': 
              possibleMoves.push([startPos, 
                getKingPossibleMoves(board, turnIndex, startPos, isUnderCheck, canCastleKing, canCastleQueen)]); 
              break;
            case 'Q': 
              possibleMoves.push([startPos,
                getQueenPossibleMoves(board, turnIndex, startPos)]);
              break;
            case 'R':
              possibleMoves.push([startPos,
                getRookPossibleMoves(board, turnIndex, startPos)]);
              break;
            case 'B':
              possibleMoves.push([startPos,
                getBishopPossibleMoves(board, turnIndex, startPos)]);
              break;
            case 'N':
              possibleMoves.push([startPos,
                getKnightPossibleMoves(board, turnIndex, startPos)]);
              break;
            case 'P':
              possibleMoves.push([startPos,
                getPawnPossibleMoves(board, turnIndex, startPos, enpassantPosition)]);
              break;
          }
        }
      }
    }

    var realPossibleMoves = [];
    for (var a = 0; a < possibleMoves.length; a++) {
      if (possibleMoves[a] && possibleMoves[a][1].length) {
        realPossibleMoves.push(possibleMoves[a]);
      }
    }
    return realPossibleMoves;
  }

  return {
      getInitialBoard: getInitialBoard,
      getPossibleMoves: getPossibleMoves,
      getKingPossibleMoves: getKingPossibleMoves,
      getQueenPossibleMoves: getQueenPossibleMoves,
      getRookPossibleMoves: getRookPossibleMoves,
      getBishopPossibleMoves: getBishopPossibleMoves,
      getKnightPossibleMoves: getKnightPossibleMoves,
      getPawnPossibleMoves: getPawnPossibleMoves,
      createMove: createMove,
      isMoveOk: isMoveOk
  };

});

}());;(function(){
  
  angular.module('myApp')
  .controller('ChessCtrl',
      ['$scope', '$rootScope','$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 
       'aiService', 'resizeGameAreaService', '$translate',
      function ($scope, $rootScope, $log, $timeout,
        gameService, stateService, gameLogic, 
        aiService, resizeGameAreaService, $translate) {

    'use strict';
    resizeGameAreaService.setWidthToHeight(1);

    var selectedCells = [];       // record the clicked cells
    var gameArea = document.getElementById("gameArea");
    var rowsNum = 8;
    var colsNum = 8;
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingPiece = null;
    var draggingPieceAvailableMoves = null;
    var nextZIndex = 61;
    var isPromotionModalShowing = {};
    var modalName = 'promotionModal';
    
    function sendComputerMove() {
      // var possibleMoves = gameLogic.getPossibleMoves($scope.board, $scope.turnIndex, 
      //       $scope.isUnderCheck, $scope.canCastleKing,
      //       $scope.canCastleQueen, $scope.enpassantPosition);
      // if (possibleMoves.length) {
      //   var index1 = Math.floor(Math.random() * possibleMoves.length);
      //   var pm = possibleMoves[index1];
      //   var index2 = Math.floor(Math.random() * pm[1].length);
      //   $scope.deltaFrom = pm[0];
      //   $scope.deltaTo = pm[1][index2];

      //   gameService.makeMove(gameLogic.createMove($scope.board, $scope.deltaFrom, $scope.deltaTo, 
      //       $scope.turnIndex, $scope.isUnderCheck, $scope.canCastleKing, 
      //       $scope.canCastleQueen, $scope.enpassantPosition));
      // } else {
      //   $log.info("no there are no possible moves!");
      // }
      var startingState = {
        board: $scope.board,
        isUnderCheck: $scope.isUnderCheck,
        canCastleKing: $scope.canCastleKing,
        canCastleQueen: $scope.canCastleQueen,
        enpassantPosition: $scope.enpassantPosition
      }

      gameService.makeMove(
          aiService.createComputerMove(startingState, $scope.turnIndex,
            // at most 1 second for the AI to choose a move (but might be much quicker)
            {maxDepth: 3}));

    }

    function updateUI(params) {

      $scope.board = params.stateAfterMove.board;
      $scope.deltaFrom = params.stateAfterMove.deltaFrom;
      $scope.deltaTo = params.stateAfterMove.deltaTo;
      $scope.isUnderCheck = params.stateAfterMove.isUnderCheck;
      $scope.canCastleKing = params.stateAfterMove.canCastleKing;
      $scope.canCastleQueen = params.stateAfterMove.canCastleQueen;
      $scope.enpassantPosition = params.stateAfterMove.enpassantPosition
      $scope.promoteTo = params.stateAfterMove.promoteTo;


      if ($scope.board === undefined) {
        $scope.board = gameLogic.getInitialBoard();
      }

      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;


      // Is it the computer's turn?
      if ($scope.isYourTurn &&
          params.playersInfo[params.yourPlayerIndex].playerId === '') {
        $scope.isYourTurn = false; // to make sure the UI won't send another move.
        // Waiting 0.5 seconds to let the move animation finish; if we call aiService
        // then the animation is paused until the javascript finishes.
        $timeout(sendComputerMove, 500);
      }

      // If the play mode is not pass and play then "rotate" the board
      // for the player. Therefore the board will always look from the
      // point of view of the player in single player mode...
      if (params.playMode === "playBlack") {
        $scope.rotate = true;
      } else {
        $scope.rotate = false;
      }

      // clear up the selectedCells and waiting for next valid move
      selectedCells = [];    
    }
    window.e2e_test_stateService = stateService;
    window.handleDragEvent = handleDragEvent;

    function handleDragEvent(type, clientX, clientY) {
      // Center point in gameArea
      var x = clientX - gameArea.offsetLeft;
      var y = clientY - gameArea.offsetTop;
      var row, col;
      // Is outside gameArea?
      if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
        if (draggingPiece) {
          // Drag the piece where the touch is (without snapping to a square).
          var size = getSquareWidthHeight();
          setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2});
        } else {
          return;
        }
      } else {
        // Inside gameArea. Let's find the containing square's row and col
        var col = Math.floor(colsNum * x / gameArea.clientWidth);
        var row = Math.floor(rowsNum * y / gameArea.clientHeight);
        var r_row = row;
        var r_col = col;

        if ($scope.rotate) {
          r_row = 7 - r_row;
          r_col = 7 - r_col;
        }

        if (type === "touchstart" && !draggingStartedRowCol) {
          // drag started
          if ($scope.board[r_row][r_col]) {            
            draggingStartedRowCol = {row: row, col: col};
            draggingPiece = document.getElementById("e2e_test_img_" + 
              $scope.getPieceKindInId(row, col) + '_' + 
              draggingStartedRowCol.row + "x" + draggingStartedRowCol.col);
            if (draggingPiece) {
              draggingPiece.style['z-index'] = ++nextZIndex;
              draggingPiece.style['width'] = '80%';
              draggingPiece.style['height'] = '80%';
              draggingPiece.style['top'] = '10%';
              draggingPiece.style['left'] = '10%';
              draggingPiece.style['position'] = 'absolute';
            }

            draggingPieceAvailableMoves = getDraggingPieceAvailableMoves(r_row, r_col);
            for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
              draggingPieceAvailableMoves[i].style['stroke-width'] = '1';
              draggingPieceAvailableMoves[i].style['stroke'] = 'purple';
              draggingPieceAvailableMoves[i].setAttribute("rx", "10");
              draggingPieceAvailableMoves[i].setAttribute("ry", "10");
            }
          }
        }
        if (!draggingPiece) {
          return;
        }
        if (type === "touchend") {
          var from = draggingStartedRowCol;
          var to = {row: row, col: col};
          dragDone(from, to);
          
        } else {
          // Drag continue
          setDraggingPieceTopLeft(getSquareTopLeft(row, col));
          var centerXY = getSquareCenterXY(row, col);
        }
      }
      if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
        // drag ended
        // return the piece to it's original style (then angular will take care to hide it).
        setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col));    
        draggingPiece.style['width'] = '60%';
        draggingPiece.style['height'] = '60%';
        draggingPiece.style['top'] = '20%';
        draggingPiece.style['left'] = '20%';
        draggingPiece.style['position'] = 'absolute';
        for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
              draggingPieceAvailableMoves[i].style['stroke-width'] = '';
              draggingPieceAvailableMoves[i].style['stroke'] = '';
              draggingPieceAvailableMoves[i].setAttribute("rx", "");
              draggingPieceAvailableMoves[i].setAttribute("ry", "");
        }
        draggingStartedRowCol = null;
        draggingPiece = null;
        draggingPieceAvailableMoves = null;
      }
    }

    function setDraggingPieceTopLeft(topLeft) {
      var originalSize = getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col);
      draggingPiece.style.left = (topLeft.left - originalSize.left) + "px";
      draggingPiece.style.top = (topLeft.top - originalSize.top) + "px";
    }

    function getSquareWidthHeight() {
      return {
        width: gameArea.clientWidth / colsNum,
        height: gameArea.clientHeight / rowsNum
      };
    }

    function getSquareTopLeft(row, col) {
      var size = getSquareWidthHeight();
      return {top: row * size.height, left: col * size.width}
    }

    function getSquareCenterXY(row, col) {
      var size = getSquareWidthHeight();
      return {
        x: col * size.width + size.width / 2,
        y: row * size.height + size.height / 2
      };
    }

    function dragDone(from, to) {
      $rootScope.$apply(function () {
          dragDoneHandler(from, to);
      });
    }

    function dragDoneHandler(from, to) {
      var msg = "Dragged piece " + from.row + "x" + from.col + " to square " + to.row + "x" + to.col;
      $log.info(msg);
      // Update piece in board and make the move
      if (window.location.search === '?throwException') {
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!$scope.isYourTurn) {
        return;
      }
      // need to rotate the angle if playblack
      if($scope.rotate) {
        from.row = 7 - from.row;
        from.col = 7 - from.col;
        to.row = 7 - to.row;
        to.col = 7 - to.col;
      }
        
      $scope.deltaFrom = from;
      $scope.deltaTo = to;
      if (shouldPromote($scope.board, from, to, $scope.turnIndex)) {
        $scope.player = ($scope.turnIndex === 0 ? 'W' : 'B');
        isPromotionModalShowing[modalName] = true;
        return;
      }
      actuallyMakeMove();      
    }

    function actuallyMakeMove() {
console.log("$scope.promoteTo in actuallyMakeMove: " + JSON.stringify($scope.promoteTo));
      try {
        var move = gameLogic.createMove($scope.board, $scope.deltaFrom, $scope.deltaTo, 
          $scope.turnIndex, $scope.isUnderCheck, $scope.canCastleKing, 
          $scope.canCastleQueen, $scope.enpassantPosition, $scope.promoteTo);
        $scope.isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        $log.info(["Exception thrown when create move in position:", $scope.deltaFrom, $scope.deltaTo]);
        return;
      }
    }
    function getDraggingPieceAvailableMoves(row, col) {
      var possibleMoves = gameLogic.getPossibleMoves($scope.board, $scope.turnIndex, 
                      $scope.isUnderCheck, $scope.canCastleKing,
                      $scope.canCastleQueen, $scope.enpassantPosition);
      var draggingPieceAvailableMoves = [];
      var index = cellInPossibleMoves(row, col, possibleMoves);
      if (index !== false) {
        var availableMoves = possibleMoves[index][1];
        for (var i = 0; i < availableMoves.length; i++) {
          var availablePos = availableMoves[i];
          if($scope.rotate) {
            availablePos.row = 7 - availablePos.row;
            availablePos.col = 7 - availablePos.col;
          }
          draggingPieceAvailableMoves.push(document.getElementById("MyBackground" + 
            availablePos.row + "x" + availablePos.col));
        }
      }

      return draggingPieceAvailableMoves;
    }

    function isValidToCell(turnIndex, row, col) {
      var opponent = turnIndex === 0 ? 'B' : 'W';
      return $scope.board[row][col] === '' || 
              $scope.board[row][col].charAt(0) === opponent;
    }

    $scope.isSelected = function(row, col) {
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var turn = $scope.turnIndex === 0 ? 'W' : 'B';

      return draggingStartedRowCol && draggingStartedRowCol.row === row && 
              draggingStartedRowCol.col === col && $scope.board[row][col].charAt(0) === turn;
    };

    $scope.shouldShowImage = function (row, col) {
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var cell = $scope.board[row][col];
      return cell !== "";
    };
    $scope.getImageSrc = function (row, col) {
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var cell = $scope.board[row][col];
      return getPieceKind(cell);
    };

    function getPieceKind(cell){
      switch(cell) {
        case 'WK': return 'imgs/Chess-WKing.png';
        case 'WQ': return 'imgs/Chess-WQueen.png';
        case 'WR': return 'imgs/Chess-WRook.png';
        case 'WB': return 'imgs/Chess-WBishop.png';
        case 'WN': return 'imgs/Chess-WKnight.png';
        case 'WP': return 'imgs/Chess-WPawn.png';
        case 'BK': return 'imgs/Chess-BKing.png';
        case 'BQ': return 'imgs/Chess-BQueen.png';
        case 'BR': return 'imgs/Chess-BRook.png';
        case 'BB': return 'imgs/Chess-BBishop.png';
        case 'BN': return 'imgs/Chess-BKnight.png';
        case 'BP': return 'imgs/Chess-BPawn.png';
        default: return '';
      }
    }

    $scope.getPieceKindInId = function(row, col) {
      if ($scope.board) {
        if ($scope.rotate) {
          row = 7 - row;
          col = 7 - col;
        }
        return $scope.board[row][col];
      }    
    };

    $scope.getBackgroundSrc = function(row, col) {
      if (isLight(row, col)) { return 'imgs/Chess-lightCell.svg'; }
      else { return 'imgs/Chess-darkCell.svg'; }
    };

    $scope.getBackgroundFill = function(row, col) {
      var isLightSquare = isLight(row, col);
      return isLightSquare ? 'rgb(243, 243, 255)' : 'rgb(208, 208, 230)';
    };

    function isLight(row, col) {
      var isEvenRow = false,
          isEvenCol = false;

      isEvenRow = row % 2 === 0;
      isEvenCol = col % 2 === 0;

      return isEvenRow && isEvenCol || !isEvenRow && !isEvenCol;
    }

    $scope.canSelect = function(row, col) {
      if (!$scope.board) { return true; }
      if ($scope.isYourTurn) {
        if ($scope.rotate) {
          row = 7 - row;
          col = 7 - col;
        }
        var turn = $scope.turnIndex === 0 ? 'W' : 'B';
        if ($scope.board[row][col].charAt(0) === turn) {
          if (!$scope.isUnderCheck) { $scope.isUnderCheck = [false, false]; }
          if (!$scope.canCastleKing) { $scope.canCastleKing = [true, true]; }
          if (!$scope.canCastleQueen) { $scope.canCastleQueen = [true, true]; }
          if (!$scope.enpassantPosition) { $scope.enpassantPosition = {row: null, col: null}; }
          var possibleMoves = gameLogic.getPossibleMoves($scope.board, $scope.turnIndex, 
                      $scope.isUnderCheck, $scope.canCastleKing,
                      $scope.canCastleQueen, $scope.enpassantPosition);
          return cellInPossibleMoves(row, col, possibleMoves) !== false;
        } else {
          return false;
        }
      }     
    };

    function cellInPossibleMoves(row, col, possibleMoves) {
      var cell = {row: row, col: col};  
      for (var i = 0; i < possibleMoves.length; i++) {
        if (angular.equals(cell, possibleMoves[i][0])) {
          return i;
        }
      }  
      return false;     
    }

    $scope.isBlackPiece = function(row, col) {
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      return $scope.board[row][col].charAt(0) === 'B';
    };

    $scope.isWhitePiece = function(row, col) {
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      return $scope.board[row][col].charAt(0) === 'W';
    };

    function shouldPromote(board, deltaFrom, deltaTo, turnIndex) {
      var myPawn = (turnIndex === 0 ? 'WP' : 'BP');
      return myPawn === board[deltaFrom.row][deltaFrom.col] && 
              (deltaTo.row === 0 || deltaTo.row === 7);
    }

    $scope.isModalShown = function (modalName) {
      return isPromotionModalShowing[modalName];
    };

    $scope.updatePromoteTo = function() {
      var radioPromotions = document.getElementsByName('promotions');
      for (var i = 0; i < radioPromotions.length; i++) {
        if (radioPromotions[i].checked) {
          $scope.promoteTo = radioPromotions[i].value;
          break;
        }
      }
      // alert($scope.promoteTo);
      dismissModal(modalName);     
      actuallyMakeMove();
    };

    function dismissModal(modalName) {
      delete isPromotionModalShowing[modalName];
    }

    function getIntegersTill(number) {
      var res = [];
      for (var i = 0; i < number; i++) {
        res.push(i);
      }
      return res;
    }

    $scope.rows = getIntegersTill(rowsNum);
    $scope.cols = getIntegersTill(colsNum);
    $scope.rowsNum = rowsNum;
    $scope.colsNum = colsNum;

    gameService.setGame({
      gameDeveloperEmail: "xzzhuchen@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);

})();;angular.module('myApp').factory('aiService',
    ["alphaBetaService", "gameLogic",
      function(alphaBetaService, gameLogic) {

  'use strict';

  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  function createComputerMove(startingState, playerIndex, alphaBetaLimits) {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    // Recal that a TicTacToe move has 3 operations:
    // 0) endMatch or setTurn
    // 1) {set: {key: 'board', value: ...}}
    // 2) {set: {key: 'delta', value: ...}}]
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: startingState.board}},
          {set: {key: 'isUnderCheck', value: startingState.isUnderCheck}},
          {set: {key: 'canCastleKing', value: startingState.canCastleKing}},
          {set: {key: 'canCastleQueen', value: startingState.canCastleQueen}},
          {set: {key: 'enpassantPosition', value: startingState.enpassantPosition}}],    // startingState
        playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null,
        alphaBetaLimits);
  }

  function getStateScoreForIndex0(move) { // alphaBetaService also passes playerIndex, in case you need it: getStateScoreForIndex0(move, playerIndex)
    if (move[0].endMatch) {
      var endMatchScores = move[0].endMatch.endMatchScores;
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move, playerIndex) {
    var board = move[1].set.value,
        isUnderCheck = move[2].set.value,
        canCastleKing = move[3].set.value,
        canCastleQueen = move[4].set.value,
        enpassantPosition = move[5].set.value;
    var possibleDeltas = gameLogic.getPossibleMoves(board, playerIndex, isUnderCheck,
        canCastleKing, canCastleQueen, enpassantPosition);
    var possibleMoves = [];
    for (var i = 0; i < possibleDeltas.length; i++) {
      var deltaFromAndTos = possibleDeltas[i];
      var deltaFrom = deltaFromAndTos[0],
          deltaTos = deltaFromAndTos[1];
      for (var j = 0; j < deltaTos.length; j++) {
        var deltaTo = deltaTos[j];
        try {
          console.log("going to create move: " + JSON.stringify(deltaFrom) + " --> " + 
            JSON.stringify(deltaTo));
          possibleMoves.push(gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex,
            isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition));
        } catch (e) {
          // cannot create move with this possible delta, should continue
        }
      }     
    }
    return possibleMoves;
  }

  function getDebugStateToString(move) {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }

  return {createComputerMove: createComputerMove};
}]);