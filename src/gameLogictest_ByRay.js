describe("In Chess", function() {
  'use strict';
  var _gameLogic;

  beforeEach(module("myApp"));

  beforeEach(inject(function (gameLogic) {
    _gameLogic = gameLogic;
  }));

  function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(true);
  }

  function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(false);
  }

  it("placing WP in 5x4 from initial state is legal", function() {
    expectMoveOk(0, {},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'WP', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]
        }},
        {set: {key: 'deltaFrom', value: {row: 6, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WR from 5x7 to 3x6 is ilegal", function() {
    expectIllegalMove(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', 'WR', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 5, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 3, col: 6}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WB from 6x4 to 6x5 is ilegal", function() {
    expectIllegalMove(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', '', 'BP', 'BP', ''], 
          ['', '', '', '', 'BP', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WP', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', 'WN', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WP', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', 'WB', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 6, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WN from 7x6 to 6x4 is legal for it can jump over WP at 6x6", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', 'WN', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 6}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WR from 5x7  to 2x7 (eat BP) is legal", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WN', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'WR'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WN', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 5, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 2, col: 7}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

it("placing WB from 7x5  to 3x1 (eat BP) is legal", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WN', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'WB', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WN', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 5}}},
        {set: {key: 'deltaTo', value: {row: 3, col: 1}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("casling King side provided the condition is ilegal", function() {
    expectIllegalMove(0, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', 'WR']],
          canCastleKing: [true, true],
          canCastleQueen: [true, true]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', '', 'WR', 'WK', '']]
        }}, 
        {set: {key: 'deltaFrom', value: {row: 7, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 7, col: 6}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [false, true]}},
        {set: {key: 'canCastleQueen', value: [false, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("casling Queen side provided the condition is ilegal", function() {
    expectIllegalMove(0, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', '', '', 'WK', 'WB', 'WN', 'WR']],
          canCastleKing: [true, true],
          canCastleQueen: [true, true]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['', 'WN', 'WK', 'WR', '', 'WB', 'WN', 'WR']]
        }}, 
        {set: {key: 'deltaFrom', value: {row: 7, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 7, col: 2}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [false, true]}},
        {set: {key: 'canCastleQueen', value: [false, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing BQ from 0x1 to 2x1 is legal and results WK CHECKMATE thus game ends", function() {
    expectMoveOk(1,
      {board:
        [['', 'BQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''], 
          ['WK', '', 'BK', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']],
          isUnderCheck: [false, false]
        },
      [{endMatch: {endMatchScores:[0, 1]}},
        {set: {key: 'board', value:
          [['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''], 
          ['WK', 'BQ', 'BK', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 0, col: 1}}},
        {set: {key: 'deltaTo', value: {row: 2, col: 1}}},
        {set: {key: 'isUnderCheck', value: [true, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WB from 5x2 to 1x6 is legal and results BK STALEMATE thus game ends", function() {
    expectMoveOk(0,
      {board:
        [['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'WK', '', 'BK'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['BP', '', '', '', '', '', '', ''],  
          ['WP', '', 'WB', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']],
          isUnderCheck: [false, false]
        },
      [{endMatch: {endMatchScores:[0, 0]}},
        {set: {key: 'board', value:
          [['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'WK', 'WB', 'BK'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['BP', '', '', '', '', '', '', ''],  
          ['WP', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 5, col: 2}}},
        {set: {key: 'deltaTo', value: {row: 1, col: 6}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });
}); 