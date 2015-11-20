/*
    Ian McPeek & Duy Huynh
    TCSS 435 - Fall 2015
    Assignment 2, 2048

    We decided to write an AI based off of the depth-limited exectimax algorithm using a few simple heuristics
    that were learned from playing 2048 on our own. These heuristics include favoring boards with more
    empty cells, gravitating towards larger tile numbers, and a smoothness gradient in which tile values
    are increasing in a diagonal direction across the board. These heuristics cause our AI to favor placing
    the largest tile value in the bottom-right corner of the board with decreasing values radiating out.

    An alpha-beta pruning approach was also considered to increase the search depth which is currently
    capped to 5 which runs well on a decent machine. The implementation is not used but has been coded below
    for future consideration.

    With the given evaluation function, this AI is able to win on average 96% of the time. We ran a test in which
    98 out of the 102 games were wins with a highest tile value of 2048 or more. It is very common for this AI to
    reach 4096 along with another 2048 tile. However it will soon run out of empty tiles and doom itself.

    Here are various discussions of 2048 AI's where our work was inspired from:
        https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
        http://blog.datumbox.com/using-artificial-intelligence-to-solve-the-2048-game-java-code/
        https://github.com/ov3y/2048-AI
        https://codemyroad.wordpress.com/2014/05/14/2048-ai-the-intelligent-bot/
        http://www.ranjaykrishna.com/1/post/2014/12/can-an-artificial-intelligence-win-2048.html
 */


// helper functions
function randomInt(n) {
    return Math.floor(Math.random() * n);
};

function AgentBrain(gameEngine) {
    this.size = 4;
    this.previousState = gameEngine.grid.serialize();
    this.reset();
    this.score = 0;
};

AgentBrain.prototype.reset = function () {
    this.score = 0;
    this.grid = new Grid(this.previousState.size, this.previousState.cells);
};

// Adds a tile in a random position
AgentBrain.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);

        this.grid.insertTile(tile);
    }
};

AgentBrain.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
AgentBrain.prototype.move = function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    //console.log(vector);

    //console.log(traversals);

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = { x: x, y: y };
            tile = self.grid.cellContent(cell);

            if (tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next = self.grid.cellContent(positions.next);

                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    var merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);

                    // Update the score
                    self.score += merged.value;

                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!self.positionsEqual(cell, tile)) {
                    moved = true; // The tile moved from its original cell!
                }
            }
        });
    });
    console.log(moved);
    if (moved) {
        this.addRandomTile();
    }
    return moved;
};

// Get the vector representing the chosen direction
AgentBrain.prototype.getVector = function (direction) {
    // Vectors representing tile movement
    var map = {
        0: { x: 0, y: -1 }, // Up
        1: { x: 1, y: 0 },  // Right
        2: { x: 0, y: 1 },  // Down
        3: { x: -1, y: 0 }   // Left
    };

    return map[direction];
};

// Build a list of positions to traverse in the right order
AgentBrain.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
};

AgentBrain.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
             this.grid.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell // Used to check if a merge is required
    };
};

AgentBrain.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};

function Agent() {
};

Agent.prototype.selectMove = function (gameManager) {
    var brain = new AgentBrain(gameManager);

<<<<<<< Updated upstream
=======
    //brain.printGrid(brain.grid.cells);

>>>>>>> Stashed changes
    // Use the brain to simulate moves
    // brain.move(i) 
    // i = 0: up, 1: right, 2: down, 3: left
    // brain.reset() resets the brain to the current game board
<<<<<<< Updated upstream

    if (brain.move(0)) return 0;
    if (brain.move(3)) return 3;
    if (brain.move(2)) return 2;
    if (brain.move(1)) return 1;
};

Agent.prototype.evaluateGrid = function (gameManager) {
    // calculate a score for the current grid configuration

};
=======

    // Use expectimax (or replace with alphabeta)
    var maxMove = this.expectimax(brain, 5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true).maxMove;
    if(typeof maxMove === 'undefined'){
        console.log("Max move was undefined");
    };

    // Make sure to only allow valid moves
    if([0,1,2,3].indexOf(maxMove) != -1) {
        if (brain.move(maxMove)) return maxMove;
    }

    // In case all else fails, at least make a move to avoid crashing the game.
    else if (brain.move(0)) return 0;
    if (brain.move(3)) return 3;
    if (brain.move(2)) return 2;
    if (brain.move(1)) return 1;
};


Agent.prototype.printGrid = function(grid) {
    var strBoard = "{";
    for(var x=0; x < grid.length; x++) {
        strBoard += "[";
        for(var y=0; y< grid.length; y++) {
            if(grid[x][y])
            strBoard += grid[x][y].value + ", ";
            else
            strBoard += "0, ";
        }
        strBoard += "]";
    }
    strBoard += "}";
    console.log(strBoard);
};

/**
 * Evaluate the board given simple heuristics: # free cells, highest cell value, gradient/smoothness factor
 * @param board
 * @returns { evaluated board score }
 */
Agent.prototype.evaluateGrid = function (board) {
    // calculate a score for the current grid configuration
    // freetiles + clustering + score + (maybe highest corner bonus)

    var emptyCells = board.availableCells().length;
    var emptyWeight = 4;

    // Obtain highest tile value
    var highestTile;
    for(var x=0; x<board.size; x++) {
        for(var y=0; y<board.size; y++) {
            if(board.cells[x][y]) {
                var tile = board.cells[x][y];
                if(!highestTile || tile.value > highestTile.value) {highestTile = tile;}
            }
        }
    }
    return Math.log(emptyCells) * emptyWeight + this.gradient(board) + highestTile.value;
}

/**
 * Heuristic for determining how 'smooth' the board is in diagonal directions
 * (ie whether tile values are consistently increasing or decreasing on a given direction of the board)
 * (This forces the board to favor high valued tiles in the corner)
 * @param board
 * @returns {number}
 */
Agent.prototype.gradient = function(board) {
    var tlgrad = 0, trgrad = 0, blgrad = 0, brgrad = 0;
    for(var x=0; x<board.size; x++) {
        for(var y=0; y<board.size; y++) {
            if(board.cells[x][y]) {
                var tile = board.cells[x][y];
                var val = (tile.value);
                brgrad += val * ((x+1)*(y+1))/16;
                blgrad += val * ((x+1)*(3-(y+1)))/16;
                trgrad += val * ((3-(x+1))*(y+1))/16;
                tlgrad += val * ((3-(x+1))*(3-(y+1)))/16;
            }
        }

    }
    var grad1 = Math.max(brgrad, blgrad);
    var grad2 = Math.max(trgrad, tlgrad);
    return Math.max(grad1, grad2);
}

// Good ol' expectimax. Player node and Chance nodes are implemented separately below.
Agent.prototype.expectimax = function(brain, depth, a, b, maximizingPlayer) {
    //if gameover return evaluate
    if(depth === 0 || brain.cellsAvailable) { //also end if game is over
        return {maxMove:0, maxScore:this.evaluateGrid(brain.grid)};
    } else if(maximizingPlayer)
        return this.maxScore(brain, depth-1, a, b);
    else
        return {maxMove:0, maxScore:this.expectScore(brain, depth-1)};
        //return {maxvalue, bestmove};
};

// Maximizing node (Player move)
Agent.prototype.maxScore = function(brain, depth, a, b) {
    var score = -1000, move = 0;
    var oldBrain = new AgentBrain(brain);
    //foreach move{0,1,2,3}
    for(var i = 0; i < 4; i++) {
        var moved = oldBrain.move(i);
        if(moved) {
            var max = this.expectimax(oldBrain, depth, a, b, false).maxScore;
            if(max > score) {
                score = max;
                move = i;
            }
        }
        oldBrain.reset();
    }
    return {maxMove:move, maxScore:score};
};

// The 'chance node' applied to minimizing player (random 2 or 4 tile)
Agent.prototype.expectScore = function(brain, depth, a, b) {
    var oldBrain = new AgentBrain(brain);
    var cells = brain.grid.availableCells();
    var sum = 0;
    for(var i=0; i < cells.length; i++) {

        var p2 = (1/cells.length) * 0.9; //multiplied by tiles that can be occupied by a 2
        oldBrain.addTile(cells[i], 2);
        sum += p2 * this.expectimax(oldBrain, depth, a, b, true).maxScore;
        oldBrain.reset();

        var p4 = (1/cells.length) * 0.1; //multiplied by tiles that can be occupied by a 4
        oldBrain.addTile(cells[i], 4);
        sum += p4 * this.expectimax(oldBrain, depth, a, b, true).maxScore;
        oldBrain.reset();
    }
    return sum;
};

// WIP
Agent.prototype.alphabeta = function(brain, depth, a, b, maximizingPlayer) {

    // If depth is 0 or terminal node
    if (depth === 0) {
        return {maxMove: 0, maxScore: this.evaluateGrid(brain.grid)};

        // Maximizing player
    }
    if (maximizingPlayer) {

        // Initialize
        var oldBrain = new AgentBrain(brain);
        var v = Number.NEGATIVE_INFINITY;

        var move = 0;

        // For each child node
        for (var i = 0; i < 4; i++) {

            var moved = oldBrain.move(i);
            if (moved) {
                v = Math.max(v, this.alphabeta(oldBrain, depth - 1, a, b, false).maxScore);
                a = Math.max(a, v);
                move = i;
                //console.log("maximizing");
                // Prune
                if (b <= a) return {maxScore: a, maxMove: i};
            }
            oldBrain.reset();

        }
        return {maxScore: v, maxMove: move};

        // Minimizing player
    } else {
        var oldBrain = new AgentBrain(brain);
        var v = Number.POSITIVE_INFINITY;
        var cells = brain.grid.availableCells();
        for (var i = 0; i < cells.length; i++) {
            oldBrain.addTile(cells[i], 2); // Just deal with adding 2's
            v = Math.min(v, this.alphabeta(oldBrain, depth - 1, a, b, true).maxScore);
            b = Math.min(b, v);

            // Prune
            if (b <= a) return {maxScore: b, maxMove: 0};
            oldBrain.reset();
        }
        return {maxScore: v, maxMove:0};
    }
};
>>>>>>> Stashed changes
