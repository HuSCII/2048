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
//write function to add randomMove in fixed position


// Adds a tile in a random position
AgentBrain.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        console.log("add random tile");
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
    //console.log(moved);
    if (moved) {
        //this.addRandomTile(); adds in random tile at end of turn
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
    //brain.printGrid(brain.grid.cells);
    // Use the brain to simulate moves
    // brain.move(i) 
    // i = 0: up, 1: right, 2: down, 3: left
    // brain.reset() resets the brain to the current game board
    
    //expectimax = function(brain, depth, player)
    var bestScore = 0; var score = 0; var bestMove;
    for(var i=0; i<4; i++) {
        if (brain.move(i))
            score = this.expectimax(brain, 1, 2);
        if(score > bestScore) {
            bestScore = score; bestMove = i;
        }
        brain.reset();
    }
    return bestMove;
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

Agent.prototype.evaluateGrid = function (board) {
    // calculate a score for the current grid configuration
    //freetiles + (1-snake) + matching tiles + score
    this.printGrid(board.cells);
    var score = 0, free = 0, matches = 0, snake = 0, highestVal = 0;
    for(var x=0; x<board.size; x++) {
        for(var y=0; y<board.size; y++) {
            if(board.cells[x][y]) {
                //look for neighbor values
                var tile = board.cells[x][y];
                var inc_snake = 0, dec_snake = 0, match = 0;
                inc_snake = this.checkNeighbor(board.cells, tile, tile.value*2);
                if(tile.value > 2) { dec_snake = this.checkNeighbor(board.cells, tile, tile.value/2); }
                match = this.checkNeighbor(board.cells, tile, tile.value);
                
                //calculate bonuses for friendly neighbors
                if(inc_snake < 1 && dec_snake < 1) { snake -= tile.value; }
                if(match > 0) { matches += tile.value; }
                if(tile.value > highestVal) {highestVal = tile.value}
                score += tile.value;
            } else {
                free +=1;
            }
        }
    }
    //calculate up total score and return
    return (free * highestVal) + snake + matches;
};

Agent.prototype.checkNeighbor = function(board, tile, value) {
    var x = tile.x;
    var y = tile.y;
    var matches = 0;
    if(x-1 > -1 && board[x-1][y]) {
    //left
        if(board[x-1][y].value === value) {
            matches++;
        }
    } 
    if(x+1 < 4 && board[x+1][y]) {
    //right
        if(board[x+1][y].value === value) {
           matches++; 
        }
    }
    if(y-1 > -1 && board[x][y-1]) {
    //up
        if(board[x][y-1].value === value) {
            matches++;
        }
    }
    if(y+1 < 4 && board[x][y+1]) {
    //down
        if(board[x][y+1].value === value) {
            matches++;
        }
    }
    return matches;
};

Agent.prototype.expectimax = function(brain, depth, player) {
    //if gameovr return evaluate
    if(depth === 0) {
        console.log("expectimax");
        this.printGrid(brain.grid.cells);
        return this.evaluateGrid(brain.grid);}
    else if(player === 1)
        return this.maxScore(brain, depth-1);
    else if(player === 2)
        return this.expectScore(brain, depth-1);
        //return {maxvalue, bestmove};
};

Agent.prototype.maxScore = function(brain, depth) {
    var score;
    var oldGrid = brain.grid.serialize();
    //foreach move{0,1,2,3}
    for(var i = 0; i < 4; i++) {
        var moved = brain.move(i);
        if(moved) {
            score = Math.max(score, this.expectimax(brain, depth, 2));
        }
        brain.loadGrid(oldGrid);
    }
    return score;
};

Agent.prototype.expectScore = function(brain, depth) {
    var oldGrid = brain.grid.serialize();
    var cells = brain.grid.availableCells();
    var sum = 0;
    for(var i=0; i < cells.length; i++) {
        var p = (1/cells.length) * 0.9; //multiplied by tiles that can be occupied by 2 or 4
        brain.addTile(cells[i], 2);
        sum += p * this.expectimax(brain, depth, 1);
        //may switch out for mote carlo
    }
    return sum;
};