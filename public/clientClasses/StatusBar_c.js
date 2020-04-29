function StatusBar(params) {
    var parentSprite = params ? params.parentSprite : null;
    var statusBarOwner = params ? params.statusBarOwner : null;
    var statusBarSprite = null;
    var statusBarMaxWidth = null;
    var statusBarBackgroundSprite = null;


    if (parentSprite) {
        var $scope = params.$scope;
        var statusBarBackground = $scope.game.add.bitmapData(params.background.size.x, params.background.size.y);
        statusBarBackground.ctx.beginPath();
        statusBarBackground.ctx.rect(0, 0, params.background.size.x, params.background.size.y);
        statusBarBackground.ctx.fillStyle = params.background.color;
        statusBarBackground.ctx.fill();


        statusBarBackgroundSprite = $scope.game.add.sprite(params.background.position.x, params.background.position.y, statusBarBackground);
         if( typeof params.background.position.fixedToCamera !== 'undefined'){
            statusBarBackgroundSprite.fixedToCamera = params.background.position.fixedToCamera;
        }else{
            statusBarBackgroundSprite.anchor.set(0.5);
        };

        var statusBar = $scope.game.add.bitmapData(params.bar.size.x, params.bar.size.y);
        statusBar.ctx.beginPath();
        statusBar.ctx.rect(0, 0, params.bar.size.x, params.bar.size.y);
        statusBar.ctx.fillStyle = params.bar.color;
        statusBar.ctx.fill();

        
        statusBarMaxWidth = statusBar.width;

         if( typeof params.bar.position !== 'undefined'){
              statusBarSprite = $scope.game.add.sprite(params.bar.position.x, params.bar.position.y, statusBar);
              if( typeof params.bar.position.fixedToCamera !== 'undefined'){
                statusBarSprite.fixedToCamera = params.bar.position.fixedToCamera;
             };
        }else{
              statusBarSprite = $scope.game.add.sprite(statusBarBackgroundSprite.x - (statusBar.width/2), statusBarBackgroundSprite.y - (statusBar.height/2), statusBar);
        };
        
      
       


        parentSprite.addChild(statusBarBackgroundSprite);
        parentSprite.addChild(statusBarSprite);

    };

    var updateStatusBar = function(params){
        //expects params: {$scope: ,currentValue: , maxValue: }
        var $scope = params.$scope;
        var newWidth = (statusBarMaxWidth * .01) * ((params.currentValue / params.maxValue) * 100);
        if (newWidth <= 0) { newWidth = 0.5; };
        $scope.game.add.tween(statusBarSprite).to({ width: newWidth }, 200, Phaser.Easing.Linear.None, true);
    };

        return {
              parentSprite: parentSprite,
              statusBarSprite: statusBarSprite,
              statusBarBackgroundSprite: statusBarBackgroundSprite,
              statusBarMaxWidth: statusBarMaxWidth,
              updateStatusBar: updateStatusBar
    }
};
