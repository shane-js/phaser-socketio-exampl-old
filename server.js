var socketio = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
uuid = require('node-uuid');
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
app.use('/public', express.static(path.join(__dirname, '/public')));

var port = process.env.port || 1337;
var server = app.listen(port);
var io = require('socket.io').listen(server);

//classes
var Player = require('./serverClasses/Player_s.js').Player;
var MobCamp = require('./serverClasses/MobCamp_s.js').MobCamp;
var MobMember = require('./serverClasses/MobMember_s.js').MobMember;

//vars
var players;
var activeMobCamps;
var activeMobs;
var worldHeight;
var worldWidth;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/views/index.html'));
});

function init() {
    players = [];
    activeMobCamps = [];
    activeMobs = [];
    worldHeight = 6000;
    worldWidth = 6000;
    worldReset(); //clear and build world for the first time
};

var playerCount = 0;
io.sockets.on('connection', function (socket) {
    //send current player count/highscores to clients every 5 seconds
    setInterval(function () {
        socket.emit('gameStatsUpdate', {
            'highscores': [{ playerName: "player1", score: 5000 }, { playerName: "player2", score: 4000 }, { playerName: "player3", score: 3000 }],
            'currentPlayerCount': playerCount           
        });
    }, 5000);


    console.log("New player has connected: " + socket.id);
    socket.on("disconnect", function (data) {
        if (verifyPlayerIsLoggedInBySocketID(this.id)) {
            onClientDisconnect({ socket: this });
        };
    });
    socket.on("c2s new player", function (data) {
        onNewPlayer({ x: data.x, y: data.y, nickname: data.nickname, socket: this });
        sendActiveMobsToClients(this);
    });
    socket.on("remove player", onRemovePlayer);
    socket.on("move player", function (data) {
        onMovePlayer({ x: data.x, y: data.y, socket: this });
    });
    socket.on("c2s attack", function (data) {
        if (verifyPlayerIsLoggedInBySocketID(this.id)) {
            onAttack(data);onMovePlayer
        };
      
    });
   
});

function verifyPlayerIsLoggedInBySocketID(socketID) {
    return getFromListByID(players, socketID) ? true : false;
};

function getFromListByID(list,id) {
    var i;
    for (i = 0; i < list.length; i++) {
        var listMember = list[i];
        if (listMember.id == id)
            return listMember;
    };

    return false;
};




function onClientDisconnect(data) {
    playerCount--;
    onRemovePlayer({ playerID: data.socket.id, socket: data.socket });
    console.log('Player disconnected!');
};

function onNewPlayer(data) {
    playerCount++;
    var newPlayer = new Player({ x:data.x, y:data.y, nickname:data.nickname, id: data.socket.id});
    //let client know they were allowed login
    data.socket.emit("s2c login accepted", newPlayer);
    //let all the other clients know of new player
    data.socket.broadcast.emit("s2c new player", { id: newPlayer.id, x: newPlayer.x, y: newPlayer.y, nickname: newPlayer.nickname });
    //let the new player know of all the already connected players
    var existingPlayer;
    for (var i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        data.socket.emit("s2c new player", { id: existingPlayer.id, x: existingPlayer.x, y: existingPlayer.y, nickname: existingPlayer.nickname });
    };
    players.push(newPlayer);

};

function onRemovePlayer(data) {
    var removePlayer = getFromListByID(players,data.playerID);

    if (!removePlayer) {
        console.log("Player not found: " + data.playerID);
        return;
    };

    players.splice(players.indexOf(removePlayer), 1);
    data.socket.broadcast.emit("remove player", { id: data.playerID });
}

function onMovePlayer(data) {
    var playerID = data.socket.id;
    var player = getFromListByID(players, playerID);
    if (player) {
        var newX = data.x;
        var newY = data.y;
        var socketOfPlayerMoving = data.socket;
        player.x = newX;
        player.y = newY;
        //socketOfPlayerMoving.broadcast.emit('player moved', { playerID: player.id, x: player.x, y: player.y }); //moving this to be in coreUpdates of gameloop
    };
 
};

function onAttack(data) {
    if (data.attacker.isMob) { var attackerFromList = activeMobs; } else { var attackerFromList = players; };
    if (data.defender.isMob) { var defenderFromList = activeMobs; } else { var defenderFromList = players; };
    if (attackerFromList == defenderFromList) { return; }; //no pvp at the moment and mobs can't attack mobs
    var attacker = getFromListByID(attackerFromList, data.attacker.id);
    var defender = getFromListByID(defenderFromList, data.defender.id);
    if (defender.currentHP > 0) {
        defender.currentHP -= getDamageDealt(attacker, defender);
        if (defender.currentHP <= 0) {
            //Meaning defender was killed on this hit
            if(!data.attacker.isMob){ //if attacker was a player reward exp
                attacker.acceptEXP(defender.expReward);
                io.to(attacker.id).emit('s2c player update', {level: attacker.level, currentEXP: attacker.currentEXP, maxEXP: attacker.maxEXP});
            };
        };
    }; //can't have negative health so no point in attacking
    // TODO Verify on server level they are within range / able to be hit
    io.sockets.emit('s2c health update', { id: defender.id, currentHP: defender.currentHP, isMob: data.defender.isMob});

};

function getDamageDealt(attacker, defender) {
        var attackerLevelBonus = attacker.level / 100;
        var defenderDefLevelEffectiveness = Math.random() - attackerLevelBonus;
        if (defenderDefLevelEffectiveness < 0) { defenderDefLevelEffectiveness = 0; };
        var damageDone = Math.ceil(attacker.attackLevel - (defender.defenseLevel * defenderDefLevelEffectiveness));
        if (damageDone < 0) { damageDone = 0; };
        if (damageDone > defender.currentHP) { damageDone = defender.currentHP;};
        return damageDone;
};


function gameLoop() {
    io.sockets.emit('server requesting player updates', {});
    removeExpiredItems();
    sendCoreUpdates();
};

function sendCoreUpdates(){
    //send basic stats and coordinates for all mob camps/mob memberss and players
    io.sockets.emit('s2c core updates', {activeMobCamps: activeMobCamps, players: players});
};

function removeExpiredItems() {
    //go through all current items on floor (according to server) and delete them - send out msg to client to delete them
};

global.randomReturnFromList = function(params) {
    //params include list and  useRarity
    var itemToReturn = false;
    while (itemToReturn == false) {
        //First copy the list
        var copyOfList = params.list.slice();
        var selectedListItemToRollFor = copyOfList[Math.floor(Math.random() * params.list.length)];
        if (params.useRarity) { //meaning not everything in the list should have an equal chance of being selected
            //Now roll to see if we should keep it or otherwise while loop kicks in again and reselects;
            var roll = Math.random()
            if (roll <= selectedListItemToRollFor.rarity) { itemToReturn = selectedListItemToRollFor; };
        } else {
            itemToReturn = selectedListItemToRollFor;
        }
       
    };
    return itemToReturn;
};

var possibleMobCampCoords = [{ x: 500, y: 500 }, { x: 1000, y: 1000 }, { x: 1500, y: 1500 }, { x: 2000, y: 2000 }, { x: 2500, y: 2500 },
    { x: 3000, y: 3000 }, { x: 3500, y: 3500 }, { x: 4000, y: 4000 }, { x: 4500, y: 4500 }, { x: 5000, y: 5000 }, { x: 5500, y: 5500 }];
var possibleMobCampTypes = [{ mobCampTypeID: 1, typeDesc: 'goblin', rarity: .99 }, { mobCampTypeID: 2, typeDesc: 'spider', rarity: .99 }, { mobCampTypeID: 3, typeDesc: 'puddleMonster', rarity: .99 }];
function worldReset() {
    removeLeftoverMobs();
    generateNewMobs();
};
function removeLeftoverMobs() {
    activeMobCamps = [];
    sendActiveMobsToClients(); 
};

function generateNewMobs() {
    possibleMobCampCoords.forEach(function (mobCampPosition) {
        var selectedMobCampType = randomReturnFromList({ list: possibleMobCampTypes, useRarity: true });
        var newMobCamp = new MobCamp({ mobCampType: selectedMobCampType, x: mobCampPosition.x, y: mobCampPosition.y, mobMembers: [] });
        activeMobCamps.push(newMobCamp);
        activeMobs = activeMobs.concat(newMobCamp.mobMembers);
        //console.log("mob spawned: " + JSON.stringify(newMobCamp));
    });
    sendActiveMobsToClients(); 
};
function sendActiveMobsToClients(specificClientSocket) {
    if (typeof specificClientSocket == 'undefined') { specificClientSocket = null;}; //default param
    if (specificClientSocket) {
        specificClientSocket.emit('s2c update mobs', { activeMobCamps: activeMobCamps });
    } else {
        io.sockets.emit('s2c update mobs', { activeMobCamps: activeMobCamps });
    };
};

//on launch
setInterval(gameLoop, 400);
setInterval(worldReset, 60000);
init();