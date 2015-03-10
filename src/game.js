(function(){

  angular.module('myApp')
  .controller('ChessCtrl',
      ['$scope', '$log', '$timeout',
       'gameService', 'gameLogic', 'resizeGameAreaService',
      function ($scope, $log, $timeout,
        gameService, gameLogic,  resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(1);

    var board = [],               // the board that we are playing without any rotate
        selectedCells = [];       // record the clicked cells

    function sendComputerMove() {
      gameService.makeMove(aiService.createComputerMove($scope.board, $scope.turnIndex,
          // at most 1 second for the AI to choose a move (but might be much quicker)
          {millisecondsLimit: 1000}));
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
      $scope.delta = params.stateAfterMove.delta;
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
console.log($scope.turnIndex);
console.log(selectedCells);

      // when from and to cell are clicked, we can make a move
      if (selectedCells.length === 2) {
        try {
          var move = gameLogic.createMove($scope.board, selectedCells[0], selectedCells[1], 
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
      var opponent = (turnIndex === 0 ? 'B' : 'W');
      return $scope.board[row][col] === '' || 
              $scope.board[row][col].charAt(0) === opponent;
    }


    function getRotateBoard(board) {
      var boardAfterRotate = angular.copy(board);
      for (var i = 0; i <= 7; i++) {
        for (var j = 0; j <= 7; j++) {
          boardAfterRotate[i][j] = board[7 - i][7 - j];
        }
      }
      return boardAfterRotate;
    };

    $scope.isSelected = function(row, col) {
      var turn = ($scope.turnIndex === 0 ? 'W' : 'B');

      return selectedCells[0] && selectedCells[0].row === row && 
              selectedCells[0].col === col && $scope.board[row][col].charAt(0) === turn;
    };

    $scope.shouldShowImage = function (row, col) {
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
        case 'WK': return 'img/Chess-whiteKing.png';
        case 'WQ': return 'img/Chess-whiteQueen.png';
        case 'WR': return 'img/Chess-whiteRook.png';
        case 'WB': return 'img/Chess-whiteBishop.png';
        case 'WN': return 'img/Chess-whiteKnight.png';
        case 'WP': return 'img/Chess-whitePawn.png';
        case 'BK': return 'img/Chess-blackKing.png';
        case 'BQ': return 'img/Chess-blackQueen.png';
        case 'BR': return 'img/Chess-blackRook.png';
        case 'BB': return 'img/Chess-blackBishop.png';
        case 'BN': return 'img/Chess-blackKnight.png';
        case 'BP': return 'img/Chess-blackPawn.png';
        default: return '';
      }
    }

    $scope.getBackgroundSrc = function(row, col) {
      if (isLight(row, col)) return 'img/Chess-lightCell.png';
      else return 'img/Chess-darkCell.png';
    };

    function isLight(row, col) {
      var isEvenRow = false,
          isEvenCol = false;

      isEvenRow = (row % 2 === 0);
      isEvenCol = (col % 2 === 0);

      return (isEvenRow && isEvenCol || !isEvenRow && !isEvenCol);
    };

    $scope.shouldSlowlyAppear = function (row, col) {
      return $scope.delta !== undefined &&
          $scope.delta.row === row && $scope.delta.col === col;
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