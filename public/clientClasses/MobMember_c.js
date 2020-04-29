function MobMember(params) {
    this.x = params.x;
    this.y = params.y;
    this.id = params.id;
    this.mobCampType = params.mobCampType;
    this.mobMembers = params.mobMembers;
    this.sprite;
    this.hpBar = new StatusBar();
    this.currentHP = params.currentHP;
    this.maxHP = params.maxHP;
    this.level = params.level;
    this.attackLevel = params.attackLevel;
    this.defenseLevel = params.defenseLevel;
    this.expReward = params.expReward;

   this.update = function(mobMemberClassFromServer){
        this.x = mobMemberClassFromServer.x;
        this.y = mobMemberClassFromServer.y;
        this.currentHP = mobMemberClassFromServer.currentHP;
        this.maxHP = mobMemberClassFromServer.maxHP;
        this.level = mobMemberClassFromServer.level;
    };

    this.getX = function () {
        return this.x;
    };

    this.getY = function () {
        return this.y;
    };

    this.setX = function (newX) {
        this.x = newX;
    };

    this.setY = function (newY) {
        this.y = newY;
    };

    this.setSprite = function (newSprite) {
        this.sprite = newSprite;
    };
    this.getSprite = function () {
        return this.sprite;
    };
    this.destroySprite = function () {
        this.sprite.destroy();
    };


    return {
        update: this.update,
        getX: this.getX,
        getY: this.getY,
        setX: this.setX,
        setY: this.setY,
        getSprite: this.getSprite,
        setSprite: this.setSprite,
        destroySprite: this.destroySprite,
        id: this.id,
        hpBar: this.hpBar,
        currentHP: this.currentHP,
        maxHP: this.maxHP,
        level: this.level,
        attackLevel: this.attackLevel,
        defenseLevel: this.defenseLevel,
        expReward: this.expReward
    }
};
