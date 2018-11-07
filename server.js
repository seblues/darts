var express = require('express');
var app = express();
var os = require('os');
var server = require('http').createServer(app);  
var io = require('socket.io').listen(server);
app.use(express.static('./public'));
server.listen(8080);

//print the url of the application
var netIfaces = os.networkInterfaces();
console.log("http://" + netIfaces.wlo1[0].address.toString() + ":8080/darts.html");

//structure of the game
var game = {
	players: [],
	winners: [],
	currentPlayer: 0
}

//init the callbacks
io.on('connection', function (socket) {
	
	socket.on('newPlayer', function (data) {
		
		//add new player to the game
		var newPlayer = JSON.parse(data);
		game.players.push(newPlayer);
		
		console.log("new player: "+ newPlayer.name);
		
		//share the updated game with the other clients
		socket.emit("newPlayer", JSON.stringify(game));
		socket.broadcast.emit("newPlayer", JSON.stringify(game));
		
	});

    socket.on('newShot', function(data){
		
		//add new score
		console.log(data);
		var playerShot = JSON.parse(data);
		
		//find the index associated to the player name
		var playerIndex = game.players.findIndex(
			function(curEle){
				return curEle.name === playerShot.name;
			}
		);
		
		if(playerIndex === game.currentPlayer){
			
			//update the game
			if(game.players[playerIndex].score - playerShot.score < 0){
				game.players[playerIndex].shots.push(0);
			}
			else{	
				game.players[playerIndex].score -= playerShot.score;
				game.players[playerIndex].shots.push(playerShot.score);
			}

			//turn to the next player and ignore player with a null score
			var attempts = 0;
			do {
				game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

				//if all players have a null score then break
				if(attempts++ === game.players.length){
					break;
				}
				
			} while(game.players[game.currentPlayer].score === 0);

			//share the updated game to the other clients
			socket.emit("newShot", JSON.stringify(game));
			socket.broadcast.emit("newShot", JSON.stringify(game));
		}
	
	});

});



  
