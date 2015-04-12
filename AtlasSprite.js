function AtlasSprite(name)
{
    Utils.callSuperConstructor(AtlasSprite, this, AtlasSprite.getAtlasBitmap(name), 1, 1);
    this.name = name;

    AtlasSprite.setAtlasSpriteProps(this);
}

Utils.extend(AtlasSprite, Sprite);

AtlasSprite.getAtlasSpriteInfo = function(name)
{
    if (atlas_sprites[name]) return atlas_sprites[name];
    return false;
};

AtlasSprite.set = function(parent, name, x, y, props)
{
    var spr = new AtlasSprite(name);
    spr.x  = x;
    spr.y  = y;
    if (typeof props !== "undefined")
    {
        for (k in props) spr[k] = props[k];
    }
    parent.addChild(spr);
    return spr;
};

AtlasSprite.setAtlasSpriteProps = function(atl_spr, name)
{
    if (typeof name == "undefined") name = atl_spr.name;
    var atlas_spr_info = AtlasSprite.getAtlasSpriteInfo(name);
    atl_spr.width = atlas_spr_info ? atlas_spr_info.size[0]/2*0.64453125 : 10;
    atl_spr.height = atlas_spr_info ? atlas_spr_info.size[1]/2*0.64453125 : 10;
    atl_spr.offset.left = atlas_spr_info ? atlas_spr_info.rect[0]/2*0.64453125 : 10;
    atl_spr.offset.top = atlas_spr_info ? atlas_spr_info.rect[1]/2*0.64453125 : 10;
};

AtlasSprite.getAtlasBitmap = function(name)
{
    var atlas_spr_info, atlas_name, bitmap;
    atlas_spr_info = AtlasSprite.getAtlasSpriteInfo(name);
    atlas_name = atlas_spr_info ? atlas_spr_info.atlas : "";
    bitmap = bitmaps[atlas_name] ? bitmaps[atlas_name].bitmap : null;
    return bitmap;
};

AtlasSprite.metrics = {scale: 0.3};
AtlasSprite.configCache = {};
AtlasSprite.bitmapsCache = {};
AtlasSprite.readyConfigCache = {};

Sprite.prototype.setAtlasBitmap = function(name)
{
    this.bitmap = AtlasSprite.getAtlasBitmap(name);
    AtlasSprite.setAtlasSpriteProps(this, name);
};