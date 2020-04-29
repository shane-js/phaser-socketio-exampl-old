var MobMember = require('../serverClasses/MobMember_s.js').MobMember;

function MobCamp(newParams) {
    var x = newParams.x;
    var y = newParams.y;
    var id = uuid.v4();
    var mobCampType = newParams.mobCampType;
    var mobMembers = [];


    var generatePossibleMobCoords = function(){
        var possibleMobCoords = [];
        //based on mobCamps being 150px x 150px and 200 px spacing between center of mob and mobcamp in any direction and a total of 8 spawn points around camp
        var nextX = x - 200;
        var nextY = y - 200;
        for(var i = 0; i < 10; i++){
            if(!((nextX == x) && (nextY == y))){ //if it is not the center point for the mobcamp
                possibleMobCoords.push({x:nextX,y:nextY,alreadyUsed:false});            
            };
            nextX += 200;
            if(nextX > (x+200)){
                nextX = nextX - 600; //moving to next row
                nextY += 200;
            };
        };        
        return possibleMobCoords;
    };
    var possibleMobCoords = generatePossibleMobCoords();


    var generateMobs = function() {
        var mobList = [];

        for(var i = 0; i < 3; i++){ //add 3 mobs
            var nextPoint = null;
            //loop through points until one is available
            while(!nextPoint){
                var selectedPoint = randomReturnFromList({list:possibleMobCoords,useRarity:false});
                if(!selectedPoint.alreadyUsed){
                    selectedPoint.alreadyUsed = true;
                    nextPoint = selectedPoint;
                };
            };
            //needs to be converted to use mob class (which should generate an id there as well)
            mobList.push(new MobMember({ x: nextPoint.x, y: nextPoint.y, belongsToMobCampID: id}));
        };

        return mobList;
    };
    mobMembers = generateMobs();

    return {
        x: x,
        y: y,
        id: id,
        mobCampType: mobCampType,
        mobMembers : mobMembers
    }
};


exports.MobCamp = MobCamp;