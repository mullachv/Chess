module game {

      var selectedCells:any = [];       // record the clicked cells
      var gameArea:any = document.getElementById("gameArea");
      export let rowsNum = 8;
      export let colsNum = 8;
      var draggingStartedRowCol:any = null; // The {row: YY, col: XX} where dragging started.
      var draggingPiece:any = null;
      var draggingPieceAvailableMoves:any = null;
      var nextZIndex = 61;
      var isPromotionModalShowing:any = {};
      var modalName = 'promotionModal';

      //var $log = log;
      //var $scope = $rootScope;
      //var $translate = translate;

      var animationEnded = false;
      var isComputerTurn = false;
      var board:any = null;
      var turnIndex = 0;
      var isUnderCheck:any = null;
      var canCastleKing:any = null;
      var canCastleQueen:any = null;
      var enpassantPosition:any = null;
      var deltaFrom:any = null;
      var deltaTo:any = null;
      var promoteTo:any = null;
      var isYourTurn:any = null;
      var rotate:any = null;
      var player:any = null;

  export function init() {
    console.log("Translation of 'RULES_OF_CHESS' is " + translate('RULES_OF_CHESS'));
    resizeGameAreaService.setWidthToHeight(1);
    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera

    dragAndDropService.addDragListener("gameArea", handleDragEvent);
    gameArea = document.getElementById("gameArea");

  }

  function animationEndedCallback() {
    $rootScope.$apply(function () {
      log.info("Animation ended");
      animationEnded = true;
      if (isComputerTurn) {
        sendComputerMove();
      }
    });
  }

    function sendComputerMove() {
      var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex,
            isUnderCheck, canCastleKing,
            canCastleQueen, enpassantPosition);
      if (possibleMoves.length) {
        var index1 = Math.floor(Math.random() * possibleMoves.length);
        var pm = possibleMoves[index1];
        var index2 = Math.floor(Math.random() * pm[1].length);
        deltaFrom = pm[0];
        deltaTo = pm[1][index2];

        gameService.makeMove(gameLogic.createMove(board, deltaFrom, deltaTo,
            turnIndex, isUnderCheck, canCastleKing,
            canCastleQueen, enpassantPosition, promoteTo));
      } else {
        console.log("no there are no possible moves!");
      }
    }

    function updateUI(params:any) {

      board = params.stateAfterMove.board;
      deltaFrom = params.stateAfterMove.deltaFrom;
      deltaTo = params.stateAfterMove.deltaTo;
      isUnderCheck = params.stateAfterMove.isUnderCheck;
      canCastleKing = params.stateAfterMove.canCastleKing;
      canCastleQueen = params.stateAfterMove.canCastleQueen;
      enpassantPosition = params.stateAfterMove.enpassantPosition
      promoteTo = params.stateAfterMove.promoteTo;


      if (board === undefined) {
        board = gameLogic.getInitialBoard();
      }

      isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      turnIndex = params.turnIndexAfterMove;


      // Is it the computer's turn?
      if (isYourTurn &&
          params.playersInfo[params.yourPlayerIndex].playerId === '') {
        isYourTurn = false; // to make sure the UI won't send another move.
        // Waiting 0.5 seconds to let the move animation finish; if we call aiService
        // then the animation is paused until the javascript finishes.
        $timeout(sendComputerMove, 500);
      }

      // If the play mode is not pass and play then "rotate" the board
      // for the player. Therefore the board will always look from the
      // point of view of the player in single player mode...
      if (params.playMode === "playBlack") {
        rotate = true;
      } else {
        rotate = false;
      }

      // clear up the selectedCells and waiting for next valid move
      selectedCells = [];
    }

    //window.e2e_test_stateService = stateService;
    function handleDragEvent(type:any, clientX:any, clientY:any) {
      // Center point in gameArea
      var x = clientX - gameArea.offsetLeft;
      var y = clientY - gameArea.offsetTop;
      var row:any, col:any;
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
        var col:any = Math.floor(colsNum * x / gameArea.clientWidth);
        var row:any = Math.floor(rowsNum * y / gameArea.clientHeight);
        var r_row = row;
        var r_col = col;

        if (rotate) {
          r_row = 7 - r_row;
          r_col = 7 - r_col;
        }

        if (type === "touchstart" && !draggingStartedRowCol) {
          // drag started
          var curPiece = board[r_row][r_col];
          if (curPiece && curPiece.charAt(0) === getTurn(turnIndex)) {
            draggingStartedRowCol = {row: row, col: col};
            draggingPiece = document.getElementById("e2e_test_img_" +
              getPieceKindInId(row, col) + '_' +
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

    function setDraggingPieceTopLeft(topLeft:any) {
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

    function getSquareTopLeft(row:any, col:any) {
      var size = getSquareWidthHeight();
      return {top: row * size.height, left: col * size.width}
    }

    function getSquareCenterXY(row:any, col:any) {
      var size = getSquareWidthHeight();
      return {
        x: col * size.width + size.width / 2,
        y: row * size.height + size.height / 2
      };
    }

    function dragDone(from:any, to:any) {
      $rootScope.$apply(function () {
          dragDoneHandler(from, to);
      });
    }

    function dragDoneHandler(from:any, to:any) {
      var msg = "Dragged piece " + from.row + "x" + from.col + " to square " + to.row + "x" + to.col;
      console.log(msg);
      // Update piece in board and make the move
      if (window.location.search === '?throwException') {
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!isYourTurn) {
        return;
      }
      // need to rotate the angle if playblack
      if(rotate) {
        from.row = 7 - from.row;
        from.col = 7 - from.col;
        to.row = 7 - to.row;
        to.col = 7 - to.col;
      }

      deltaFrom = from;
      deltaTo = to;
      if (shouldPromote(board, from, to, turnIndex)) {
        player = getTurn(turnIndex);
        isPromotionModalShowing[modalName] = true;
        return;
      }
      actuallyMakeMove();
    }

    function actuallyMakeMove() {
      try {
        var move = gameLogic.createMove(board, deltaFrom, deltaTo,
          turnIndex, isUnderCheck, canCastleKing,
          canCastleQueen, enpassantPosition, promoteTo);
        isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        console.log(["Exception thrown when create move in position:", deltaFrom, deltaTo]);
        return;
      }
    }
    function getDraggingPieceAvailableMoves(row:any, col:any) {
      var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex,
                      isUnderCheck, canCastleKing,
                      canCastleQueen, enpassantPosition);
      var draggingPieceAvailableMoves:any = [];
      var index = cellInPossibleMoves(row, col, possibleMoves);
      if (index !== false) {
        var availableMoves = possibleMoves[index][1];
        for (var i = 0; i < availableMoves.length; i++) {
          var availablePos = availableMoves[i];
          if(rotate) {
            availablePos.row = 7 - availablePos.row;
            availablePos.col = 7 - availablePos.col;
          }
          draggingPieceAvailableMoves.push(document.getElementById("MyBackground" +
            availablePos.row + "x" + availablePos.col));
        }
      }

      return draggingPieceAvailableMoves;
    }

    function isValidToCell(turnIndex:any, row:any, col:any) {
      var opponent = getOpponent(turnIndex);
      return board[row][col] === '' ||
              board[row][col].charAt(0) === opponent;
    }

    export let isSelected = function(row:any, col:any) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var turn = getTurn(turnIndex);

      return draggingStartedRowCol && draggingStartedRowCol.row === row &&
              draggingStartedRowCol.col === col && board[row][col].charAt(0) === turn;
    };

    export let shouldShowImage = function (row:any, col:any) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var cell = board[row][col];
      return cell !== "";
    };
    export let getImageSrc = function (row:any, col:any) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      var cell = board[row][col];
      return getPieceKind(cell);
    };

    function getPieceKind(cell:any){
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

    export let getPieceKindInId = function(row:any, col:any) {
      if (board) {
        if (rotate) {
          row = 7 - row;
          col = 7 - col;
        }
        return board[row][col];
      }
    };

    export let getBackgroundSrc = function(row:any, col:any) {
      if (isLight(row, col)) { return 'imgs/Chess-lightCell.svg'; }
      else { return 'imgs/Chess-darkCell.svg'; }
    };

    export let getBackgroundFill = function(row:any, col:any) {
      var isLightSquare = isLight(row, col);
      return isLightSquare ? 'rgb(243, 243, 255)' : 'rgb(208, 208, 230)';
    };

    function isLight(row:any, col:any) {
      var isEvenRow = false,
          isEvenCol = false;

      isEvenRow = row % 2 === 0;
      isEvenCol = col % 2 === 0;

      return isEvenRow && isEvenCol || !isEvenRow && !isEvenCol;
    }

    export let canSelect = function(row:any, col:any) {
      if (!board) { return true; }
      if (isYourTurn) {
        if (rotate) {
          row = 7 - row;
          col = 7 - col;
        }
        var turn = getTurn(turnIndex);
        if (board[row][col].charAt(0) === turn) {
          if (!isUnderCheck) { isUnderCheck = [false, false]; }
          if (!canCastleKing) { canCastleKing = [true, true]; }
          if (!canCastleQueen) { canCastleQueen = [true, true]; }
          if (!enpassantPosition) { enpassantPosition = {row: null, col: null}; }
          var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex,
                      isUnderCheck, canCastleKing,
                      canCastleQueen, enpassantPosition);
          return cellInPossibleMoves(row, col, possibleMoves) !== false;
        } else {
          return false;
        }
      }
    };

    function getTurn(turnIndex:any) {
      return turnIndex === 0 ? 'W' : 'B';
    }

    function getOpponent(turnIndex:any) {
      return turnIndex === 0 ? 'B' : 'W';
    }

    function cellInPossibleMoves(row:any, col:any, possibleMoves:any):any {
      var cell = {row: row, col: col};
      for (var i = 0; i < possibleMoves.length; i++) {
        if (angular.equals(cell, possibleMoves[i][0])) {
          return i;
        }
      }
      return false;
    }

    export let isBlackPiece = function(row:any, col:any) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      return board[row][col].charAt(0) === 'B';
    };

    export let isWhitePiece = function(row:any, col:any) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      return board[row][col].charAt(0) === 'W';
    };

    function shouldPromote(board:any, deltaFrom:any, deltaTo:any, turnIndex:any) {
      var myPawn = (turnIndex === 0 ? 'WP' : 'BP');
      return myPawn === board[deltaFrom.row][deltaFrom.col] &&
              (deltaTo.row === 0 || deltaTo.row === 7);
    }

    export let isModalShown = function (modalName:any) {
      return isPromotionModalShowing[modalName];
    };

    export let updatePromoteTo = function() {
      var radioPromotions:any = document.getElementsByName('promotions');
      for (var i = 0; i < radioPromotions.length; i++) {
        if (radioPromotions[i].checked) {
          promoteTo = radioPromotions[i].value;
          break;
        }
      }
      // alert($scope.promoteTo);
      dismissModal(modalName);
      actuallyMakeMove();
    };

    function dismissModal(modalName:any) {
      delete isPromotionModalShowing[modalName];
    }

    function getIntegersTill(number:any) {
      var res:any = [];
      for (var i = 0; i < number; i++) {
        res.push(i);
      }
      return res;
    }

    export var rows:any = getIntegersTill(rowsNum);
    export var cols:any = getIntegersTill(colsNum);

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en', {
      CHESS_GAME: "Chess",
      PROMOTION_MESSAGE: "Congratulations! Which piece would you like to promote to?",
      PROMOTE_QUEEN: "Queen",
      PROMOTE_ROOK: "Rook",
      PROMOTE_BISHOP: "Bishop",
      PROMOTE_KNIGHT: "Knight",
      PROMOTE_ACTION: "Promote",
      RULES_OF_CHESS: "Rules of Chess",
      CLOSE: "Close",
      RULES_SLIDE1: "King moves one piece around it",
      RULES_SLIDE2: "Rook moves horisontaly and verticaly",
      RULES_SLIDE3: "Bishop moves diagnaly and anti-diagnaly",
      RULES_SLIDE4: "Queen is the most powerful piece in Chess, it can move horizontaly, verticaly and diagnaly.",
      RULES_SLIDE5: "Knight can move as 'L' shape and skip other pieces",
      RULES_SLIDE6: "Pawn moves forward one row(or two rows in initial move), capture pieces diagnaly",
      RULES_SLIDE7: "En passant: a special pawn capture",
      RULES_SLIDE8: "Promotion: the pawn reaches last row is qualified to promotion",
      RULES_SLIDE9: "Castling: King and Rook move together(with conditions) as picture shows",
      RULES_SLIDE10: "In check: When a king is under immediate attack by one or two of the opponent's pieces.",
      RULES_SLIDE11: "Endgame - wins by Checkmate",
      RULES_SLIDE11_2: "Make opponent's king has no available legal moves while is under check by you.",
      RULES_SLIDE12: "Endgame - draws by Stalemate",
      RULES_SLIDE12_2: "Make opponent's king has no available legal moves while is NOT under check by you."
  });
  game.init();
});



/**
angular.module('myApp')
.run(['gameLogic',
    'aiService',
    function (
      gameLogic,
      aiService) {

  'use strict';

  var $log = log;
  var $scope = $rootScope;
  var $translate = translate;
  });
*/
