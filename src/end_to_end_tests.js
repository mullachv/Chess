/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Chess', function() {

  'use strict';
  var initialBoard = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
      ['', '', '', '', '', '', '', ''],  
      ['', '', '', '', '', '', '', ''], 
      ['', '', '', '', '', '', '', ''],  
      ['', '', '', '', '', '', '', ''], 
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']];
  
  beforeEach(function() {
    browser.get('http://localhost:9000/game.min.html');
  });


  function getDiv(row, col) {
    return element(by.id('e2e_test_div_' + row + 'x' + col));
  }

  function getPiece(row, col, pieceKind) {
    return element(by.id('e2e_test_img_' + pieceKind + '_' + row + 'x' + col));
  }

  function expectPiece(row, col, pieceKind) {
    // Careful when using animations and asserting isDisplayed:
    // Originally, my animation started from {opacity: 0;}
    // And then the image wasn't displayed.
    // I changed it to start from {opacity: 0.1;}
    switch(pieceKind) {
      case 'WK':
        expect(getPiece(row, col, 'WK').isDisplayed()).toEqual(pieceKind === "WK" ? true : false);
        break;
      case 'WQ':
        expect(getPiece(row, col, 'WQ').isDisplayed()).toEqual(pieceKind === "WQ" ? true : false);
        break;
      case 'WR':
        expect(getPiece(row, col, 'WR').isDisplayed()).toEqual(pieceKind === "WR" ? true : false);
        break;
      case 'WB':
        expect(getPiece(row, col, 'WB').isDisplayed()).toEqual(pieceKind === "WB" ? true : false);
        break;
      case 'WN':
        expect(getPiece(row, col, 'WN').isDisplayed()).toEqual(pieceKind === "WN" ? true : false);
        break;
      case 'WP':
        expect(getPiece(row, col, 'WP').isDisplayed()).toEqual(pieceKind === "WP" ? true : false);
        break;
      case 'BK':
      console.log("going to getPiece: " + row + ", " + col);
        expect(getPiece(row, col, 'BK').isDisplayed()).toEqual(pieceKind === "BK" ? true : false);
        break;
      case 'BQ':
        expect(getPiece(row, col, 'BQ').isDisplayed()).toEqual(pieceKind === "BQ" ? true : false);
        break;
      case 'BR':
        expect(getPiece(row, col, 'BR').isDisplayed()).toEqual(pieceKind === "BR" ? true : false);
        break;
      case 'BB':
        expect(getPiece(row, col, 'BB').isDisplayed()).toEqual(pieceKind === "BB" ? true : false);
        break;
      case 'BN':
        expect(getPiece(row, col, 'BN').isDisplayed()).toEqual(pieceKind === "BN" ? true : false);
        break;
      case 'BP':
        expect(getPiece(row, col, 'BP').isDisplayed()).toEqual(pieceKind === "BP" ? true : false);
        break;
    }  
  }

  function expectBoard(board) {
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        expectPiece(row, col, board[row][col]);
      }
    }
  }

  function clickDivsAndExpectPiece(deltaFrom, deltaTo, pieceKind) {
    getDiv(deltaFrom.row, deltaFrom.col).click();
    getDiv(deltaTo.row, deltaTo.col).click();

    expectPiece(deltaTo.row, deltaTo.col, pieceKind);
  }

  // playMode is either: 'passAndPlay', 'playAgainstTheComputer', 'onlyAIs',
  // or a number representing the playerIndex (-2 for viewer, 0 for white player, 1 for black player, etc)
  function setMatchState(matchState, playMode) {
    browser.executeScript(function(matchStateInJson, playMode) {
      var stateService = window.e2e_test_stateService;
      stateService.setMatchState(angular.fromJson(matchStateInJson));
      stateService.setPlayMode(angular.fromJson(playMode));
      angular.element(document).scope().$apply(); // to tell angular that things changes.
    }, JSON.stringify(matchState), JSON.stringify(playMode));
  }

  it('should have a title', function () {
    expect(browser.getTitle()).toEqual('Chess');
  });

  it('should have an initial Chess board', function () {
    expectBoard(initialBoard);
  });

  it('should show WP in 5x5 if I move it from 6x5', function () {
    var deltaFrom = {row: 6, col: 5};
    var deltaTo = {row: 5, col: 5};

    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][5] = board[6][5];
    board[6][5] = '';
    expectBoard(board);
  });

  it('should ignore clicking on a non-empty cell', function () {
    // clicking on a non-empty cell doesn't do anything.
    clickDivsAndExpectPiece({row: 6, col: 5}, {row: 6, col: 4}, "WP");
    expectBoard(initialBoard);
  });
  
  var initialIsUnderCheck = [false, false],
      initialCanCastleKing = [true, true],
      initialCanCastleQueen = [true, true],
      initialEnpassantPosition = {row: null, col: null};

  function setMatchState2(turnIndexBeforeMove, lastState, currentState) {
    return {
      turnIndexBeforeMove: turnIndexBeforeMove,
      turnIndex: 1 - turnIndexBeforeMove,
      endMatchScores: null,
      lastMove: [{setTurn: {turnIndex: 1 - turnIndexBeforeMove}},
            {set: {key: 'board', value: currentState.board}},
            {set: {key: 'deltaFrom', value: currentState.deltaFrom}},
            {set: {key: 'deltaTo', value: currentState.deltaTo}},
            {set: {key: 'isUnderCheck', value: currentState.isUnderCheck}},
            {set: {key: 'canCastleKing', value: currentState.canCastleKing}},
            {set: {key: 'canCastleQueen', value: currentState.canCastleQueen}},
            {set: {key: 'enpassantPosition', value: currentState.enpassantPosition}}],
      lastState: lastState,
      currentState: currentState,
      lastVisibleTo: {},
      currentVisibleTo: {}
    };
  }

  function getStateParameters(board, deltaFrom, deltaTo, isUnderCheck, canCastleKing,
                              canCastleQueen, enpassantPosition) {
    return {
      board: board,
      deltaFrom: deltaFrom,
      deltaTo: deltaTo,
      isUnderCheck: isUnderCheck,
      canCastleKing: canCastleKing,
      canCastleQueen: canCastleQueen,
      enpassantPosition: enpassantPosition
    };
  }

  it('should end game if W wins by checkmate', function () {
    var deltaFrom1 = {row: 1, col: 4},
      deltaTo1 = {row: 3, col: 4},
      board1 = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']];

    var deltaFrom2 = {row: 6, col: 6},
      deltaTo2 = {row: 4, col: 6},
      board2 = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', ''], 
          ['', '', '', '', '', '', 'WP', ''],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']];

    var deltaFrom3 = {row: 0, col: 3},
      deltaTo3 = {row: 4, col: 7},
      board_checkmate = [['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', ''], 
          ['', '', '', '', '', '', 'WP', 'BQ'],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']];  // a wining board for black

    var lastState = getStateParameters(board1, deltaFrom1, deltaTo1, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var currentState = getStateParameters(board2, deltaFrom2, deltaTo2, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var matchState2 = setMatchState2(0, lastState, currentState);
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, "BQ"); // winning click!
    expectBoard(board_checkmate);
  });

  
  it('should end game if there is a stalemate', function () {
    var deltaFrom1 = {row: 1, col: 4},
        deltaTo1 = {row: 1, col: 5},
        board1 = [['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'WK', 'BK', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', 'WQ', '']];

    var deltaFrom2 = {row: 1, col: 6},
        deltaTo2 = {row: 0, col: 7},
        board2 = [['', '', '', '', '', '', '', 'BK'], 
          ['', '', '', '', '', 'WK', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', 'WQ', '']];


    var deltaFrom3 = {row: 7, col: 6},
        deltaTo3 = {row: 2, col: 6},
        board_stalemate = [['', '', '', '', '', '', '', 'BK'], 
          ['', '', '', '', '', 'WK', '', ''], 
          ['', '', '', '', '', '', 'WQ', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']];  // a wining board for black

    var lastState = getStateParameters(board1, deltaFrom1, deltaTo1, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var currentState = getStateParameters(board2, deltaFrom2, deltaTo2, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var matchState2 = setMatchState2(1, lastState, currentState);
  
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, "WQ"); // click caused stalemate
    expectBoard(board_stalemate);
  });
  

it('should perform enpassant for moving WP from 3x5 to 2x4', function () {
    var deltaFrom1 = {row: 4, col: 6},
      deltaTo1 = {row: 3, col: 6};      

    var deltaFrom2 = {row: 1, col: 5},
      deltaTo2 = {row: 3, col: 5};
      
    var deltaFrom3 = {row: 3, col: 6},
      deltaTo3 = {row: 2, col: 5},
      board3 = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', '', 'BP', 'BP', '', 'BP', 'BP'], 
          ['', '', '', '', '', 'WP', '', ''],  
          ['', '', 'BP', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']];  // a wining board for black

    clickDivsAndExpectPiece({row: 6, col: 6}, {row: 4, col: 6}, "WP");
    clickDivsAndExpectPiece({row: 1, col: 2}, {row: 3, col: 2}, "BP");
    clickDivsAndExpectPiece(deltaFrom1, deltaTo1, "WP");
    clickDivsAndExpectPiece(deltaFrom2, deltaTo2, "BP");
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, "WP"); // winning click!
    expectBoard(board3);
  });

  it('should show WN in 5x2 if I move it from 7x1', function () {
    var deltaFrom = {row: 7, col: 1};
    var deltaTo = {row: 5, col: 2};

    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WN");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][2] = board[7][1];
    board[7][1] = '';
    expectBoard(board);
  });

  it('should ignore clicking on a empty cell', function () {
    // clicking on a non-empty cell doesn't do anything.
    clickDivsAndExpectPiece({row: 3, col: 0}, {row: 4, col: 0}, "");
    expectBoard(initialBoard);
  });

  it('WK in 7x4 can perform castling to king side if move to 7x6', function () {
    var deltaFrom1 = {row: 7, col: 5},
        deltaTo1 = {row: 5, col: 7},
        board1 = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['', 'BP', 'BP', 'BP', 'BP', '', 'BP', 'BP'], 
          ['', '', '', '', '', 'WP', '', ''],  
          ['BP', '', '', 'WP', 'WN', 'BP', '', 'BP'], 
          ['', '', '', '', '', '', 'WP', ''],  
          ['', '', '', '', '', '', '', 'WB'], 
          ['WP', 'WP', 'WP', '', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR']];

    var deltaFrom2 = {row: 3, col: 7},
        deltaTo2 = {row: 4, col: 7},
        board2 = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['', 'BP', 'BP', 'BP', 'BP', '', 'BP', 'BP'], 
          ['', '', '', '', '', 'WP', '', ''],  
          ['BP', '', '', 'WP', 'WN', 'BP', '', ''], 
          ['', '', '', '', '', '', 'WP', 'BP'],  
          ['', '', '', '', '', '', '', 'WB'], 
          ['WP', 'WP', 'WP', '', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR']];

    var deltaFrom3 = {row: 7, col: 4},
        deltaTo3 = {row: 7, col: 6},
        board3 = [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['', 'BP', 'BP', 'BP', 'BP', '', 'BP', 'BP'], 
          ['', '', '', '', '', 'WP', '', ''],  
          ['BP', '', '', 'WP', 'WN', 'BP', '', ''], 
          ['', '', '', '', '', '', 'WP', 'BP'],  
          ['', '', '', '', '', '', '', 'WB'], 
          ['WP', 'WP', 'WP', '', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', '', 'WR', 'WK', '']];

    var lastState = getStateParameters(board1, deltaFrom1, deltaTo1, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var currentState = getStateParameters(board2, deltaFrom2, deltaTo2, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var matchState2 = setMatchState2(1, lastState, currentState);
  
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, "WK"); // click caused stalemate
    expectBoard(board3);
  });

  it('WK in 7x4 cannot perform castling to king side because 7x6 is under attack', function () {
    var deltaFrom1 = {row: 4, col: 5},
        deltaTo1 = {row: 2, col: 4},
        board1 = [['BR', 'BN', '', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', 'WN', '', '', ''],  
          ['', '', '', '', '', '', 'WP', ''], 
          ['', '', '', 'BP', '', '', '', ''],  
          ['', '', '', '', '', 'BQ', '', 'WB'], 
          ['WP', 'WP', 'WP', 'BP', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR']];

    var deltaFrom2 = {row: 5, col: 5},
        deltaTo2 = {row: 5, col: 6},
        board2 = [['BR', 'BN', '', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', 'WN', '', '', ''],  
          ['', '', '', '', '', '', 'WP', ''], 
          ['', '', '', 'BP', '', '', '', ''],  
          ['', '', '', '', '', '', 'BQ', 'WB'], 
          ['WP', 'WP', 'WP', 'BP', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR']];

    var deltaFrom3 = {row: 7, col: 4},
        deltaTo3 = {row: 7, col: 6},
        board3 = [['BR', 'BN', '', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', 'WN', '', '', ''],  
          ['', '', '', '', '', '', 'WP', ''], 
          ['', '', '', 'BP', '', '', '', ''],  
          ['', '', '', '', '', '', 'BQ', 'WB'], 
          ['WP', 'WP', 'WP', 'BP', 'WP', 'WP', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR']];

    var lastState = getStateParameters(board1, deltaFrom1, deltaTo1, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var currentState = getStateParameters(board2, deltaFrom2, deltaTo2, [true, false],
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var matchState2 = setMatchState2(1, lastState, currentState);
  
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, ""); // click caused stalemate
    expectBoard(board3);
  });

});