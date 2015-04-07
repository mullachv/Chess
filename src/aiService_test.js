describe("aiService", function() {

  'use strict';

  var _aiService;

  beforeEach(module("myApp"));

  beforeEach(inject(function (aiService) {
    _aiService = aiService;
  }));

  it("Black finds an immediate winning move by moving BQ from 0x3 to 4x7", function() {
    var startingState = {null: null,
      board: [['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'], 
          ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'], 
          ['', '', '', '', '', '', '', ''],  
          ['', '', '', '', 'BP', '', '', ''], 
          ['', '', '', '', '', '', 'WP', ''],  
          ['', '', '', '', '', 'WP', '', ''], 
          ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],  
          ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']],
      isUnderCheck: [false, false],
      canCastleKing: [true, true],
      canCastleQueen: [true, true],
      enpassantPosition: {row: null, col: null},
    };
    var move = _aiService.createComputerMove(
        startingState, 0, {maxDepth: 2});
    var expectedMove =
        [{endMatch: {endMatchScores: [0, 1]}},
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
          {set: {key: 'enpassantPosition', value: {row: null, col: null}}},
          {set: {key: 'promoteTo', value: ""}}
          ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });


});