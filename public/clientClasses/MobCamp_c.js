function MobCamp(mobCampParams) {
    var x = mobCampParams.x;
    var y = mobCampParams.y;
    var id = mobCampParams.id;
    var mobCampType = mobCampParams.mobCampType;
    var mobMembers; //convert to client class for mob members below
    var sprite;


    var generateMobMembers = function (listOfServerMobMembers) {
        var clientMobMembers = [];

        listOfServerMobMembers.forEach(function (serverMobMember) {
            var newClientMobMember = new MobMember(serverMobMember);
            clientMobMembers.push(newClientMobMember);
        });


        return clientMobMembers;
    };
    mobMembers = generateMobMembers(mobCampParams.mobMembers);

    var getX = function () {
        return x;
    };

    var getY = function () {
        return y;
    };

    var setX = function (newX) {
        x = newX;
    };

    var setY = function (newY) {
        y = newY;
    };

    var setSprite = function (newSprite) {
        sprite = newSprite;
    };
    var getSprite = function () {
        return sprite;
    };
    var destroySprite = function (params) {
        sprite.destroy();
        //destroy sprites of mobs belonging to this camp
        mobMembers.forEach(function (mobMember) {
            params.mobMembersLayer.remove(mobMember.getSprite());
            mobMember.destroySprite();
        });
    };


    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        getSprite: getSprite,
        setSprite: setSprite,
        destroySprite: destroySprite,
        id: id,
        mobMembers: mobMembers
    }
};
