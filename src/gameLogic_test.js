describe("In Chess", function() {
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

  it("placing WP in 4x4 from initial state is legal", function() {
    expectMoveOk(0, {},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]
        }},
        {set: {key: 'deltaFrom', value: {row: 6, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 4, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing BP in 1x1 after WP placed in 4x4 is legal", function() {
    expectMoveOk(1,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]
        },
      [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 1, col: 1}}},
        {set: {key: 'deltaTo', value: {row: 3, col: 1}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing an BR in a non-empty position is illegal", function() {
    expectIllegalMove(1,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]},
      [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 0, col: 0}}},
        {set: {key: 'deltaTo', value: {row: 1, col: 0}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WK in 6x4 is legal", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WK', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', '', 'WB', 'WN', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WK in 5x4 is ilegal", function() {
    expectIllegalMove(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WQ from 7x3 to 6x4 is legal", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WQ', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', '', 'WK', 'WB', 'WN', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 3}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WR from 7x7 to 5x7 is legal", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', 'WP'],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', 'WP'],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 7}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WR from 5x7 to 5x5 is legal", function() {
    expectMoveOk(0,
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
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WR', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 5, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WR from 5x7 to 4x6 is ilegal", function() {
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
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 5, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 4, col: 6}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WB from 7x5 to 6x4 is legal", function() {
    expectMoveOk(0,
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
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 5}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WB from 7x5 to 6x5 is ilegal", function() {
    expectIllegalMove(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WP', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WP', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 5}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WN from 7x6 to 5x5 is legal for it can jump over WP at 6x6", function() {
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
          ['', '', '', '', '', 'WN', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 6}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

it("placing WN from 7x6 to 5x5 is legal", function() {
    expectMoveOk(0,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', '', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', '']]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WN', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', '', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 6}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

it("placing WR from 5x7 through WN to 5x0 is ilegal", function() {
    expectIllegalMove(0,
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
          ['', 'BP', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', 'WN', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', '', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 5, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 5, col: 0}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("move without delta and other sets is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
      {set: {key: 'board', value:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}}
          ]);
  });

  it("placing WR outside the board (in 7x8) is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
      {set: {key: 'board', value:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
      {set: {key: 'deltaFrom', value: {row: 7, col: 7}}},
      {set: {key: 'deltaTo', value: {row: 7, col: 8}}},
      {set: {key: 'isUnderCheck', value: [false, false]}},
      {set: {key: 'canCastleKing', value: [true, true]}},
      {set: {key: 'canCastleQueen', value: [true, true]}},
      {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
      ]);
  });

  it("null move is illegal", function() {
    expectIllegalMove(0, {}, null);
  });

  it("move without board is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}}]);
  });

  
  it("placing WP in 4x4 but setTurn to yourself is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 0}},
      {set: {key: 'board', value:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
      {set: {key: 'deltaFrom', value: {row: 6, col: 4}}},
      {set: {key: 'deltaTo', value: {row: 4, col: 4}}},
      {set: {key: 'isUnderCheck', value: [false, false]}},
      {set: {key: 'canCastleKing', value: [true, true]}},
      {set: {key: 'canCastleQueen', value: [true, true]}},
      {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
      ]);
  });

  it("placing WP in 4x4 but setting the board wrong is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
      {set: {key: 'board', value:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'WP', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
      {set: {key: 'deltaFrom', value: {row: 6, col: 4}}},
      {set: {key: 'deltaTo', value: {row: 4, col: 4}}},
      {set: {key: 'isUnderCheck', value: [false, false]}},
      {set: {key: 'canCastleKing', value: [true, true]}},
      {set: {key: 'canCastleQueen', value: [true, true]}},
      {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
      ]);
  });

  it("casling King side provided the condition is legal", function() {
    expectMoveOk(0, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR']],
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

  it("casling Queen side provided the condition is legal", function() {
    expectMoveOk(0, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP'],  
          ['WR', '', '', '', 'WK', 'WB', 'WN', 'WR']],
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
          ['', '', 'WK', 'WR', '', 'WB', 'WN', 'WR']]
        }}, 
        {set: {key: 'deltaFrom', value: {row: 7, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 7, col: 2}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [false, true]}},
        {set: {key: 'canCastleQueen', value: [false, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("casling King side provided the condition is ilegal", function() {
    expectIllegalMove(0, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WP'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WR'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', '']],
          canCastleKing: [true, true],
          canCastleQueen: [true, true]},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', 'WP', '', '', ''],  
          ['', '', '', '', '', '', '', 'WP'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WR'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', '']]
        }}, 
        {set: {key: 'deltaFrom', value: {row: 7, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 7, col: 6}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  }); 

  it("BP moved leading to an enpassant position is legal", function() {
    expectMoveOk(1, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'WP', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', 'WP'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WR'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', '']],
          canCastleKing: [true, true],
          canCastleQueen: [true, true]
          },
      [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP',  'BP',  '',  'BP', 'BP', 'BP', 'BP'], 
          ['',    '',   '',    '',   '',   '',   '',   ''],  
          ['',    '',   '',   'BP', 'WP',  '',   '',   ''], 
          ['',    '',   '',    '',   '',   '',   '',   ''],  
          ['',    '',   '',    '',   '',   '',   '', 'WP'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WR'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '',    '',   '']]
        }}, 
        {set: {key: 'deltaFrom', value: {row: 1, col: 3}}},
        {set: {key: 'deltaTo', value: {row: 3, col: 3}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: 3, col: 3}}}
        ]);
  });

  it("WP performed enpassant provided the condition is legal", function() {
    expectMoveOk(0, {board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', 'BP', 'WP', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', 'WP'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WR'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', '']],
          canCastleKing: [true, true],
          canCastleQueen: [true, true],
          enpassantPosition: {row: 3, col: 3}},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', '', 'BP', 'BP', 'BP', 'BP'], 
          ['', '', '', 'WP', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', 'WP'], 
          ['WP', 'WP', 'WP', 'WP', 'WB', 'WP', 'WP', 'WR'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', '']]
        }}, 
        {set: {key: 'deltaFrom', value: {row: 3, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 2, col: 3}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });




it("placing BR from 3x4 to 3x5 is legal and results WK UnderCheck", function() {
    expectMoveOk(1,
      {board:
        [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', 'BR', '', '', ''], 
          ['', '', '', '', 'WP', 'WK', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', '', 'WB', 'WN', '']]},
      [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', '', 'BP', 'BP', 'BP', 'BP', 'BP', ''], 
          ['', '', '', '', '', '', '', 'BP'],  
          ['', 'BP', '', '', '', 'BR', '', ''], 
          ['', '', '', '', 'WP', 'WK', '', ''],  
          ['', '', '', '', '', '', '', 'WR'], 
          ['WP', 'WP', 'WP', 'WP', '', 'WP', 'WP', ''],  
          ['WR', 'WN', 'WB', 'WQ', '', 'WB', 'WN', '']]}},
        {set: {key: 'deltaFrom', value: {row: 3, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 3, col: 5}}},
        {set: {key: 'isUnderCheck', value: [true, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing BQ from 3x7 to 4x7 is legal and results WK CHECKMATE thus game ends", function() {
    expectMoveOk(1,
      {board:
        [['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', 'BQ'], 
          ['', '', '', '', '', '', 'WP', ''],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]
        },
      [{endMatch: {endMatchScores:[0, 1]}},
        {set: {key: 'board', value:
          [['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', ''], 
          ['', '', '', '', '', '', 'WP', 'BQ'],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 3, col: 7}}},
        {set: {key: 'deltaTo', value: {row: 4, col: 7}}},
        {set: {key: 'isUnderCheck', value: [true, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing BR from 6x1 to 6x2 is legal and results WK CHECKMATE thus game ends", function() {
    expectMoveOk(1,
      {board:
        [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', 'WP', '', ''], 
          ['', 'BR', '', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']]
        },
      [{endMatch: {endMatchScores:[0, 1]}},
        {set: {key: 'board', value:
          [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', 'WP', '', ''], 
          ['', '', 'BR', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 6, col: 1}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 2}}},
        {set: {key: 'isUnderCheck', value: [true, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WK from 7x2 to 6x2 is ilegal because game already ends", function() {
    expectIllegalMove(0,
      {board:
        [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', 'WP', '', ''], 
          ['', '', 'BR', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']]
        },
      [{endMatch: {endMatchScores:[0, 1]}},
        {set: {key: 'board', value:
          [['', 'WQ', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'BP', 'BK', ''], 
          ['', '', 'BP', '', '', '', 'BP', ''],  
          ['', 'BP', '', '', 'WN', '', '', 'BP'], 
          ['', 'BB', '', '', '', '', '', 'WP'],  
          ['', 'BB', 'BN', '', '', 'WP', '', ''], 
          ['', '', 'BR', '', '', '', 'WP', ''],  
          ['', '', 'WK', '', '', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 7, col: 2}}},
        {set: {key: 'deltaTo', value: {row: 6, col: 2}}},
        {set: {key: 'isUnderCheck', value: [true, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

it("placing WK from 2x5 to 3x5 is legal and results BK CHECKMATE thus game ends", function() {
    expectMoveOk(0,
      {board:
        [['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', 'WK', '', ''],  
          ['', '', '', '', '', '', '', 'BK'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR']],
          isUnderCheck: [false, true]
        },
      [{endMatch: {endMatchScores:[1, 0]}},
        {set: {key: 'board', value:
          [['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', 'WK', '', 'BK'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', 'WR']]}},
        {set: {key: 'deltaFrom', value: {row: 2, col: 5}}},
        {set: {key: 'deltaTo', value: {row: 3, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, true]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

  it("placing WK from 1x4 to 1x5 is legal and results BK STALEMATE thus game ends", function() {
    expectMoveOk(0,
      {board:
        [['', '', '', '', '', '', '', 'BK'], 
          ['', '', '', '', 'WK', '', '', ''], 
          ['', '', '', '', '', '', 'WQ', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']],
          isUnderCheck: [false, false]
        },
      [{endMatch: {endMatchScores:[0, 0]}},
        {set: {key: 'board', value:
          [['', '', '', '', '', '', '', 'BK'], 
          ['', '', '', '', '', 'WK', '', ''], 
          ['', '', '', '', '', '', 'WQ', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 1, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 1, col: 5}}},
        {set: {key: 'isUnderCheck', value: [false, false]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

it("placing WP from 1x4 to 0x4 is legal and results WP promoted to WQ", function() {
    expectMoveOk(0,
      {board:
        [['', '', '', '', '', '', '', 'BK'], 
          ['', '', '', '', 'WP', '', '', ''], 
          ['', '', '', '', '', '', 'WP', ''],  
          ['', '', '', '', '', 'WK', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']]
        },
      [{setTurn: {turnIndex: 1}},
        {set: {key: 'board', value:
          [['', '', '', '', 'WQ', '', '', 'BK'], 
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', 'WP', ''],  
          ['', '', '', '', '', 'WK', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', ''], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', '', '', '', '']]}},
        {set: {key: 'deltaFrom', value: {row: 1, col: 4}}},
        {set: {key: 'deltaTo', value: {row: 0, col: 4}}},
        {set: {key: 'isUnderCheck', value: [false, true]}},
        {set: {key: 'canCastleKing', value: [true, true]}},
        {set: {key: 'canCastleQueen', value: [true, true]}},
        {set: {key: 'enpassantPosition', value: {row: undefined, col: undefined}}}
        ]);
  });

}); 