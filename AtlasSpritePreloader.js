function AtlasSpritePreloader()
{
    this.data = null;

    this.minProgressVal = 0;
    this.maxProgressVal = 100;
    
    this.endCallback = null;
    this.processCallback = null;
    
    this.wait = Utils.proxy(this.wait, this);
};

AtlasSpritePreloader.prototype.load = function(data, endCallback, processCallback)
{
    this.data = data;
    this.endCallback = endCallback || this.onEnd;
    this.processCallback = processCallback;

    AtlasSpritePreloader.loadedItems = {};
    var path = Utils.imagesRoot+"/"+Utils.globalScale+"/";

    for (var i=0; i<this.data.length-1; i++)
    {
        var item = this.data[i];
        var img = new Image();
        img.src = path+this.data[i].src;
        AtlasSpritePreloader.loadedItems[item.name] = img;
    }

    this.wait();

    /*
    for(var i = 0; i < this.data.length; i++)
    {
        var item = this.data[i];
        var sprite = new AtlasSprite(item.name);
        AtlasSpritePreloader.loadedItems[item.name] = sprite;
    }
    this.wait();
    */
};

AtlasSpritePreloader.prototype.onEnd = function()
{
    console.log("loaded ended");
};

AtlasSpritePreloader.prototype.wait = function()
{
    var itemsLoaded = 0;
    var itemsTotal = 0;
    for(var key in AtlasSpritePreloader.loadedItems)
    {
        if(AtlasSpritePreloader.loadedItems[key].complete) itemsLoaded++;
        itemsTotal++;
    }

    if(itemsLoaded >= itemsTotal)
    {
        if(this.processCallback) this.processCallback(this.minProgressVal + this.maxProgressVal);
        if(this.endCallback) this.endCallback(AtlasSpritePreloader.loadedItems);
        return;
    }
    else
    {
        if(this.processCallback) this.processCallback(Math.floor(itemsLoaded / itemsTotal * this.maxProgressVal + this.minProgressVal));
        setTimeout(this.wait, 50);
    }
};

AtlasSpritePreloader.getItem = function(name)
{
    if (AtlasSpritePreloader.loadedItems[name]) return AtlasSpritePreloader.items[name];
};

AtlasSpritePreloader.loadScene = function(scene_name, endCallback, processCallback)
{
    AtlasSpritePreloader.sprites_params = {};
    var preloader = new AtlasSpritePreloader(scene_name);
    Utils.get("ui/scenes/"+scene_name+".xml", null, "xml", function(e)
    {
        var all_children = e.getElementsByTagName('*');
        var sprites = [];
        for (var i=0; i<all_children.length; i++)
        {
            if (all_children[i].attributes['type'] &&
                all_children[i].attributes['type'].value === "Sprite")
            {
                sprites.push(all_children[i]);
                var name = all_children[i].attributes['tablename'].value;
                var params = all_children[i].getElementsByTagName("Parameters")[0].attributes;
                var obj = {};
                for (var j=0; j<params.length; j++)
                {
                    obj[params[j].name] = params[j].value;
                }
                AtlasSpritePreloader.sprites_params[name] = obj;
            }
        }

        var load_atlases = {}, atlas_data_arr = [];
        for (var i=0; i<sprites.length; i++)
        {
            var atlas_sprite_name = sprites[i].attributes["tablename"].value;
            if (atlas_sprites[atlas_sprite_name] && !load_atlases[atlas_sprites[atlas_sprite_name].atlas])
            {
                var atlas_name = atlas_sprites[atlas_sprite_name].atlas;
                load_atlases[atlas_name] = true;
                atlas_data_arr.push(atlas_assets.getElementByValueInProperty("name", atlas_name));
            }
        }

        //preloader.load(atlas_data_arr, endCallback, processCallback);
        if (endCallback) endCallback();
    },function()
    {
        console.log("Scene download error");
    });
};
