(function(){

  angular.module('myApp')
  .controller('ChessCtrl',
      ['$scope', '$log', '$timeout',
       'gameService', 'gameLogic', 'resizeGameAreaService',
      function ($scope, $log, $timeout,
        gameService, gameLogic,  resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(1);

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
    }

    // Before getting any updateUI, we show an empty board to a viewer (so you can't perform moves).
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});

    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        var move = gameLogic.createMove($scope.board, row, col, $scope.turnIndex);
        $scope.isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    $scope.shouldShowImage = function (row, col) {
      var cell = $scope.board[row][col];
      return cell !== "";
    };
    $scope.getImageSrc = function (row, col) {
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

    $scope.shouldSlowlyAppear = function (row, col) {
      return $scope.delta !== undefined &&
          $scope.delta.row === row && $scope.delta.col === col;
    };

    /**
     * return the square object of the ui state.
     * @returns square object of the ui state
     */
    $scope.getSquare = function(row, col) {
      // If the board need to rotate 180 degrees, simply change the row and
      // column for the UI... ($scope.uiState remains intact)
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var index = $scope.convertDeltaToUIIndex(row, col);
      return $scope.uiState[index];
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