function ChipElement(props)
{
    if (props.type.indexOf("Falling") >= 0) this.fall_type = 1;
    else if (props.type.indexOf("ChipUp") >= 0) this.fall_type = 2;
    this.element_type = "chip";
    Utils.callSuperConstructor(ChipElement, this, props);
}

Utils.extend(ChipElement, Element);

ChipElement.prototype.setSkin = function()
{
    var bitmap_name;
    if (this.fall_type == 1) bitmap_name = "s_chip_down";
    else if (this.fall_type == 2) bitmap_name = "s_chip_up";
    this.setAtlasBitmap(bitmap_name);
};

ChipElement.prototype.doAction1 = function(game_field)
{
    if (this.fall_type == 1) return;
    if (this.j == 0) return;
    if (!game_field.elements[this.j-1][this.i]) return;
    if (game_field.elements[this.j-1][this.i].element_type != "simple") return;
    if (this.findDestroyedElementUnder(game_field) < 0)
    {
        this.in_action_1 = true;
        this.changeWithTopNeighbor(game_field);
    }
    //меняемся местами с верхиним элементом
};

ChipElement.prototype.findDestroyedElementUnder = function(game_field)
{
    var empty_j = -1;
    for (var j=this.j; j<game_field.rows; j++)
    {
        if (j == this.j) continue;
        if (!game_field.cells[j][this.i]) continue;
        if (!game_field.elements[j][this.i]) return j;
    }
    return empty_j;
};

ChipElement.prototype.changeWithTopNeighbor = function(game_field)
{
    var i = this.i*1;
    var j = this.j*1;

    var temp = game_field.elements[j][i];
    game_field.elements[j][i] = game_field.elements[j-1][i];
    game_field.elements[j-1][i] = temp;

    game_field.elements[j][i].j = j;
    game_field.elements[j-1][i].j = j-1;

    game_field.elements[j][i].changeElement();
    game_field.elements[j-1][i].changeElement();
};

ChipElement.prototype.moveElementDown = function(game_field)
{
    this.in_moving_down = true;
    var dT = pps/5000;
    var duration = ((this.j-4)*this.dY - this.y)/dT;
    this.moveTo(this.x, (this.j-4)*this.dY, duration, Easing.linear.easeIn, Utils.proxy(function()
    {
        if (this.j == game_field.last_j)
        {
            game_field.addPoints(this, this.getMainPoints(), 1);
            this.playDestroyEffect(game_field);
        }
        else
        {
            this.in_moving_down = false;
            game_field.checkMoveElementsDownEnd();
        }
    }, this));
    return duration;
};

ChipElement.prototype.playDestroyEffect = function(game_field)
{
    SoundUtils.playEffect("falling_level_goal_destroyed");

    var x = this.getAbsolutePosition().x;
    var y = this.getAbsolutePosition().y;

    var spr = AtlasSprite.set(stage, "s_png_swirl_particles_psd", x, y, {opacity: 0});
    spr.fadeTo(1, pps/4, Easing.linear);

    this.levelTargetDone();

    var star_seq =
    [
        {
            tweens: [
                {prop: "rotation", to: Math.PI*3},
            ],
            duration: pps/3
        },
        {
            tweens: [
                {prop: "scaleX", to: 0},
                {prop: "scaleY", to: 0},
                {prop: "rotation", to: Math.PI*6},
            ],
            duration: pps/3,
            onfinish: Utils.proxy(function()
            {
                //debugger
                this.doSetNullCallback(this);
                this.destroyElement();
                game_field.moveElementsDown();
                game_field.checkMoveElementsDownEnd();
            }, this)
        },
    ];
    Animation.play(spr, star_seq);
    this.fadeTo(0, pps/2,Easing.linear);
};