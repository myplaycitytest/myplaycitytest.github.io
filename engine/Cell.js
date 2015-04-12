function Cell(props)
{
    this.i = props.i;
    this.j = props.j;
    this.type = props.type;

    //0 - empty
    //1 - stone
    //2 - wood
    //3 - train

    var colors = {0: null, 1: "#AA947D", 2: "#A95C26", 3: "#B5DA11"};
    Utils.callSuperConstructor(Cell, this, null, 30, 30);

    this.opacity = 0;

    this.dX = props.dX;
    this.dY = props.dY;

    this.x = (this.i-4)*props.dX;
    this.y = (this.j-4)*props.dY;
    this.setSkin();
}

Utils.extend(Cell, Sprite);

Cell.prototype.setSkin = function()
{
    if (this.type == 1) this.bitmap_name = "original_cell";
    else if (this.type == 2) this.bitmap_name = "wooden_cell";
    else if (this.type == 3)
    {
        Level.green_cell_present = true;
        this.bitmap_name = "green_cell";
    }
    if (!this.bitmap_name) return;
    this.bitmap = bitmaps[this.bitmap_name].bitmap;
};

Cell.prototype.playStartAnimation = function(end_callback)
{
    this.in_action = true;
    var star_seq =
    [
        {
            tweens: [
                {prop: "x", from: this.x-this.dX, to: this.x, ease: Easing.quadratic.easeIn},
                {prop: "y", from: this.y-this.dY, to: this.y, ease: Easing.quadratic.easeOut},
                {prop: "rotation", from: 1.54, to: 0},
                {prop: "opacity", to: 1},
            ],
            duration: pps,
            onfinish: Utils.proxy(function()
            {
                this.in_action = false;
                end_callback();
            }, this)
        }
    ];
    Animation.play(this, star_seq);
};

Cell.prototype.applyImpact = function()
{
    if (this.type == 1) return;

    var returned_points = 0;
    returned_points = this.getMainPoints();
    this.type--;
    this.playChangeStateEffect();

    return returned_points;
};

Cell.prototype.playChangeStateEffect = function()
{
    if (this.type == 1) this.levelTargetDone();

    var ef = setTilesSprite(this, "tile_glowing_small", 0, -1, {_frames: 20});
    ef.scaleTo(0.75);
    ef.animDelay = 1.2;
    ef.onchangeframe = function()
    {
        if (this.currentFrameX == 19) this.destroy = true;
    };
    this.setSkin();
    stage.needToRebuildBack = true;
};

Cell.prototype.levelTargetDone = function()
{
    LEVEL.targetDone("cell");
};

Cell.prototype.doWhirlpoolEffect = function(super_wave, game_field)
{
    var temp_spr = null, returned_points = 0;
    var ef = setTilesSprite(this, "tile_glowing_small", 0, -1, {_frames: 20});
    ef.scaleTo(0.75);
    ef.animDelay = 1.2;
    ef.onchangeframe = function()
    {
        if (this.currentFrameX == 19) this.destroy = true;
    };

    returned_points = this.getMainPoints();

    if (this.type == 2) temp_spr = setSprite(game_field.main_spr, "wooden_cell", this.x, this.y);
    else if (this.type == 3) temp_spr = setSprite(game_field.main_spr, "green_cell", this.x, this.y);
    this.type--;
    this.setSkin(temp_spr, super_wave);
    if (this.type == 1) this.levelTargetDone();
    this.playWhirlpoolEffect(temp_spr, super_wave, game_field);

    return returned_points;
};

Cell.prototype.getMainPoints = function()
{
    if (this.type == 2) return 500;
    if (this.type == 3) return 500;
};

Cell.prototype.playWhirlpoolEffect = function(temp_spr, super_wave, game_field)
{
    var star_seq =
    [
        {
            tweens: [
                {prop: "x", to: super_wave.x},
                {prop: "y", to: super_wave.y},
            ],
            duration: pps,
            onfinish: function()
            {
                temp_spr.destroy = true;
                game_field.checkWhirlpoolEffectEnd(super_wave);
            },
        }
    ];
    Animation.play(temp_spr, star_seq);
};

