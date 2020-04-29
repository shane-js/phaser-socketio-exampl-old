var app = angular.module('SimpleHeroApp', ['ui.bootstrap']);


app.controller('indexCtrl', ['$scope', '$window', '$uibModal', function ($scope, $window, $uibModal) {

        $scope.loginParams = {'nickname':''};
        var loginModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'public/views/loginModal.html',
            scope: $scope,
            backdrop: 'static',
            size: null,
            resolve: {
            }
        });

        $scope.game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'simple-hero-game', { init: init, preload: preload, create: create, update: update, render: render });
        var socket = io.connect();


        function init() {
            $scope.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            $scope.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            function resizeGame() {
                $scope.game.scale.setGameSize($window.innerWidth, $window.innerHeight);
            }

            angular.element($window).bind('resize', function () {
                resizeGame();
            });

        }


        var player;
        var playerSprite;
        var playerStartX;
        var playerStartY;
        var playerReady = false;
        var otherPlayers = [];
        var clientActiveMobCamps = [];
        var clientActiveMobs = [];
        var clientActiveMobCampsGroup;
        var cursors;
        var map;
        var worldTileWidth = 600;
        var worldTileHeight = 600;
        var worldBoundsWidth = 6000;
        var worldBoundsHeight = 6000;

        //layers       
        var mobCampLayer;
        var mobMembersLayer;
        var pickupsLayer;
        var otherPlayersLayer;
        var playerLayer;
        var hudLayer;
      

        //HUD Variable Declaration
        var playerHUD;
        var playerCountText;
        var levelUpText;
        $scope.levelUp = false;

        function preload() {
            $scope.game.load.spritesheet('dude', '/public/assets/playerspritesheet.png', 71.66, 93.25); //273 is quanity gotten by calculating width / 64 * height/64

            //load Mobs / Mob Camps
            $scope.game.load.spritesheet('spiderMobCamp', '/public/assets/mobs/spiderMobCamp.png', 150, 150);
            $scope.game.load.spritesheet('spiderMob', '/public/assets/mobs/spiderMob.png', 100, 100);
            $scope.game.load.spritesheet('goblinMobCamp', '/public/assets/mobs/goblinMobCamp.png', 150, 150);
            $scope.game.load.spritesheet('goblinMob', '/public/assets/mobs/goblinMob.png', 100, 100);
            $scope.game.load.spritesheet('puddleMonsterMobCamp', '/public/assets/mobs/puddleMonsterMobCamp.png', 150, 150);
            $scope.game.load.spritesheet('puddleMonsterMob', '/public/assets/mobs/puddleMonsterMob.png', 100, 100);

        }

        function create() {
            //layers - last is highest on screen  
            mobCampLayer = $scope.game.add.group();
            mobMembersLayer = $scope.game.add.group();
            pickupsLayer = $scope.game.add.group();
            otherPlayersLayer = $scope.game.add.group();
            playerLayer = $scope.game.add.group();
            hudLayer = $scope.game.add.group();

        


            cursors = $scope.game.input.keyboard.createCursorKeys();

            $scope.game.physics.startSystem(Phaser.Physics.ARCADE);

            //map
            $scope.game.world.setBounds(0, 0, worldBoundsWidth, worldBoundsHeight);
            $scope.game.stage.backgroundColor = '#75d181';

            playerStartX = $scope.game.world.centerX; //NEEDS TO BE TOLD BY SERVER NOT CLIENT
            playerStartY = $scope.game.world.centerY; //NEEDS TO BE TOLD BY SERVER NOT CLIENT
          
            

            //end of create
        }

        function update() {
            if (playerReady) {
                //update status bars
                player.hpBar.updateStatusBar({$scope: $scope, currentValue: player.currentHP, maxValue: player.maxHP});
                player.expBar.updateStatusBar({ $scope: $scope, currentValue: player.currentEXP, maxValue: player.maxEXP });
                if ($scope.levelUp) {
                    var levelUpTextStyle = { font: "23px Lucida Sans Unicode, Lucida Grande, sans-serif", stroke: '#FFFFFF', strokeThickness: 4, fill: "#86DC2E", align: "left" };
                    levelUpText = $scope.game.add.text(($scope.game.camera.width * .01) + (player.expBar.statusBarBackgroundSprite.width + 10), ($scope.game.camera.height * .05) - 5, "+!", levelUpTextStyle);
                    levelUpText.fixedToCamera = true;
                    levelUpText.alpha = 0;
                    levelUpTextFadeTween = $scope.game.add.tween(levelUpText).to({ alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
                    hudLayer.add(levelUpText);
                    $scope.game.time.events.add(Phaser.Timer.SECOND * 10, function () {
                        levelUpTextFadeTween.alpha = 1;
                        levelUpTextFadeTween.stop();
                    });
                    $scope.game.time.events.add(Phaser.Timer.SECOND * 15, function(){
                        levelUpText.destroy();
                   });


                    $scope.levelUp = false;
                };

                playerSprite.body.velocity.setTo(0, 0)
                if ($scope.game.input.mousePointer.isDown) {
                    //handle sprite direction animation
                    var angleToMouse = $scope.game.physics.arcade.angleToPointer(player) * 180 / Math.PI; //* 180 / Math.PI to convert radians to degrees
                    if (angleToMouse > -25 && angleToMouse < 25) {
                        playerSprite.animations.play('right');
                    } else if (angleToMouse < -155 || angleToMouse > 155) {
                        playerSprite.animations.play('left');
                    } else if (angleToMouse < -65 && angleToMouse > -115) {
                        playerSprite.animations.play('up');
                    } else if (angleToMouse > 65 && angleToMouse < 115) {
                        playerSprite.animations.play('down');
                    }
                    //  400 is the speed it will move towards the mouse
                    $scope.game.physics.arcade.moveToPointer(playerSprite, 400);

                    //  if it's overlapping the mouse, don't move any more
                    if (Phaser.Rectangle.contains(playerSprite.body, $scope.game.input.x, $scope.game.input.y)) {
                        playerSprite.body.velocity.setTo(0, 0);
                    }

                    //console.log(player.position.x + ', ' + player.position.y);0001

                }
                else {
                    playerSprite.body.velocity.setTo(0, 0);
                    playerSprite.animations.stop();
                    playerSprite.frame = 7;
                }
            };
           
        }

        function render() {
        }


        //listening to server
        socket.on('gameStatsUpdate', function (data) {
            if (playerReady) {
                playerCountText.setText("This server: " + data.currentPlayerCount + "/100 players")
            };
        });

        socket.on('s2c new player', function (data) {
            var newPlayer = new Player(data);
            var newPlayerSprite = $scope.game.add.sprite(data.x, data.y, 'dude');
            otherPlayersLayer.add(newPlayerSprite);
            newPlayer.setSprite(newPlayerSprite);
            $scope.addNicknameLabelToSprite(newPlayerSprite, data.nickname);
            $scope.game.physics.arcade.enable(newPlayerSprite);
            newPlayerSprite.body.bounce.set(0);
            otherPlayers.push(newPlayer);
        });

        socket.on('remove player', function (data) {
            var removePlayer = getPlayerById(data.id);
            if (!removePlayer) {
                console.log("Player not found: " + this.id);
                return;
            };
            removePlayer.destroySprite();
            otherPlayersLayer.remove(removePlayer.getSprite());
            otherPlayers.splice(otherPlayers.indexOf(removePlayer), 1);

        });

        socket.on("s2c core updates", function (data) {
            if (!playerReady){ return;} //Player not ready to receive this yet
            data.activeMobCamps.forEach(function(mobCampUpdate){
                mobCampUpdate.mobMembers.forEach(function(mobMemberUpdate){
                    var mobMemberToUpdate = getMobMemberByID(mobMemberUpdate.id);
                    if(mobMemberToUpdate && (mobMemberToUpdate.x !== mobMemberUpdate.x || mobMemberToUpdate.y !== mobMemberUpdate.y)){
                        $scope.game.add.tween(mobMemberToUpdate.getSprite()).to({ x: mobMemberUpdate.x, y: mobMemberUpdate.y }, 375, Phaser.Easing.Linear.None, true);
                    };
                    if(mobMemberToUpdate){
                        mobMemberToUpdate.update(mobMemberUpdate);
                    };
                });
            });
            data.players.forEach(function(playerUpdate){
                var playerToUpdate = getPlayerById(playerUpdate.id);
                if(playerToUpdate && (playerToUpdate.x !== playerUpdate.x || playerToUpdate.y !== playerUpdate.y)){
                    $scope.game.add.tween(playerToUpdate.getSprite()).to({ x: playerUpdate.x, y: playerUpdate.y }, 375, Phaser.Easing.Linear.None, true);
                }
                if(playerToUpdate){
                  playerToUpdate.update(playerUpdate);
                }else if(player.id == playerUpdate.id){
                    player.update(playerUpdate);
                };
           
            });
        });

        socket.on("server requesting player updates", function (data) {
            if (player) {
                socket.emit('move player', { x: playerSprite.position.x, y: playerSprite.position.y });
            };
           
        });

        socket.on("s2c update mobs", function (data) {
            if (!playerReady){ return;} //Player not ready to receive this yet
            clientActiveMobCamps.forEach(function (mobCamp) {
                //this will also destroy/remove all mob members of this camp
                mobCamp.destroySprite({ mobMembersLayer: mobMembersLayer });
                mobCampLayer.remove(mobCamp.getSprite());
            });
            clientActiveMobCamps = [];
            data.activeMobCamps.forEach(function (activeMobCamp) {
                var newClientMobCamp = new MobCamp(activeMobCamp);
                var newClientMobCampSprite = $scope.game.add.sprite(activeMobCamp.x, activeMobCamp.y, activeMobCamp.mobCampType.typeDesc + 'MobCamp'); //ex 'spiderMobCamp'
                mobCampLayer.add(newClientMobCampSprite);
                newClientMobCamp.setSprite(newClientMobCampSprite);
                $scope.game.physics.arcade.enable(newClientMobCamp);
                clientActiveMobCamps.push(newClientMobCamp);
                newClientMobCamp.mobMembers.forEach(function (mobMember){
                    //Needs converted to use client mob class
                    var clientMobMemberSprite = $scope.game.add.sprite(mobMember.getX(), mobMember.getY(), activeMobCamp.mobCampType.typeDesc + 'Mob'); //ex 'spiderMob'
                    clientMobMemberSprite.id = mobMember.id;
                    clientMobMemberSprite.isMob = true;
                    mobMember.setSprite(clientMobMemberSprite);
                    mobMember.hpBar = new StatusBar({ $scope: $scope, parentSprite: clientMobMemberSprite, statusBarOwner: mobMember, background:{color: '#67717D', size: { x: 75, y: 6 }, position:{x:(clientMobMemberSprite.width / 2), y: -10}},
                                                     bar: {color: '#E13921', size: {x: 65, y: 3}} });
                    mobMembersLayer.add(clientMobMemberSprite);
                    clientActiveMobs.push(mobMember);

                    $scope.game.physics.arcade.enable(clientMobMemberSprite);
                    clientMobMemberSprite.inputEnabled = true;
                    clientMobMemberSprite.events.onInputUp.add($scope.onMobClicked, this);

                });

            });

        });

        socket.on("s2c health update", function (data) { $scope.onUpdateHealth(data); });
        
        socket.on("s2c player update", function(data){
            if(typeof data.currentEXP !== 'undefined'){
                player.currentEXP = data.currentEXP;
            };
             if(typeof data.maxEXP !== 'undefined'){
                player.maxEXP = data.maxEXP;
            };
             if(typeof data.currentHP !== 'undefined'){
                player.currentHP = data.currentHP;
            };
             if(typeof data.maxHP !== 'undefined'){
                player.maxHP = data.maxHP;
            };
            if (typeof data.level !== 'undefined') {
                if (player.level < data.level) {
                    $scope.levelUp = true;
                };
                player.level = data.level;
            };
        });

        function getPlayerById(id) {
            var i;
            for (i = 0; i < otherPlayers.length; i++) {
                if (otherPlayers[i].id == id)
                    return otherPlayers[i];
            };

            return false;
        };

          function getMobMemberByID(id) {
            var i;
            for (i = 0; i < clientActiveMobs.length; i++) {
                if (clientActiveMobs[i].id == id)
                    return clientActiveMobs[i];
            };

            return false;
        };

        $scope.addNicknameLabelToSprite = function (sprite, labelText) {
            var nicknameLabel = $scope.game.add.text(sprite.width / 2, sprite.height + 15, labelText, { font: '24px Arial', fill: '#FF0000', align: 'center' });
            nicknameLabel.anchor.set(0.5)
            sprite.addChild(nicknameLabel);
        };

        $scope.loginAsGuest = function () {
            socket.emit("c2s new player", { x: playerStartX, y: playerStartY, nickname: $scope.loginParams.nickname });
            socket.on("s2c login accepted", function (data) {
                player = new Player(data);
                playerSprite = $scope.game.add.sprite(player.getX(), player.getY(), 'dude');
                player.setSprite(playerSprite);
                $scope.addNicknameLabelToSprite(playerSprite, $scope.loginParams.nickname);

                playerLayer.add(playerSprite);
                $scope.game.physics.arcade.enable(playerSprite);
                playerSprite.animations.add('left', [9, 10, 11], 10, true);
                playerSprite.animations.add('right', [3, 4, 5], 10, true);
                playerSprite.animations.add('up', [0, 1, 2], 10, true);
                playerSprite.animations.add('down', [6, 7, 8], 10, true);


                $scope.game.camera.follow(playerSprite);


                //Heads Up Display
                ////player count
                playerCountText = $scope.game.add.text($scope.game.camera.width * .01, $scope.game.camera.height * .95, "This server: 0/100 players", {
                    font: "18px Lucida Sans Unicode, Lucida Grande, sans-serif",
                    fill: "#FFFFFF",
                    align: "left",
                    backgroundColor: 'rgba(100, 100, 108, 0.28)'
                });
                playerCountText.fixedToCamera = true;
                hudLayer.add(playerCountText);

                ////hp bar
                player.hpBar = new StatusBar({ $scope: $scope, parentSprite: player.getSprite(), statusBarOwner: player, background:{color: '#67717D', size: { x: 300, y: 20 }, position:{x:($scope.game.camera.width * .01), y: ($scope.game.camera.height * .02), fixedToCamera: true}},
                                                 bar: {color: '#E13921', size: {x: 280, y: 15}, position:{x: ($scope.game.camera.width * .0175), y:($scope.game.camera.height * .023), fixedToCamera: true}}});
                hudLayer.add(player.hpBar.statusBarBackgroundSprite);
                hudLayer.add(player.hpBar.statusBarSprite);
                
                ////exp bar
                player.expBar = new StatusBar({ $scope: $scope, parentSprite: player.getSprite(), statusBarOwner: player, background:{color: '#67717D', size: { x: 300, y: 20 }, position:{x:($scope.game.camera.width * .01), y: ($scope.game.camera.height * .05), fixedToCamera: true}},
                                                 bar: {color: '#E9F200', size: {x: 280, y: 15}, position:{x: ($scope.game.camera.width * .0175), y:($scope.game.camera.height * .053), fixedToCamera: true}}});
                hudLayer.add(player.expBar.statusBarBackgroundSprite);
                hudLayer.add(player.expBar.statusBarSprite);


                $scope.game.world.bringToTop(hudLayer);
                //End Heads Up Display

                playerReady = true;
                loginModalInstance.dismiss();
            });
           
        };

        $scope.onMobClicked = function (spriteOfMobClicked) {
            if (!playerReady) { return; } //Player not ready to receive this yet
            spriteOfMobClicked.tint = 0xff0000; 
            $scope.game.time.events.add(Phaser.Timer.SECOND * .2, function () { spriteOfMobClicked.tint = 0xffffff; });
            socket.emit("c2s attack", { attacker: { id: player.id, isMob: player.isMob }, defender: { id: spriteOfMobClicked.id, isMob: spriteOfMobClicked.isMob } });
        };

        $scope.onUpdateHealth = function (entityToUpdate) {
            if (entityToUpdate.isMob) { var list = clientActiveMobs; } else { var list = otherPlayers; };
            var entity = $scope.getFromListByID(list, entityToUpdate.id);
            entity.currentHP = entityToUpdate.currentHP;
            entity.hpBar.updateStatusBar({$scope:$scope,currentValue:entity.currentHP, maxValue:entity.maxHP});
            if(entity.currentHP <= 0){
                $scope.game.time.events.add(Phaser.Timer.SECOND * .2, function () { entity.getSprite().tint = 0x736f80; });
            };
        };

        $scope.getFromListByID = function(list, id) {
            var i;
            for (i = 0; i < list.length; i++) {
                var listMember = list[i];
                if (listMember.id == id)
                    return listMember;
            };

            return false;
        };

}]);

app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});