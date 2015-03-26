(function(){
  'use strict';
  angular.module('myApp')
  .controller('ChessCtrl',
      ['$scope', '$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 
       'resizeGameAreaService', '$translate',
      function ($scope, $log, $timeout,
        gameService, stateService, gameLogic, 
        resizeGameAreaService, $translate) {

    resizeGameAreaService.setWidthToHeight(1);

    var selectedCells = [];       // record the clicked cells

    function sendComputerMove() {
      var possibleMoves = gameLogic.getPossibleMoves($scope.board, $scope.turnIndex, 
            $scope.isUnderCheck, $scope.canCastleKing,
            $scope.canCastleQueen, $scope.enpassantPosition);
      if (possibleMoves.length) {
        var index1 = Math.floor(Math.random() * possibleMoves.length);
        var pm = possibleMoves[index1];
        var index2 = Math.floor(Math.random() * pm[1].length);
        $scope.deltaFrom = pm[0];
        $scope.deltaTo = pm[1][index2];

        gameService.makeMove(gameLogic.createMove($scope.board, $scope.deltaFrom, $scope.deltaTo, 
            $scope.turnIndex, $scope.isUnderCheck, $scope.canCastleKing, 
            $scope.canCastleQueen, $scope.enpassantPosition));
      } else {
        $log.info("no there are no possible moves!");
      }   
    }

    /**
     * Convert the delta to UI state index
     * @param row
     * @param col
     * @returns {*}
     */
    $scope.convertDeltaToUIIndex = function(row, col) {
      return row * 8 + col;
    };

    function updateUI(params) {

      $scope.board = params.stateAfterMove.board;
      $scope.deltaFrom = params.stateAfterMove.deltaFrom;
      $scope.deltaTo = params.stateAfterMove.deltaTo;
      $scope.isUnderCheck = params.stateAfterMove.isUnderCheck;
      $scope.canCastleKing = params.stateAfterMove.canCastleKing;
      $scope.canCastleQueen = params.stateAfterMove.canCastleQueen;
      $scope.enpassantPosition = params.stateAfterMove.enpassantPosition;


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

    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);

      // to test encoding a stack trace with sourcemap
      if (window.location.search === '?throwException') {
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!$scope.isYourTurn) {
        return;
      }
      if($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }

      if (selectedCells.length === 1) {
        if (isValidToCell($scope.turnIndex, row, col)) {
          selectedCells.push({row: row, col: col});
        } else {
          selectedCells[0] = {row: row, col: col};
        }
      } else {
        selectedCells[0] = {row: row, col: col};
      }

      // when from and to cell are clicked, we can make a move
      if (selectedCells.length === 2) {
        try {
          $scope.deltaFrom = selectedCells[0];
          $scope.deltaTo = selectedCells[1];

// console.log("game.js CreateMove arguments: " + angular.toJson([
// $scope.board, $scope.deltaFrom, $scope.deltaTo, 
//             $scope.turnIndex, $scope.isUnderCheck, $scope.canCastleKing, 
//             $scope.canCastleQueen, $scope.enpassantPosition
// ]));

          var move = gameLogic.createMove($scope.board, $scope.deltaFrom, $scope.deltaTo, 
            $scope.turnIndex, $scope.isUnderCheck, $scope.canCastleKing, 
            $scope.canCastleQueen, $scope.enpassantPosition);
          $scope.isYourTurn = false; // to prevent making another move
          gameService.makeMove(move);
        } catch (e) {
          $log.info(["Exception throwned when create move in position:", row, col]);
          return;
        } finally {
          selectedCells = [];
        }
      }
    };

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

      return selectedCells[0] && selectedCells[0].row === row && 
              selectedCells[0].col === col && $scope.board[row][col].charAt(0) === turn;
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
        case 'WK': return 'imgs/Chess-whiteKing.png';
        case 'WQ': return 'imgs/Chess-whiteQueen.png';
        case 'WR': return 'imgs/Chess-whiteRook.png';
        case 'WB': return 'imgs/Chess-whiteBishop.png';
        case 'WN': return 'imgs/Chess-whiteKnight.png';
        case 'WP': return 'imgs/Chess-whitePawn.png';
        case 'BK': return 'imgs/Chess-blackKing.png';
        case 'BQ': return 'imgs/Chess-blackQueen.png';
        case 'BR': return 'imgs/Chess-blackRook.png';
        case 'BB': return 'imgs/Chess-blackBishop.png';
        case 'BN': return 'imgs/Chess-blackKnight.png';
        case 'BP': return 'imgs/Chess-blackPawn.png';
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
      if (isLight(row, col)) { return 'imgs/Chess-lightCell.png'; }
      else { return 'imgs/Chess-darkCell.png'; }
    };

    function isLight(row, col) {
      var isEvenRow = false,
          isEvenCol = false;

      isEvenRow = row % 2 === 0;
      isEvenCol = col % 2 === 0;

      return isEvenRow && isEvenCol || !isEvenRow && !isEvenCol;
    }

    $scope.canSelect = function(row, col) {
      if ($scope.isYourTurn) {
        if ($scope.rotate) {
          row = 7 - row;
          col = 7 - col;
        }
        var turn = $scope.turnIndex === 0 ? 'W' : 'B';
        return $scope.board[row][col].charAt(0) === turn;
      }     
    };

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

    gameService.setGame({
      gameDeveloperEmail: "xzzhuchen@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);


})();