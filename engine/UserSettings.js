var UserSettings = {};

UserSettings.cookieObj = {};

UserSettings.scores = [];
UserSettings.life = 6;
UserSettings.lastRestoreLifeTime = 0;
UserSettings.invulnerabilityTime = 0;

UserSettings.load = function(callback)
{
    var prepareSettings = function(data)
    {
        if(data)
        {
            delete data.isEmpty;
            UserSettings.cookieObj = data;
        }
        
        UserSettings.music = (typeof UserSettings.cookieObj.music == "undefined") ? 1 : UserSettings.cookieObj.music;
        UserSettings.effects = (typeof UserSettings.cookieObj.effects == "undefined") ? 1 : UserSettings.cookieObj.effects;
        UserSettings.stars = UserSettings.cookieObj.stars || [];
        UserSettings.purchasedStars = UserSettings.cookieObj.purchased_stars || 0;
        UserSettings.points = UserSettings.cookieObj.points || 0;
        UserSettings.coins = UserSettings.cookieObj.coins || 1000;
        UserSettings.tutorials = UserSettings.cookieObj.tutorials || [];
        UserSettings.scores = UserSettings.cookieObj.scores || [];
        UserSettings.life = (typeof UserSettings.cookieObj.life == "undefined") ? 6 : UserSettings.cookieObj.life;
        UserSettings.lastRestoreLifeTime = UserSettings.cookieObj.lastRestoreLifeTime || 0;
        UserSettings.invulnerabilityTime = UserSettings.cookieObj.invulnerabilityTime || 0;
        
        if(!UserSettings.cookieObj.bonuses) UserSettings.cookieObj.bonuses = [];

        for (var i= 0, len = UserSettings.cookieObj.bonuses.length; i<len; i++)
        {
            var b = UserSettings.cookieObj.bonuses[i];
            UserSettings.bonuses[b.name].available = b.available;
            UserSettings.bonuses[b.name].enable = b.enable;
            UserSettings.bonuses[b.name].active = b.active;
        }
        
        callback();
    }
    
    if(ExternalAPI.externalStorage)
    {
        ExternalAPI.exec("store", "load", null, prepareSettings);
    }
    else
    {
        var data = null;
        var str = Utils.getCookie(getGameDataId());
        if(str) data = JSON.parse(str);
        prepareSettings(data);
    }
};

UserSettings.save = function()
{
    UserSettings.cookieObj.music = UserSettings.music;
    UserSettings.cookieObj.effects = UserSettings.effects;
    UserSettings.cookieObj.stars = UserSettings.stars;
    UserSettings.cookieObj.purchased_stars = UserSettings.purchasedStars;
    UserSettings.cookieObj.points = UserSettings.points;
    UserSettings.cookieObj.coins = UserSettings.coins;
    UserSettings.cookieObj.tutorials = UserSettings.tutorials;
    UserSettings.cookieObj.bonuses = [];
    UserSettings.cookieObj.scores = UserSettings.scores;

    for (var k in UserSettings.bonuses)
    {
        var bonus = UserSettings.bonuses[k];
        if (bonus.available)
        {
            UserSettings.cookieObj.bonuses.push({name: bonus.name,
                                                    enable: bonus.enable,
                                                    available: bonus.available,
                                                    active: bonus.active});
        }
    }

    if(ExternalAPI.externalStorage)
    {
        ExternalAPI.exec("store", "save", {data: JSON.stringify(UserSettings.cookieObj)});
    }
    else
    {
        Utils.setCookie(getGameDataId(), JSON.stringify(UserSettings.cookieObj));
    }
};

UserSettings.buyItem = function(name)
{
    if (!UserSettings.bonuses[name])
    {
        console.log("There's no such bonus");
        return false;
    }
    if (this.coins >= UserSettings.bonuses[name].coast)
    {
        UserSettings.coins -= UserSettings.bonuses[name].coast;
        UserSettings.bonuses[name].enable = true;
        if (name == "moves" || name == "time")
        {
            UserSettings.bonuses["moves"].enable = true;
            UserSettings.bonuses["time"].enable = true;
        }
        UserSettings.save();
        return true;
    }
    else return false;
};

UserSettings.spendItem = function(name)
{
    UserSettings.bonuses[name].enable = false;
    if (name == "moves" || name == "time")
    {
        UserSettings.bonuses["moves"].enable = false;
        UserSettings.bonuses["time"].enable = false;
    }
    UserSettings.save();
};

UserSettings.getTotalStarsCount = function()
{
	var cnt = 0;
	for (var i=0, len = UserSettings.stars.length; i<len; i++) cnt += UserSettings.stars[i];
	cnt += UserSettings.purchasedStars;
	return cnt;
};

UserSettings.reset = function()
{	
    UserSettings.points = 0;
    //UserSettings.coins = 0;
    UserSettings.stars = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];
    UserSettings.scores = [];
    UserSettings.tutorials = [];
    //UserSettings.purchasedStars = 0;

    for (var k in UserSettings.bonuses)
    {
        var bonus = UserSettings.bonuses[k];
        bonus.available = false;
        bonus.enable = false;
    }

    UserSettings.save();
};

UserSettings.setBonusAvailable = function(bonus_name)
{
    if (!UserSettings.bonuses[bonus_name]) return;
    if (UserSettings.bonuses[bonus_name].available) return;
    if (bonus_name == "moves" || bonus_name == "time")
    {
        UserSettings.bonuses["moves"].available = true;
        UserSettings.bonuses["time"].available = true;
    }
    else UserSettings.bonuses[bonus_name].available = true;
    UserSettings.save();
};

//start parameters

UserSettings.points = 0;
UserSettings.coins = 1000;
UserSettings.stars = [];
UserSettings.tutorials = [];
UserSettings.purchasedStars = 0;

UserSettings.bonuses = {};
UserSettings.bonuses.moves = {name: "moves", value: 5, coast: 50, enable: false, passive: true, available: false};
UserSettings.bonuses.time = {name: "time", value: 15, coast: 50, enable: false, passive: true, available: false};
UserSettings.bonuses.color = {name: "color", value: 5, coast: 110, enable: false, passive: true, available: false};
UserSettings.bonuses.boom = {name: "boom", value: 5, coast: 75, enable: false, passive: true, available: false};

UserSettings.bonuses.knife = {name: "knife", coast: 75, enable: false, active: true, available: false};
UserSettings.bonuses.bomb = {name: "bomb", coast: 50, enable: false, active: true, available: false};
UserSettings.bonuses.fire = {name: "fire", coast: 110, enable: false, active: true, available: false};
UserSettings.bonuses.storm = {name: "storm", coast: 150, enable: false, active: true, available: false};
UserSettings.bonuses.dragon = {name: "dragon", coast: 200, enable: false, active: true, available: false};

UserSettings.bonuses.level_end_moves = {name: "level_end_moves", coast: 50, value: 5, enable: false};
UserSettings.bonuses.level_end_time = {name: "level_end_time", coast: 40, value: 15, enable: false};

UserSettings.buyStars = function(pack_number)
{	
	if (UserSettings.coins >= UserSettings.starPacks["n"+pack_number].coins)
	{
		UserSettings.coins -= UserSettings.starPacks["n"+pack_number].coins;
		UserSettings.purchasedStars += UserSettings.starPacks["n"+pack_number].stars;
		UserSettings.save();		
		return true;	
	}
	else return false;
};

UserSettings.starPacks = {};
UserSettings.starPacks.n1 = {stars: 1, coins: 75};
UserSettings.starPacks.n2 = {stars: 5, coins: 150};
UserSettings.starPacks.n3 = {stars: 15, coins: 450};
UserSettings.starPacks.n4 = {stars: 20, coins: 600};

UserSettings.elementPoints = {};
UserSettings.elementPoints.simple = 50;
UserSettings.elementPoints.bomb = 250;
UserSettings.elementPoints.wave = 250;
UserSettings.elementPoints.cross = 500;
UserSettings.elementPoints.wall = 750;
UserSettings.elementPoints.wall_double = 500;
UserSettings.elementPoints.wall_color = 500;
UserSettings.elementPoints.wall_generated = 500;
UserSettings.elementPoints.chip = 2500;
UserSettings.elementPoints.ice = 500;
UserSettings.elementPoints.chip_generator = 1000;
UserSettings.elementPoints.chain_bomb = 1250;

UserSettings.additionalPoints = {};
UserSettings.additionalPoints.chains_1 = 750;
UserSettings.additionalPoints.chains_2 = 1000;
UserSettings.additionalPoints.ice_1 = 50;
UserSettings.additionalPoints.ice_2 = 100;
UserSettings.additionalPoints.ice_3 = 250;

UserSettings.getPoints = function(type)
{
    if (UserSettings.elementPoints[type]) return UserSettings.elementPoints[type];
    else if (UserSettings.additionalPoints[type]) return UserSettings.additionalPoints[type];
    else return 0;
};