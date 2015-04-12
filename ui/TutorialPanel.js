function TutorialPanel(closeCallback) {
    Utils.callSuperConstructor(TutorialPanel, this);

    this.x = center.x;
    this.y = center.y;

    this.closeCallback = closeCallback;

    this.set();
    this.setDragSprite();
    this.setBlocks();
    this.setMarkerSprite();
    this.setButtons();
}

Utils.extend(TutorialPanel, Panel);

TutorialPanel.prototype.set = function()
{
    this.panel = setSprite(this, "panel_11", 0, 0);

    this.main_spr = setSprite(this, null, 0, TutorialPanel.bottomBlocksPosition, {/*fillColor: "white",*/ width: 1, height: 1});
    this.main_spr.blocks = [];

    this.top = setSprite(this, "panel_12", 0, -134);
    this.bottom = setSprite(this, "panel_13", 0, 127);
    var title = setBitmapText(this.top, "font_greek_title_mip1", I18.getString("WIN_HELP_TITLE"), 0, 0, {align: 2});
};

TutorialPanel.dragBlocks = false;
TutorialPanel.dragMarker = false;

TutorialPanel.prototype.setDragSprite = function()
{
    this.drag_spr = setSprite(this, null, 0, 0, { width: center.x*2, height: center.y*2,
                                                    /*fillColor: "blue", opacity: 0.3*/});
    this.drag_spr.addEventListener("mousedown",Utils.proxy(function(e)
    {
        e.target.start_y = e.y;
        if (TutorialPanel.dragBlocks || TutorialPanel.dragMarker) this.unFreezeMovingSprites();
    }, this));
    this.drag_spr.addEventListener("mousemove",Utils.proxy(function(e)
    {
        if (TutorialPanel.dragBlocks)
        {
            var dy = e.y-e.target.start_y;
            e.target.start_y = e.y;
            if (this.main_spr.y+dy >= TutorialPanel.bottomBlocksPosition ||
                this.main_spr.y+dy <= TutorialPanel.topBlocksPosition) return false;
            this.main_spr.y+=dy;
            this.marker_spr.y -= dy/TutorialPanel.koef;
        }
        else if (TutorialPanel.dragMarker)
        {
            var dy = e.y-e.target.start_y;
            e.target.start_y = e.y;
            if (this.marker_spr.y+dy >= TutorialPanel.bottomMarkerPosition ||
                this.marker_spr.y+dy <= TutorialPanel.topMarkerPosition) return false;
            this.marker_spr.y += dy;
            this.main_spr.y -= dy*TutorialPanel.koef;
        }
        return false;
    }, this));
    this.drag_spr.addEventListener("mouseup",Utils.proxy(function(e)
    {
        if (TutorialPanel.dragBlocks) TutorialPanel.dragBlocks = false;
        if (TutorialPanel.dragMarker) TutorialPanel.dragMarker = false;
        this.freezeMovingSprites();
    }, this));
    this.drag_spr.addEventListener("mouseout",Utils.proxy(function(e)
    {
        if (TutorialPanel.dragBlocks) TutorialPanel.dragBlocks = false;
        if (TutorialPanel.dragMarker) TutorialPanel.dragMarker = false;
    }, this));

    this.addWheelListener();
};

TutorialPanel.prototype.addWheelListener = function()
{
    var d = document.getElementById("screen"), type;
    if ('onwheel' in document) type = "wheel";
    else if ('onmousewheel' in document) type = "mousewheel";
    else type = "MozMousePixelScroll";

    d.addEventListener(type, TutorialPanel.onWheelHandler, false);
};

TutorialPanel.onWheelHandler = function(e)
{
    e = e || window.event;
    var dy = e.deltaY || e.detail || e.wheelDelta;
    dy = -dy/10;
    //console.log(dy);
    if (TutorialPanel.area.main_spr.y+dy >= TutorialPanel.bottomBlocksPosition ||
        TutorialPanel.area.main_spr.y+dy <= TutorialPanel.topBlocksPosition) return false;
    TutorialPanel.area.main_spr.y+=dy;
    TutorialPanel.area.marker_spr.y -= dy/TutorialPanel.koef;
    stage.needToRebuildBack = true;
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
};

TutorialPanel.prototype.removeWheelListener = function()
{
    var d = document.getElementById("screen"), type;
    if ('onwheel' in document) type = "wheel";
    else if ('onmousewheel' in document) type = "mousewheel";
    else type = "MozMousePixelScroll";
    d.removeEventListener(type, TutorialPanel.onWheelHandler, false);
};

TutorialPanel.bottomBlocksPosition = -102;
TutorialPanel.topBlocksPosition = -932;
TutorialPanel.bottomMarkerPosition = 40;
TutorialPanel.topMarkerPosition = -100;
TutorialPanel.koef = (TutorialPanel.bottomBlocksPosition-TutorialPanel.topBlocksPosition)/
                    (TutorialPanel.bottomMarkerPosition-TutorialPanel.topMarkerPosition);

TutorialPanel.prototype.setMarkerSprite = function()
{
    this.marker_spr = setSprite(this, "tutorial_marker", 115, TutorialPanel.topMarkerPosition);
    this.marker_spr.onmousedown = function()
    {
        TutorialPanel.dragMarker = true;
    };
};

TutorialPanel.prototype.setButtons = function()
{
    this.close_btn = new Button(this, "btn_close", 120, -140, Utils.proxy(function()
    {
        this.removeWheelListener();
        this.close(Utils.proxy(this.closeCallback, this));
    }, this));
    this.ok_btn = new Button(this, "btn_check", 0, 128, Utils.proxy(function()
    {
        this.removeWheelListener();
        this.close(Utils.proxy(this.closeCallback, this));
    }, this));
};

TutorialPanel.prototype.playShowEffect = function()
{
    this.opacity = 0;
    this.fadeTo(1, pps/2, Easing.linear, Utils.proxy(function()
    {
        this.freezeBack();
        this.freezeMovingSprites();
    }, this));
};

TutorialPanel.prototype.freezeBack = function()
{
    this.panel.setStatic(true, true);
    this.drag_spr.setStatic(true, true);
};

TutorialPanel.prototype.unFreezeBack = function()
{
    this.panel.setStatic(false, true);
    this.drag_spr.setStatic(false, true);
};

TutorialPanel.prototype.freezeMovingSprites = function()
{
    this.main_spr.setStatic(true);
    this.marker_spr.setStatic(true);
    this.top.setStatic(true);
    this.bottom.setStatic(true);
};

TutorialPanel.prototype.unFreezeMovingSprites = function()
{
    this.main_spr.setStatic(false);
    this.marker_spr.setStatic(false);
    this.top.setStatic(false);
    this.bottom.setStatic(false);
};

TutorialPanel.prototype.close = function(callback)
{
    this.unFreezeBack();
    this.unFreezeMovingSprites();
    this.fadeTo(0, pps/2, Easing.linear, Utils.proxy(function()
    {
        this.destroyPanel();
        if (callback) callback();
    }, this));
};

TutorialPanel.prototype.setBlocks = function(n, y)
{
    var spr = setSprite(this, null, -3, 10, {width: 210, height: 240,
                                            /*fillColor: "red",  opacity: 0.3*/});
    spr.onmousedown = function()
    {
        TutorialPanel.dragBlocks = true;
    };

    for (var i=0; i<3; i++) this.setBigBlock(i+1);
    for (var k in UserSettings.bonuses)
    {
        if (k == "level_end_moves" ||
            k == "level_end_time") continue;
        this.setSmallBlockBlock(k);
    }
};

TutorialPanel.prototype.setBigBlock = function(n)
{
    var block = setSprite(this.main_spr, "tutorial_block_1", -2, this.getY());
    this.main_spr.blocks.push(block);
    var img = setSprite(block, "tutorial_"+n, 0, -18);
    var t;
    if (n == 1) t = "TUTORIAL_1_LESSON_1";
    else if (n == 2) t = "TUTORIAL_2_LESSON_1";
    else t = "TUTORIAL_3_LESSON_1";
    var text = setBitmapText(block, "font_greek_brown_mip2", I18.getString(t), 0, 50,
                            {align: 2, maxWidth: 200, valign: BitmapText.VALIGN_MIDDLE});
    return block;
};

TutorialPanel.prototype.setSmallBlockBlock = function(type)
{
    var block = setSprite(this.main_spr, "tutorial_block_2", -2, this.getY());
    this.main_spr.blocks.push(block);

    var s, t, t2;
    if (type == "moves" || type == "time" || type == "color" || type == "boom") s = "passive_bonus_"+type;
    else s = "bonus_"+type+"_unlocked";
    var img = setSprite(block, s, -72, 0);
    if (type == "moves")
    {
        t = "PASSIVE_BONUS_MOVES_TITLE";
        t2 = "PASSIVE_BONUS_MOVES_DESC";
    }
    else if (type == "time")
    {
        t = "PASSIVE_BONUS_TIME_TITLE";
        t2 = "PASSIVE_BONUS_TIME_DESC";
    }
    else if (type == "color")
    {
        t = "PASSIVE_BONUS_COLOR_TITLE";
        t2 = "PASSIVE_BONUS_COLOR_DESC";
    }
    else if (type == "boom")
    {
        t = "BOOM_BONUS_TITLE";
        t2 = "BOOM_BONUS_DESC";
    }
    else if (type == "fire")
    {
        t = "BONUS_GEFEST_TITLE";
        t2 = "BONUS_GEFEST_DESC";
    }
    else if (type == "storm")
    {
        t = "BONUS_AFRODITA_TITLE";
        t2 = "BONUS_AFRODITA_DESC";
    }
    else if (type == "dragon")
    {
        t = "BONUS_ZEUS_TITLE";
        t2 = "BONUS_ZEUS_DESC";
    }
    else if (type == "knife")
    {
        t = "BONUS_ARTEMIDA_TITLE";
        t2 = "BONUS_ARTEMIDA_DESC";
    }
    else if (type == "bomb")
    {
        t = "BONUS_ARES_TITLE";
        t2 = "BONUS_ARES_DESC";
    }
    var title = setBitmapText(block, "font_greek_brown_mip2", I18.getString(t), 24, -10,
        {align: 2, maxWidth: 150, valign: BitmapText.VALIGN_MIDDLE});
    var desc = setBitmapText(block, "font_greek_brown_mip2", I18.getString(t2), 24, 18,
        {align: 2, maxWidth: 150, valign: BitmapText.VALIGN_MIDDLE});
    return block;
};

TutorialPanel.prototype.getY = function()
{
    var y = 0, dy = 2;
    for (var i= 0, len = this.main_spr.blocks.length; i<len; i++)
    {
        if (i<3) y += 136+dy;
        else y += 64+dy;
    }
    if (i<3) y += 68+dy;
    else y += 32+dy;
    return y;
};

TutorialPanel.topBorderY = -96;
TutorialPanel.bottomBorderY = 74;
TutorialPanel.area = null;
