function AtlasButton(x, y, callback, skin)
{
    this.skin = skin;
    this.state = 0; // normal , 1 - over, 2 - down,

    var atlas_bitmap = AtlasSprite.getAtlasBitmap(this.skin.main);
    var bitmap = atlas_bitmap ? atlas_bitmap : bitmaps[atlas_name].bitmap;
    if (typeof bitmap === "undefined") return false;

    Utils.callSuperConstructor(AtlasButton, this, bitmap);

    //основа для кнопки - подложка

    this.name = this.skin.main;

    this.width = atlas_spr_info.size[0]/2;
    this.height = atlas_spr_info.size[1]/2;
    this.offset.left = atlas_spr_info.rect[0]/2;
    this.offset.top = atlas_spr_info.rect[1]/2;

    this.x = x;
    this.y = y;

    this.pixelCheck = true;

    this.setSkin();

    this.callback = callback;

    this.addEventListener("mouseover", Utils.proxy(this.mouseover, this));
    this.addEventListener("mouseout", Utils.proxy(this.mouseout, this));
    this.addEventListener("mousedown", Utils.proxy(this.mousedown, this));
    this.addEventListener("mouseup", Utils.proxy(this.mouseup, this));
}

Utils.extend(AtlasButton, Sprite);

AtlasButton.prototype.setSkin = function()
{
    this.normal = AtlasSprite.set(this, this.skin.normal, 0, 0);
    this.over = AtlasSprite.set(this, this.skin.over, 0, 0);
    this.down = AtlasSprite.set(this, this.skin.down, 0, 0);
    this.icon = AtlasSprite.set(this, this.skin.icon, 4, 0);
};

AtlasButton.prototype.mousedown = function()
{
    this.state = 2;
    this.switchSkin();
};

AtlasButton.prototype.mouseover = function()
{
    this.state = 1;
    this.switchSkin();
};

AtlasButton.prototype.mouseout = function()
{
    this.state = 0;
    this.switchSkin();
};

AtlasButton.prototype.mouseup = function()
{
    this.state = 1;
    this.switchSkin();
    this.callback();
};

AtlasButton.prototype.switchSkin = function()
{
    this.normal.visible = this.state == 0 ? true : false;
    this.over.visible = this.state == 1 ? true : false;
    this.down.visible = this.state == 2 ? true : false;
};