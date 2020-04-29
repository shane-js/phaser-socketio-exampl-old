function Player(params) {
    this.x = params.x;
    this.y = params.y;
    this.id = params.id;
    this.sprite;
    this.nickname = params.nickname;
    this.hpBar = new StatusBar();
    this.currentHP = params.currentHP;
    this.maxHP = params.maxHP;
    this.expBar = new StatusBar();
    this.currentEXP = params.currentEXP;
    this.maxEXP = params.maxEXP;
    this.level = params.level;
    this.attackLevel = params.attackLevel;
    this.defenseLevel = params.defenseLevel;

    this.update = function(playerClassFromServer){
        this.x = playerClassFromServer.x;
        this.y = playerClassFromServer.y;
        this.currentHP = playerClassFromServer.currentHP;
        this.maxHP = playerClassFromServer.maxHP;
        this.level = playerClassFromServer.level;
        this.currentEXP = playerClassFromServer.currentEXP;
        this.maxEXP = playerClassFromServer.maxEXP;
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
        nickname: this.nickname,
        currentHP: this.currentHP,
        maxHP: this.maxHP,
        currentEXP: this.currentEXP,
        maxEXP: this.maxEXP,
        level: this.level,
        attackLevel: this.attackLevel,
        defenseLevel: this.defenseLevel
    }
};
