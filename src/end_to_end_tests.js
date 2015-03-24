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
    browser.get('http://localhost:9000/game.html');
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
      board3 = [['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', ''], 
          ['', '', '', '', '', '', 'WP', 'BQ'],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']];  // a wining board for black
  var initialIsUnderCheck = [false, false],
      initialCanCastleKing = [true, true],
      initialCanCastleQueen = [true, true],
      initialEnpassantPosition = {row: null, col: null};

  var matchState2 = {
    turnIndexBeforeMove: 0,
    turnIndex: 1,
    endMatchScores: null,
    lastMove: [{setTurn: {turnIndex: 1}},
          {set: {key: 'board', value: board2}},
          {set: {key: 'deltaFrom', value: deltaFrom2}},
          {set: {key: 'deltaTo', value: deltaTo2}},
          {set: {key: 'isUnderCheck', value: initialIsUnderCheck}},
          {set: {key: 'canCastleKing', value: initialCanCastleKing}},
          {set: {key: 'canCastleQueen', value: initialCanCastleQueen}},
          {set: {key: 'enpassantPosition', value: initialEnpassantPosition}}],
    lastState: {
      board: board1, deltaFrom: deltaFrom1, deltaTo: deltaTo1,
      isUnderCheck: initialIsUnderCheck, canCastleKing: initialCanCastleKing,
      canCastleQueen: initialCanCastleQueen, enpassantPosition: initialEnpassantPosition 
    },
    currentState: {
      board: board2, deltaFrom: deltaFrom2, deltaTo: deltaTo2,
      isUnderCheck: initialIsUnderCheck, canCastleKing: initialCanCastleKing,
      canCastleQueen: initialCanCastleQueen, enpassantPosition: initialEnpassantPosition 
    },
    lastVisibleTo: {},
    currentVisibleTo: {},
  };

  it('should end game if W wins by checkmate', function () {
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivsAndExpectPiece(deltaFrom3, deltaTo3, "BQ"); // winning click!
    expectBoard(board3);
  });

});