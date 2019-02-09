
//nasty way to get the first part of the url
var socket = io.connect(window.location.href.toString().split('/d')[0]);

//focus the score input
document.getElementById("scoreField").focus();

//structure of the game
var game = {
	players: [],
	winners: [],
	currentPlayer: 0
};

//structure of the shot
var player = {
	name: "",
	score: 501,
	shots: []
}

//get player's name
player.name = prompt("Please enter your name:");
document.title = "Darts: " + player.name 
socket.emit('newPlayer', JSON.stringify(player));

var refTable = document.getElementById("table");
var ctx = document.getElementById("myChart");

//init chart and set options
var myChart = new Chart(ctx, {
  type: 'line',
  options: {
    responsive:true,
    maintainAspectRatio: false
  },
  data: {
    datasets: []
  }
});


//init callback for keyboard input 
document.getElementById("scoreField").addEventListener("keypress", function(e){
    if(e.which == 13) {
        
        //parse the value 
        var score = parseInt(document.getElementById("scoreField").value);
        
        //create the shot structure to send
        var newShot = {
            name: player.name,
            score: score
        }
        
        //erase the value in the field
        document.getElementById("scoreField").value = "";
        
        //share the shot
        socket.emit("newShot", JSON.stringify(newShot));
    }
});

//callback called when a client update the game
socket.on('newShot', function (data) {
    game = JSON.parse(data);
    updateTable();
});

//callback called when a new client join the server
socket.on('newPlayer', function (data) {
    game = JSON.parse(data);
    updateTable();
});

function updateTable(){
    
    //remove all lines from the table
    var rowsLength = refTable.rows.length;
    for(var i = 0; i < rowsLength - 1; i++){
        refTable.deleteRow(-1);
    }

    //update the table
    game.players.forEach(
        function(curEle){
            var newLine = refTable.insertRow(-1);
            var nameCell = newLine.insertCell(0);
            var scoreCell = newLine.insertCell(1);
            var averageCell = newLine.insertCell(2);
            nameCell.appendChild(document.createTextNode(curEle.name));
            scoreCell.appendChild(document.createTextNode(curEle.score));

            //calculate the average of shots
            var average = 0 
            for(var i = 0; i < curEle.shots.length; i++){
                average += curEle.shots[i];
            }
            average /= curEle.shots.length;

            averageCell.appendChild(document.createTextNode(average));

            if(curEle.name === game.players[game.currentPlayer].name){
                nameCell.style.backgroundColor = "#04e762";
                scoreCell.style.backgroundColor = "#04e762";
                averageCell.style.backgroundColor = "#04e762";
            }
        }
    );

    //update chart
    myChart.data.datasets = [];
    
    //init the xAxis values
    var xAxis = [];
    for( var i = 0; i < game.players[0].shots.length; i++){
        xAxis.push(i);
    } 
    myChart.data.labels = xAxis;
    
    //push the list of player's shots
    game.players.forEach(
        function(curEle, index){
            myChart.data.datasets.push({
                data: curEle.shots, 
                label: curEle.name,
                borderColor: getColor(index),
                fill: false
            });
        }
    );
    myChart.update();

}

//return colors 
function getColor(index){
    if(index === 0){
        return "#dc0073";
    }
    if(index === 1){
        return "#f5b700";
    }
    if(index === 2){
        return "#89fc00";
    }
    if(index === 3){
        return "#04e762";
    }
    if(index === 4){
        return "#00a1e4";
    }
}