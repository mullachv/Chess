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
   * 4 - setIsUnderCheck: {set: {key: 'isUnderCheck', value: isUnderCheck}},
   * 5 - setCanCastleKing: {set: {key: 'canCastleKing', value: {[true, true]}}},
   * 6 - setCanCaseltQueen: {set: {key: 'canCastleQueen', value: {[true, true]}}},
   * 7 - setEnpassantPosition: {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
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
   *       {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
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
      var curPlayer = (turnIndex === 0 ? 'W' : 'B');

      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          if (board[i][j] !== '' && board[i][j].charAt(0) === curPlayer) {
            var curPiece = board[i][j];
            var curPos = {row: i, col: j};
            switch (curPiece.charAt(1)) {
              case 'K': 
                if (canKingMoveAnywhere(board, turnIndex, curPos, 
                    isUnderCheck, canCastleKing, canCastleQueen)) 
                  return false; 
                break;
              case 'Q': 
                if (canQueenMoveAnywhere(board, turnIndex, curPos))
                  return false; 
                break;
              case 'R': 
                if (canRookMoveAnywhere(board, turnIndex, curPos))
                  return false; 
                break;
              case 'B': 
                if (canBishopMoveAnywhere(board, turnIndex, curPos))
                  return false;
                break;
              case 'N': 
                if (canKnightMoveAnywhere(board, turnIndex, curPos))
                  return false;
                break;
              case 'P': 
                if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition))
                  return false;
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
      var curPlayer = (turnIndex === 0 ? 'W' : 'B');
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
                  if (canQueenMoveAnywhere(board, turnIndex, curPos, canCastleKing, canCastleQueen))
                    return ''; 
                  break;
                case 'R': 
                  if (canRookMoveAnywhere(board, turnIndex, curPos))
                    return ''; 
                  break;
                case 'B':
                  if (canBishopMoveAnywhere(board, turnIndex, curPos))
                    return '';
                  break;
                case 'N': 
                  if (canKnightMoveAnywhere(board, turnIndex, curPos))
                    return '';
                  break;
                case 'P': 
                  if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition))
                    return '';
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
                      isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition) {
    if (board === undefined) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    // initialize all variables
    if (isUnderCheck === undefined) isUnderCheck = [false, false];
    if (canCastleKing === undefined) canCastleKing = [true, true];
    if (canCastleQueen === undefined) canCastleQueen = [true, true];
    if (enpassantPosition === undefined) enpassantPosition = {row: undefined, col: undefined};

    var destination = board[deltaTo.row][deltaTo.col];

    if (destination !== '' && destination.charAt(0) === (turnIndexBeforeMove == 0 ? 'W' : 'B')) {
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
    
    var boardAfterMove = angular.copy(board);
    var piece = board[deltaFrom.row][deltaFrom.col];
    var turn = turnIndexBeforeMove === 0 ? 'W' : 'B';

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
          canCastleKing[turnIndexBeforeMove] = false;
          canCastleQueen[turnIndexBeforeMove] = false;
        }
        else if (isCastlingQueen(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleQueen)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col + 1] = turn + 'R';
          boardAfterMove[deltaTo.row][0] = '';
          canCastleKing[turnIndexBeforeMove] = false;
          canCastleQueen[turnIndexBeforeMove] = false;
        }
        else if(canKingMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for king.");
        }
        break;
      case 'Q':
        if(canQueenMove(board, deltaFrom, deltaTo)) {
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
            (Math.abs(deltaFrom.col - enpassantPosition.col) === 1)) {
            boardAfterMove[enpassantPosition.row][enpassantPosition.col] = '';
            enpassantPosition.row = undefined;
            enpassantPosition.col = undefined;
          }
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';

          // check for enpassant
          if (turn === "W" && deltaTo.row === 4) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "BP" || 
              boardAfterMove[deltaTo.row][deltaTo.col + 1] === "BP") {
              enpassantPosition.row = deltaTo.row;
              enpassantPosition.col = deltaTo.col;
            }          
          }
          if (turn === "B" && deltaTo.row === 3) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "WP" || 
              boardAfterMove[deltaTo.row][deltaTo.col + 1] === "WP") {
              enpassantPosition.row = deltaTo.row;
              enpassantPosition.col = deltaTo.col;
            }
          }

          // check for promotion
          if (deltaTo.row === 0 || deltaTo.row === 7) {
            boardAfterMove[deltaTo.row][deltaTo.col] = (turn === "W" ? "WQ" : "BQ");
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
      isUnderCheck[turnIndexAfterMove] = true;
    }
    var winner = getWinner(boardAfterMove, turnIndexAfterMove, isUnderCheck, 
                  canCastleKing, canCastleQueen, enpassantPosition);
    // console.log("winner: " + winner);
    var firstOperation;
    if (winner !== '' || isTie(boardAfterMove, turnIndexAfterMove, isUnderCheck, 
        canCastleKing, canCastleQueen, enpassantPosition)) {
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
            {set: {key: 'isUnderCheck', value: isUnderCheck}},
            {set: {key: 'canCastleKing', value: canCastleKing}},
            {set: {key: 'canCastleQueen', value: canCastleQueen}},
            {set: {key: 'enpassantPosition', value: enpassantPosition}},
            ];
  }

  /**
  * Returns true if the conditions of castle to king side satisfied
  */
  function isCastlingKing(board, deltaFrom, deltaTo, turnIndex, canCastleKing) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col,
        caslingRow = (turnIndex === 0 ? 7 : 0),
        turn = (turnIndex === 0 ? 'W' : 'B');
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) return false;
    if (canCastleKing[turnIndex] && fromRow === caslingRow && 
      fromCol === 4 && toCol - fromCol === 2) {
      for (var j = 5; j <= 6; j++) {
        if (board[fromRow][j] !== '') return false;
        if (isPositionUnderAttack(board, turnIndex, {row: fromRow, col: j})) return false;
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
        toRow = deltaTo.row,
        toCol = deltaTo.col,
        caslingRow = (turnIndex === 0 ? 7 : 0),
        turn = (turnIndex === 0 ? 'W' : 'B');
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) return false;
    if (canCastleQueen[turnIndex] && fromRow === caslingRow && 
      fromCol === 4 && fromCol - toCol === 2) {
      for (var j = 1; j <= 3; j++) {
        if (board[fromRow][j] !== '') return false;
        if (isPositionUnderAttack(board, turnIndex, {row: fromRow, col: j})) return false;
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
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) return false;
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) return false;
        
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
            if (moveAndCheck(board, turnIndex, startPos, curPos))
              destinations.push(curPos);
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
    var opponent = getOpponent(turnIndex);

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
    var row = position.row;
    var col = position.col;
    var opponent = getOpponent(turnIndex);
    var attPositions = [];

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (board[i][j] !== '' && board[i][j].charAt(0) === opponent) {
          var opponentPiece = board[i][j];
          var curPos = {row: i, col: j};
          switch (opponentPiece.charAt(1)) {
            case 'K': if (canKingMove(board, curPos, position, 1 - turnIndex)) 
                        attPositions.push(curPos); break;
            case 'Q': if (canQueenMove(board, curPos, position, 1 - turnIndex)) 
                        attPositions.push(curPos); break;
            case 'R': if (canRookMove(board, curPos, position, 1 - turnIndex)) 
                        attPositions.push(curPos); break;
            case 'B': if (canBishopMove(board, curPos, position, 1 - turnIndex)) 
                        attPositions.push(curPos); break;
            case 'N': if (canKnightMove(board, curPos, position, 1 - turnIndex)) 
                        attPositions.push(curPos); break;
            case 'P': if (canPawnMove(board, curPos, position, 1 - turnIndex)) 
                        attPositions.push(curPos); break;
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
        if (board[i][j] === kingPiece) return {row: i, col: j};
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
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) return false;
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) return false;
        
    if (fromRow === toRow) {
      if (fromCol === toCol) return false;
      for (var i = (fromCol < toCol ? fromCol + 1 : toCol + 1); i < (fromCol < toCol ? toCol : fromCol); i++) {
        if (board[fromRow][i] !== '') return false;
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    else if (fromCol === toCol) {
      if (fromRow === toRow) return false;
      for (var i = (fromRow < toRow ? fromRow + 1 : toRow + 1); i < (fromRow < toRow ? toRow : fromRow); i++) {
        if (board[i][fromCol] !== '') return false;
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
      if (canRookMove(board, startPos, endPos1, turnIndex)) toPos.push(endPos1);
      if (canRookMove(board, startPos, endPos2, turnIndex)) toPos.push(endPos2);
      if (canRookMove(board, startPos, endPos3, turnIndex)) toPos.push(endPos3);
      if (canRookMove(board, startPos, endPos4, turnIndex)) toPos.push(endPos4);
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
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) return false;
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) return false;
        
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
        if (cell !== '') return false;
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
      if (canBishopMove(board, startPos, endPos1, turnIndex)) toPos.push(endPos1);
      if (canBishopMove(board, startPos, endPos2, turnIndex)) toPos.push(endPos2);
      if (canBishopMove(board, startPos, endPos3, turnIndex)) toPos.push(endPos3);
      if (canBishopMove(board, startPos, endPos4, turnIndex)) toPos.push(endPos4);
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
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) return false;
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) return false;

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
        if (canKnightMove(board, startPos, endPos1, turnIndex)) toPos.push(endPos1);
        if (canKnightMove(board, startPos, endPos2, turnIndex)) toPos.push(endPos2);
        if (canKnightMove(board, startPos, endPos3, turnIndex)) toPos.push(endPos3);
        if (canKnightMove(board, startPos, endPos4, turnIndex)) toPos.push(endPos4);
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
        turn = board[fromRow][fromCol].charAt(0);
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) return false;
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) return false;

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
        enpassantPosition.row && enpassantPosition.col)) {
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
        turn = (turnIndex === 0 ? 'W' : 'B');

    for (var j = fromCol - 1; j <= fromCol + 1; j++) {
      var endRow = (turn === 'W' ? fromRow - 1 : fromRow + 1);
      var endPos = {row: endRow, col: j};
      if (canPawnMove(board, startPos, endPos, turnIndex)) toPos.push(endPos);
    }
    var endRow = (turn === 'W' ? fromRow - 2 : fromRow + 2);
    var endPos2 = {row:endRow, col: fromCol};
    if (canPawnMove(board, startPos, endPos2, turnIndex)) toPos.push(endPos2);
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
    if (board[toRow][toCol] === opponent + 'K') return true;
    var boardAfterMove = angular.copy(board);
    boardAfterMove[toRow][toCol] = boardAfterMove[fromRow][fromCol];
    boardAfterMove[fromRow][fromCol] = '';
    if (isUnderCheckByPositions(boardAfterMove, turnIndex)) return false;
    return true;
  }

  /**
  * Returns opponent initial
  */
  function getOpponent(turnIndex) {
    return (turnIndex === 0 ? 'B' : 'W');
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

      var expectedMove = createMove(board, deltaFrom, deltaTo, turnIndexBeforeMove, 
                          isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
            console.log("jane!!!!");
            console.log(expectedMove);
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
    var possibleMoves = [],
        turn = (turnIndex === 0 ? 'W' : 'B');
    for (var i = 0; i < 7; i++) {
      for (var j = 0; j < 7; j++) {
        var piece = board[i][j];
        if (piece !== '' && piece.charAt(0) === turn) {
          var startPos = {row: i, col: j};
          switch(piece.charAt(1)) {
            case 'K': 
              possibleMoves.concat(
                getKingPossibleMoves(board, turnIndex, startPos, isUnderCheck, canCastleKing, canCastleQueen)); 
              break;
            case 'Q': 
              possibleMoves.concat(getQueenPossibleMoves(board, turnIndex, startPos));
              break;
            case 'R':
              possibleMoves.concat(getRookPossibleMoves(board, turnIndex, startPos));
              break;
            case 'B':
              possibleMoves.concat(getBishopPossibleMoves(board, turnIndex, startPos));
              break;
            case 'N':
              possibleMoves.concat(getKnightPossibleMoves(board, turnIndex, startPos));
              break;
            case 'P':
              possibleMoves.concat(getPawnPossibleMoves(board, turnIndex, startPost, enpassantPosition));
              break;
          }
        }
      }
    }
    return possibleMoves;
  }

  return {
      getInitialBoard: getInitialBoard,
      getPossibleMoves: getPossibleMoves,
      createMove: createMove,
      isMoveOk: isMoveOk
  };

});