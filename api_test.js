var APITest = {};

//функция для ресайза списка изображений до нужного нам размера. Применяется для оторажения аватаров друзей в нужном размере.
APITest.resizeImages = function(images, width, height)
{
    var cns, ctx, bitmap, w = width * Utils.globalScale, h = height * Utils.globalScale;
    for(var i in images)
    {
        bitmap = images[i];
        
        cns = document.createElement("canvas");
        cns.width = w;
        cns.height = h;
        ctx = cns.getContext("2d");
        ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, w, h);
        
        images[i] = cns;
    }
    
    return images;
};

//получение аватар по списку
APITest.getFriendsAvatars = function(list, callback)
{
    //получаем список аватар отображаемых друзей
    ExternalAPI.exec("getFriendsAvatars", list, function(avatars)
    {
        var assets = [];
        for(var i=0; i<avatars.length; i++) assets.push({"name": "avatar" + avatars[i].uid, "src": avatars[i].avatar});
        
        var preloader = new ImagesPreloader();
        //загружаем картинки
        preloader.load(assets, function(bitmaps)
        {
            //ресайзим до нужного размера
            bitmaps = APITest.resizeImages(bitmaps, 20, 20);
            
            if(callback) callback(bitmaps);
        });
    });
};

//список друзей на карте
APITest.getFriendsOnMap = function(callback)
{
    //получаем список друзей, которые тоже играют в эту игру
    ExternalAPI.exec("getFriendsList", function(list)
    {
        //получаем с сервера информацию о прогрессе этих друзей
        ExternalAPI.exec("store", "getFriendsOnMap", {users_list: list.join(",")}, function(friends)
        {
            var uids = [];
            for(var i=0; i<friends.length; i++) if(friends[i]) uids.push(friends[i].user_id);
            
            APITest.getFriendsAvatars(uids, function(bitmaps)
            {
                //создаем спрайты в нужных местах
                for(var i=0; i<friends.length; i++)
                {
                    if(friends[i])
                    {
                        var avatar = new Sprite(bitmaps["avatar" + friends[i].user_id], 20, 20);
                    }
                    
                    if(callback) callback();
                }
            });
        });
    });
};

//список друзей на уровне
APITest.getFriendsOnLevel = function(levelId, callback)
{
    //получаем список друзей, которые тоже играют в эту игру
    ExternalAPI.exec("getFriendsList", function(list)
    {
        //получаем с сервера информацию о прогрессе этих друзей
        ExternalAPI.exec("store", "getFriendsOnLevel", {users_list: list.join(","), level_id: levelId}, function(friends)
        {
            var uids = [];
            for(var i=0; i<friends.length; i++) uids.push(friends[i].user_id);
            
            APITest.getFriendsAvatars(uids, function(bitmaps)
            {
                //создаем спрайты в нужных местах
                for(var i=0; i<friends.length; i++)
                {
                    if(friends[i])
                    {
                        var avatar = new Sprite(bitmaps["avatar" + friends[i].user_id], 20, 20);
                    }
                    
                    if(callback) callback();
                }
            });
        });
    });
};

//список возможных гифтов
APITest.getGiftsList = function()
{
    //получаем список друзей, которые тоже играют в эту игру
    ExternalAPI.exec("getFriendsList", function(list)
    {
        var cnt = list.length;
        
        ExternalAPI.exec("store", "getGiftsList", null, function(gifts)
        {
            console.log(gifts);
            
            //у нас есть количество друзей, список гифтов и UserSettings.lastGift (0 - не получал, больше - номер последнего гифта)
            //дальше дело техники :)
        });
    });
};

//списание жизни
APITest.lostLife = function()
{
    ExternalAPI.exec("store", "lostLife", null, function(data)
    {
        console.log(data);
        
        //UserSettings.life = data.life;
        //UserSettings.lastRestoreLifeTime = data.lastRestoreLifeTime;
    });
};

//восстановление жизни. Вызывать раз в минуту
APITest.restoreLife = function()
{
    ExternalAPI.exec("store", "restoreLife", null, function(data)
    {
        console.log(data);
        
        //UserSettings.life = data.life;
        //UserSettings.lastRestoreLifeTime = data.lastRestoreLifeTime;
    });
};

//продление-установка времени неуязвимости
APITest.setInvulnerability = function(seconds)
{
    ExternalAPI.exec("store", "setInvulnerability", {seconds: seconds}, function(data)
    {
        console.log(data);
    });
};

//получение списка покупок
APITest.loadPurchases = function()
{
    ExternalAPI.exec("store", "loadPurchases", null, function(data)
    {
        console.log(data);
    });
};