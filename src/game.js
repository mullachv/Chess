(function(){
  
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

    console.log("Translation of 'RULES_OF_CHESS' is " + $translate('RULES_OF_CHESS'));

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
          var curPiece = $scope.board[r_row][r_col];
          if (curPiece && curPiece.charAt(0) === getTurn($scope.turnIndex)) {            
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
        $scope.player = getTurn($scope.turnIndex);
        isPromotionModalShowing[modalName] = true;
        return;
      }
      actuallyMakeMove();      
    }

    function actuallyMakeMove() {
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
      var opponent = getOpponent(turnIndex);
      return $scope.board[row][col] === '' || 
              $scope.board[row][col].charAt(0) === opponent;
    }

    $scope.isSelected = function(row, col) {
      if ($scope.rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var turn = getTurn($scope.turnIndex);

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
        var turn = getTurn($scope.turnIndex);
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

    function getTurn(turnIndex) {
      return turnIndex === 0 ? 'W' : 'B';
    }

    function getOpponent(turnIndex) {
      return turnIndex === 0 ? 'B' : 'W';
    }

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

})();