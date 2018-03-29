var rows = 60 ;
var cols = 60;
var playing = false ;

var rndSeed = 123456 ;

var rules = [[0,0,0,1,0,0,0,1,1],   // first row: dead cell
             [0,0,1,1,0,0,0,0,0]] ; // Second row: live cell


var grid = new Array(rows) ;
var nextGrid = new Array(rows) ;

var timer ;
var reproductionTime = 10 ;
var counter = 0 ;

// Select the preferred function for counting,
// according to boundary conditions.
var countNeighbours = countNeighboursWRAP ;
//var countNeighbours = countNeighboursFIXED ;

function initializeGrids() {
   grid = new Array(rows) ;
   nextGrid = new Array(rows) ;
   for(var i = 0; i < rows; i++) {
      grid[i] = new Array(cols) ;
      nextGrid[i] = new Array(cols) ;
   }
}

function resetGrids() {
   for(var i = 0; i < rows; i++) {
      for(var j = 0; j < cols; j++) {
         grid[i][j] = 0 ;
         nextGrid[i][j] = 0 ;
      }
   }
 }

 function copyAndResetGrid() {
    for(var i = 0; i < rows; i++) {
      for(var j = 0; j < cols; j++) {
         grid[i][j] = nextGrid[i][j] ;
         nextGrid[i][j] = 0 ;
      }
   }
 }

 function updateView() {
    for(var i = 0; i < rows; i++) {
      for(var j = 0; j < cols; j++) {
         var cellid = i + "_" + j ;
         if(grid[i][j] == 0) {
            document.getElementById(cellid).setAttribute("class","dead") ;
         }
         else {
            document.getElementById(cellid).setAttribute("class","live") ;
         }
      }
    }
   document.getElementById("counter").innerHTML = "Generation: "+ counter ;
 }

function getBoundaryCondition() {
     var condition = document.querySelector('input[name = "boundary"]:checked').value;
     // NB: "eval" is extremely unsafe... we use it here because
     if(condition=="fixed") {
        countNeighbours = countNeighboursFIXED ;
     } else if(condition=="wrap") {
         countNeighbours = countNeighboursWRAP ;
     }
}

function getRuleSet() {
    var dead_rules = document.getElementsByName("rule_dead") ;
    var living_rules = document.getElementsByName("rule_living") ;
    for(var i=0 ; i < living_rules.length ; i++) {
      rules[0][i] = + dead_rules[i].checked ;
      rules[1][i] = + living_rules[i].checked ;
    }
}

// initialize
function initialize() {

   createTable() ;
   initializeGrids() ;
   resetGrids() ;
   setupControlButtons() ;

}

function createTable() {

   var gridContainer = document.getElementById("gridContainer") ;
   if(!gridContainer) {
      // throw error
      console.error("container div element not found.") ;
      }
    var mytable = document.getElementById("mytable") ;
    if(mytable != null)
       mytable.parentNode.removeChild(mytable) ;

   var table = document.createElement("table") ;
   table.setAttribute("id","mytable") ;

   for(var i=0 ; i<rows ; i++) {
      var tr = document.createElement("tr") ;
      for(var j=0 ; j<cols ; j++) {
         var cell = document.createElement("td") ;
         cell.setAttribute("class","dead") ;
         cell.setAttribute("id",i+"_"+j) ;
         cell.onclick = cellClickHandler ;
         tr.appendChild(cell) ;
         }
      table.appendChild(tr) ;
      }
   gridContainer.appendChild(table) ;
   }


 function cellClickHandler() {

    var rowcol = this.id.split("_");
    var row = rowcol[0] ;
    var col = rowcol[1] ;


   var classes = this.getAttribute("class") ;
   if(classes.indexOf("dead") > -1) {
      this.setAttribute("class","live") ;
      grid[row][col] = 1 ;
      }
   else {
      this.setAttribute("class","dead") ;
      grid[row][col] = 0 ;
      }
   }

 function setupControlButtons() {

   var startButton = document.getElementById("start") ;
   startButton.onclick = startButtonHandler ;

   var stepButton = document.getElementById("step") ;
   stepButton.onclick = stepButtonHandler ;

    var clearButton = document.getElementById("clear") ;
    clearButton.onclick = clearButtonHandler ;

    var randomButton = document.getElementById("random") ;
    randomButton.onclick = randomButtonHandler ;

    var sizeButton = document.getElementById("grid_size") ;
    sizeButton.onclick = sizeButtonHandler ;
 }


 function startButtonHandler() {
    if(playing) {
       console.log("Pause the game") ;
       playing = false ;
       this.innerHTML = "continue" ;
       clearTimeout(timer) ;
    } else {
       console.log("Continue the game.") ;
       playing = true ;
       this.innerHTML = "pause" ;
       getBoundaryCondition() ;
       getRuleSet() ;
       play() ;
    }
 }

 function clearButtonHandler() {
    console.log("Clear the game: stop playing, clear the grid");
    playing = false ;
    var startButton = document.getElementById("start") ;
    startButton.innerHTML = "start" ;
    clearTimeout(timer) ;
    counter = 0 ;
    resetGrids() ;
    updateView() ;
    /*
    var cellsList = document.getElementsByClassName("live") ;
    var cells = [] ;
    for(var i = 0 ; i < cellsList.length ; i++)
       cells.push(cellsList[i]) ;
    for(var i = 0 ; i < cells.length ; i++)
       cells[i].setAttribute("class","dead") ;
    resetGrids() ;
    */
 }

 function randomButtonHandler() {
   if(playing) return ;
   clearButtonHandler() ;
   rndSeed = + document.getElementById("seed").value ;
   console.log("The random seed is: "+rndSeed)
   for(var i = 0; i < rows; i++) {
      for(var j = 0; j < cols; j++) {
         var isLive = Math.round(myRandomGen()) ;
         if(isLive == 1) {
            var cell = document.getElementById(i+"_"+j) ;
            cell.setAttribute("class","live") ;
            grid[i][j] = 1 ;
         }
      }
    }
    // Change random seed
    rndSeed = Math.trunc(((new Date()).getTime()) % 1000000) ;
    document.getElementById("seed").value = rndSeed ;

 }

 function sizeButtonHandler() {
    if(playing) return ;
    rows = + document.getElementById("rows").value ; //Unary '+' operator converts
    cols = + document.getElementById("cols").value ; // string to number
    createTable() ;
    initializeGrids() ;
    resetGrids() ;
    counter = 0 ;
    updateView() ;
 }

function stepButtonHandler() {
    if(playing) return ;
    computeNextGen() ;

}

 function play() {
    console.log("Play the game.") ;
    computeNextGen() ;

    if(playing) {
      timer = setTimeout(play, reproductionTime)
    }


 }


 function computeNextGen() {
   counter++ ;
   for(var i = 0; i < rows; i++) {
      for(var j = 0; j < cols; j++) {
         applyRules(i,j) ;
      }
   }
   copyAndResetGrid() ;
   updateView () ;

 }


 function applyRules(row, col) {
    var numNeighbours = countNeighbours(row,col) ;
    nextGrid[row][col] = rules[grid[row][col]][numNeighbours] ;
    /*
    return ;
    if(grid[row][col] == 1) {
       if(numNeighbours < 2 || numNeighbours > 3) {
          nextGrid[row][col] = 0 ;
       }
       else {
          nextGrid[row][col] = 1 ;
       }
    }
    else if(grid[row][col] == 0) {
       if(numNeighbours == 3) {
          nextGrid[row][col] = 1 ;
       }
    }
    */
 }


/*function countNeighbours(row, col) {
    neighbours = -grid[row][col] ; // This avoids skipping central cell
    for(var i = -1 ; i < 2 ; i++)
      for(var j = -1 ; j < 2 ; j++) {
        //if(i == 0 && j == 0) continue ;
        if((row+i >= 0 && row+i < rows) && (col+j >= 0 && col+j < cols)) {
          //console.log(row,col,"...",row+i,col+j)
          neighbours += grid[row+i][col+j]
        }
      }
    return neighbours ;
 }
*/
function countNeighboursFIXED(row, col) {
    // Wall-like boundary conditions
    var neighbours = -grid[row][col] ; // This avoids skipping central cell
    for(var i = row-1 ; i <= row+1 ; i++)
      for(var j = col-1 ; j <=col+1 ; j++) {
        //if(i == 0 && j == 0) continue ;
        if((i >= 0 && i < rows) && (j >= 0 && j < cols)) {
           neighbours += grid[i][j] ;
        }
      }
    return neighbours ;
 }


function countNeighboursWRAP(row, col) {
    // Toroidal-like boundary conditions
    var neighbours = -grid[row][col] ; // This avoids skipping central cell
    for(var i = row-1 ; i <= row+1 ; i++)
      for(var j = col-1 ; j <=col+1 ; j++) {
        //if(i == 0 && j == 0) continue ;
        //if((i >= 0 && i < rows) && (j >= 0 && j < cols)) {
          //console.log(row,col,"...",row+i,col+j)
          neighbours += grid[(i+rows) % rows][(j+cols) % cols] ;
        //}
      }
    return neighbours ;
 }

 function myRandomGen(){
 // quick and dirty random number generator
 // with seeding.
   var x = Math.sin(rndSeed++) * 10000;
  return x - Math.floor(x);
}



 window.onload = initialize ;
