var Player = function (params) {
    this.x = params.x;
    this.y = params.y;
    this.id = params.id;
    this.nickname = params.nickname;
    this.currentHP = 100;
    this.maxHP = 100;
    this.currentEXP = 1;
    this.maxEXP = 100;
    this.level = 1;
    this.attackLevel = 50; //for testing put back to 1 after
    this.defenseLevel = 1;

    this.acceptEXP = function(rewardedEXP){
        this.currentEXP += rewardedEXP;
        if(this.currentEXP >= this.maxEXP ){
            //level up
            this.level += 1;
            this.currentEXP = this.maxEXP - this.currentEXP;
            this.maxEXP = this.maxEXP * 2 + (Math.log(this.level) * 100);
        };
    };

   

    return {
        x: this.x,
        y: this.y,
        id: this.id,
        nickname: this.nickname,
        currentHP: this.currentHP,
        maxHP: this.maxHP,
        currentEXP: this.currentEXP,
        maxEXP: this.maxEXP,
        acceptEXP: this.acceptEXP,
        level: this.level,
        attackLevel: this.attackLevel,
        defenseLevel: this.defenseLevel
    }
};

exports.Player = Player;