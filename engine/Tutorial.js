function Tutorial(type, callback)
{
    Utils.callSuperConstructor(Tutorial, this, null, 152, 101);
    this.type = type;
    this.hideCallback = callback;

    this.bitmap = bitmaps["tutorial_block_3"].bitmap;
    stage.addChild(this);

    this.set();
}

Utils.extend(Tutorial, Sprite);

Tutorial.prototype.set = function(button)
{
    if (this.type == "1_1") this.setPosition(188, 230);
    else if (this.type == "1_2") this.setPosition(235, 132);
    else if (this.type == "2_1") this.setPosition(289, 71);
    else if (this.type == "2_2") this.setPosition(150, 230);
    else if (this.type == "2_3") this.setPosition(160, 220);
    else if (this.type == "3_1") this.setPosition(170, 220);
    else if (this.type == "4_1") this.setPosition(170, 220);
    else if (this.type == "5_1") this.setPosition(225, 200);
    else if (this.type == "5_2") this.setPosition(185, 120);
    else if (this.type == "10_1") this.setPosition(227, 147);
    else if (this.type == "15_1") this.setPosition(167, 124);
    else if (this.type == "21_1") this.setPosition(167, 234);
    else if (this.type == "30_1") this.setPosition(167, 234);
    else if (this.type == "54_1") this.setPosition(290, 110);

    this.setText();
    this.setButton();
    this.setArrow();
    this.showTutorialEffect();
};

Tutorial.prototype.setText = function()
{
    var t;
    if (this.type == "1_1") t = "TUTORIAL_1_LESSON_1";
    else if (this.type == "1_2") t = "TUTORIAL_1_LESSON_2";
    else if (this.type == "2_1") t = "TUTORIAL_2_LESSON_1";
    else if (this.type == "2_2") t = "TUTORIAL_2_LESSON_2";
    else if (this.type == "2_3") t = "TUTORIAL_2_LESSON_3";
    else if (this.type == "3_1") t = "TUTORIAL_3_LESSON_1";
    else if (this.type == "4_1") t = "TUTORIAL_4_LESSON_1";
    else if (this.type == "5_1") t = "TUTORIAL_5_LESSON_1";
    else if (this.type == "5_2") t = "TUTORIAL_5_LESSON_2";
    else if (this.type == "10_1") t = "TUTORIAL_10_LESSON_1";
    else if (this.type == "15_1") t = "TUTORIAL_13_LESSON_1";
    else if (this.type == "21_1") t = "TUTORIAL_21_LESSON_1";
    else if (this.type == "30_1") t = "TUTORIAL_30_LESSON_1";
    else if (this.type == "54_1") t = "TUTORIAL_50_LESSON_1";

    this.text = setBitmapText(this, "font_greek_brown_mip2", I18.getString(t), 0, 0,
        {align: 2, maxWidth: 140, valign: BitmapText.VALIGN_MIDDLE});
};

Tutorial.prototype.setButton = function()
{
    var d, btn;
    if (this.type == "1_1") d = setSprite(this, null, 100, -77, {w: 85, h: 30});
    else if (this.type == "1_2") btn = new Button(this, "btn_check", 0, 48, Utils.proxy(this.hideTutorial, this));
    else if (this.type == "2_1") d = setSprite(this, null, 0, 110, {w: 25, h: 25});
    else if (this.type == "2_2") d = setSprite(this, null, 137, -78, {w: 85, h: 25});
    else if (this.type == "2_3") d = setSprite(this, null, 127, -68, {w: 25, h: 25});
    else if (this.type == "3_1") d = setSprite(this, null, 117, -67, {w: 25, h: 85});
    else if (this.type == "4_1") d = setSprite(this, null, 117, -67, {w: 25, h: 85});
    else if (this.type == "5_1") d = setSprite(this, null, 119, -46, {w: 25, h: 85});
    else if (this.type == "5_2") btn = new Button(this, "btn_check", 0, 48, Utils.proxy(this.hideTutorial, this));
    else if (this.type == "10_1") d = setSprite(this, null, 117, -67, {w: 25, h: 50});
    else if (this.type == "15_1") btn = new Button(this, "btn_check", 0, 48, Utils.proxy(this.hideTutorial, this));
    else if (this.type == "21_1") btn = new Button(this, "btn_check", 0, 48, Utils.proxy(this.hideTutorial, this));
    else if (this.type == "30_1") btn = new Button(this, "btn_check", 0, 48, Utils.proxy(this.hideTutorial, this));
    else if (this.type == "54_1") btn = new Button(this, "btn_check", 0, 48, Utils.proxy(this.hideTutorial, this));

    //if (d) d.fillColor = "white";
    //if (d) d.dragdrag();
    if (d) d.addEventListener("mousedown", Utils.proxy(this.hideTutorial, this));
};

Tutorial.prototype.setArrow = function()
{
    var x, y, r;
    if (this.type == "1_1")
    {
        x = 40;
        y = -60;
        r = -2;
    }
    else if (this.type == "1_2")
    {
        x = -95;
        y = 7;
        r = Math.PI/2;
    }
    else if (this.type == "2_1")
    {
        x = 0;
        y = 65;
        r = 0;
    }
    else if (this.type == "2_2")
    {
        x = 85;
        y = -48;
        r = -2.2;
    }
    else if (this.type == "2_3")
    {
        x = 85;
        y = -48;
        r = -2.2;
    }
    else if (this.type == "3_1")
    {
        x = 85;
        y = -48;
        r = -2.2;
    }
    else if (this.type == "4_1")
    {
        x = 85;
        y = -48;
        r = -2.2;
    }
    else if (this.type == "5_1")
    {
        x = 85;
        y = -48;
        r = -2.2;
    }
    else if (this.type == "5_2")
    {
        x = -84;
        y = -58;
        r = 2.2;
    }
    else if (this.type == "10_1")
    {
        x = 85;
        y = -58;
        r = -2.2;
    }
    else if (this.type == "15_1")
    {
        x = 85;
        y = -58;
        r = -2.2;
    }
    else if (this.type == "21_1")
    {
        x = 85;
        y = -58;
        r = -2.2;
    }
    else if (this.type == "30_1")
    {
        x = 85;
        y = -58;
        r = -2.2;
    }
    else if (this.type == "54_1")
    {
        x = 0;
        y = 85;
        r = 0;
    }
    this.arrow = setSprite(this, null, x, y, {/*fillColor: "green",*/ width: 20,
        height: 20});
    this.arrow.rotation = r;
    //this.arrow.dragdrag();
    var arrow = setSprite(this.arrow, "tutorial_arrow_1", 0, 0);
    this.moveArrow(arrow);
};

Tutorial.prototype.moveArrow = function(arrow)
{
    arrow.moveTo(arrow.x, arrow.y+10, pps/2, Easing.linear, Utils.proxy(function()
    {
        arrow.moveTo(arrow.x, arrow.y-10, pps/2, Easing.linear, Utils.proxy(function()
        {
            this.moveArrow(arrow);
            return false;
        }, this));
        return false;
    }, this));
};

Tutorial.prototype.showTutorialEffect = function()
{
    this.opacity = 0;
    this.fadeTo(1, pps/2);
};

Tutorial.prototype.hideTutorial = function()
{
    this.fadeTo(0, pps/2, Easing.linear, Utils.proxy(function()
    {
        this.destroy = true;
        return false;
    }, this));
    this.hideCallback();
};