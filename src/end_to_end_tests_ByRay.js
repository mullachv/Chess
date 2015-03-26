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
        expect(getPiece(row, col, 'WK').isDisplayed()).toEqual(true);
        break;
      case 'WQ':
        expect(getPiece(row, col, 'WQ').isDisplayed()).toEqual(true);
        break;
      case 'WR':
        expect(getPiece(row, col, 'WR').isDisplayed()).toEqual(true);
        break;
      case 'WB':
        expect(getPiece(row, col, 'WB').isDisplayed()).toEqual(true);
        break;
      case 'WN':
        expect(getPiece(row, col, 'WN').isDisplayed()).toEqual(true);
        break;
      case 'WP':
        expect(getPiece(row, col, 'WP').isDisplayed()).toEqual(true);
        break;
      case 'BK':
        expect(getPiece(row, col, 'BK').isDisplayed()).toEqual(true);
        break;
      case 'BQ':
        expect(getPiece(row, col, 'BQ').isDisplayed()).toEqual(true);
        break;
      case 'BR':
        expect(getPiece(row, col, 'BR').isDisplayed()).toEqual(true);
        break;
      case 'BB':
        expect(getPiece(row, col, 'BB').isDisplayed()).toEqual(true);
        break;
      case 'BN':
        expect(getPiece(row, col, 'BN').isDisplayed()).toEqual(true);
        break;
      case 'BP':
        expect(getPiece(row, col, 'BP').isDisplayed()).toEqual(true);
        break;
      default: 
        expect(getPiece(row, col, '').isDisplayed()).toEqual(false);
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

  it('should show WP in 5x4 if I move it from 6x4', function () {
    var deltaFrom = {row: 6, col: 4};
    var deltaTo = {row: 5, col: 4};

    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][4] = board[6][4];
    board[6][4] = '';
    expectBoard(board);
  });

  it('should show BP in 2x4 if I move it from 1x4', function () {
    var deltaFrom = {row: 6, col: 4};
    var deltaTo = {row: 5, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][4] = board[6][4];
    board[6][4] = '';

    var deltaFrom = {row: 1, col: 4};
    var deltaTo = {row: 2, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BP");
    board[2][4] = board[1][4];
    board[1][4] = '';
    expectBoard(board);
  });

  it('should show WB in 5x3 if I move it from 7x5', function () {
    var deltaFrom = {row: 6, col: 4};
    var deltaTo = {row: 5, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][4] = board[6][4];
    board[6][4] = '';

    var deltaFrom = {row: 1, col: 4};
    var deltaTo = {row: 2, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BP");
    board[2][4] = board[1][4];
    board[1][4] = '';

    var deltaFrom = {row: 7, col: 5};
    var deltaTo = {row: 5, col: 3};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WB");
    board[5][3] = board[7][5];
    board[7][5] = '';
    expectBoard(board);
  }); 

  it('should show WN in 5x5 if I move it from 7x6', function () {
    var deltaFrom = {row: 7, col: 6};
    var deltaTo = {row: 5, col: 5};

    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WN");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][5] = board[7][6];
    board[7][6] = '';
    expectBoard(board);
  });

  it('should show WR in 5x0 if I move it from 7x0', function () {
    var deltaFrom = {row: 6, col: 0};
    var deltaTo = {row: 4, col: 0};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[4][0] = board[6][0];
    board[6][0] = '';

    var deltaFrom = {row: 1, col: 4};
    var deltaTo = {row: 2, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BP");
    board[2][4] = board[1][4];
    board[1][4] = '';

    var deltaFrom = {row: 7, col: 0};
    var deltaTo = {row: 5, col: 0};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WR");
    board[5][0] = board[7][0];
    board[7][0] = '';
    expectBoard(board);
  }); 

  it('should show BK in 1x4 if I move it from 0x4', function () {
    var deltaFrom = {row: 6, col: 4};
    var deltaTo = {row: 5, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][4] = board[6][4];
    board[6][4] = '';

    var deltaFrom = {row: 1, col: 4};
    var deltaTo = {row: 3, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BP");
    board[3][4] = board[1][4];
    board[1][4] = '';

    var deltaFrom = {row: 6, col: 5};
    var deltaTo = {row: 5, col: 5};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    board[5][5] = board[6][5];
    board[6][5] = '';

    var deltaFrom = {row: 0, col: 4};
    var deltaTo = {row: 1, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BK");
    board[1][4] = board[0][4];
    board[0][4] = '';
    expectBoard(board);
  });

  it('should show BQ in 4x7 if I move it from 0x3', function () {
    var deltaFrom = {row: 6, col: 4};
    var deltaTo = {row: 5, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    var board = JSON.parse(JSON.stringify(initialBoard));
    board[5][4] = board[6][4];
    board[6][4] = '';

    var deltaFrom = {row: 1, col: 4};
    var deltaTo = {row: 3, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BP");
    board[3][4] = board[1][4];
    board[1][4] = '';

    var deltaFrom = {row: 6, col: 5};
    var deltaTo = {row: 5, col: 5};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "WP");
    board[5][5] = board[6][5];
    board[6][5] = '';

    var deltaFrom = {row: 0, col: 3};
    var deltaTo = {row: 4, col: 7};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "BQ");
    board[4][7] = board[0][3];
    board[0][3] = '';
    expectBoard(board);
  });

  it('should ignore clicking on a empty cell', function () {
    // clicking on a non-empty cell doesn't do anything.
    clickDivsAndExpectPiece({row: 2, col: 0}, {row: 4, col: 0}, "");
    expectBoard(initialBoard);
  });

  it('cannot move WP in 3x4 if I move it from 6x4', function () {
    var deltaFrom = {row: 6, col: 4};
    var deltaTo = {row: 3, col: 4};
    clickDivsAndExpectPiece(deltaFrom, deltaTo, "");
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
    var deltaFrom1 = {row: 1, col: 7},
      deltaTo1 = {row: 3, col: 7},
      board1 = [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', ''],  
          ['', 'BB', 'BN', '', '', '', '', ''], 
          ['BR', '', '', '', '', '', 'WP', 'WP'],  
          ['', '', 'WK', '', '', '', '', '']];

    var deltaFrom2 = {row: 6, col: 7},
      deltaTo2 = {row: 4, col: 7},
      board2 = [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', '', '', ''], 
          ['BR', '', '', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']];

    var deltaFrom3 = {row: 6, col: 0},
      deltaTo3 = {row: 6, col: 2},
      board_checkmate = [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', '', '', ''], 
          ['', '', 'BR', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']];  // a wining board for black

    var lastState = getStateParameters(board1, deltaFrom1, deltaTo1, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var currentState = getStateParameters(board2, deltaFrom2, deltaTo2, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var matchState2 = setMatchState2(0, lastState, currentState);
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, "BR"); // winning click!
    expectBoard(board_checkmate);
  });


  it('cannot play if it is not your turn', function () {
    var deltaFrom1 = {row: 1, col: 7},
      deltaTo1 = {row: 3, col: 7},
      board1 = [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', ''],  
          ['', 'BB', 'BN', '', '', '', '', ''], 
          ['BR', '', '', '', '', '', 'WP', 'WP'],  
          ['', '', 'WK', '', '', '', '', '']];

    var deltaFrom2 = {row: 6, col: 7},
      deltaTo2 = {row: 4, col: 7},
      board2 = [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', '', '', ''], 
          ['BR', '', '', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']];

    var deltaFrom3 = {row: 6, col: 0},
      deltaTo3 = {row: 6, col: 2};

    var lastState = getStateParameters(board1, deltaFrom1, deltaTo1, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var currentState = getStateParameters(board2, deltaFrom2, deltaTo2, initialIsUnderCheck,
                  initialCanCastleKing, initialCanCastleQueen, initialEnpassantPosition);
    var matchState2 = setMatchState2(0, lastState, currentState); // can do winning move
    setMatchState(matchState2, 0); // pass playerindex 0
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, ""); // winning click!
    expectBoard(board2);
  });
});