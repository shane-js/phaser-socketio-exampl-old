function MobMember(params) {
    var self = this;
    this.x = params.x;
    this.y = params.y;
    var id = uuid.v4();
    var belongsToMobCampID = params.belongsToMobCampID;
    var currentHP = 100;
    var maxHP = 100;
    var level = 1;
    var attackLevel = 1; //TODO needs to be generated on a per mob type basis
    var defenseLevel = 1;  //TODO needs to be generated on a per mob type basis
    var expReward = 50;


    var possibleMovesList = [{direction: 'noMove', xAdjustment: 0, yAdjustment: 0},{direction:'left', xAdjustment: -10, yAdjustment: 0}];
    var randomMove = function(){
        var selectedMove = randomReturnFromList({list:possibleMovesList,useRarity:false});
        self.x += selectedMove.xAdjustment;
        self.y += selectedMove.yAdjustment;
    };
    setInterval(randomMove, 5000);
    

    return {
        x: this.x,
        y: this.y,
        id: id,
        belongsToMobCampID: belongsToMobCampID,
        currentHP: currentHP,
        maxHP: maxHP,
        level: level,
        attackLevel: attackLevel,
        defenseLevel: defenseLevel,
        expReward: expReward
    }
};

exports.MobMember = MobMember;