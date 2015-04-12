var Effects = {};

Effects.Particles = {};
Effects.Animations = {};

Effects.Animations.circles = function(main_spr)
{
    var c1 = setSprite(main_spr, "main_menu_circle1", 0, 0, {opacity: 0});
    var c2 = setSprite(main_spr, "main_menu_circle2", 0, 0, {opacity: 0});
    var c3 = setSprite(main_spr, "main_menu_circle3", 0, 0, {opacity: 0});
    var c4 = setSprite(main_spr, "main_menu_circle4", 0, 0, {opacity: 0});
    var c5 = setSprite(main_spr, "main_menu_circle5", 0, 0, {opacity: 0});

    var _playCircle = function(spr, direction)
    {
        var star_seq =
            [
                {
                    tweens: [
                        {prop: "rotation", from: 0, to: Math.PI*3*direction},
                        {prop: "opacity", from: 0, to: 0.4},
                        {prop: "scaleX", from: 0.7, to: 0.9},
                        {prop: "scaleY", from: 0.7, to: 0.9},

                    ],
                    duration: pps*3
                },
                {
                    tweens: [
                        {prop: "rotation", to: Math.PI*6*direction},
                        {prop: "opacity", from: 0.4, to: 0},
                        {prop: "scaleX", from: 0.9, to: 1.1},
                        {prop: "scaleY", from: 0.9, to: 1.1},
                    ],
                    duration: pps*3,
                    onfinish: function()
                    {
                        _playCircle(spr, direction);
                    }
                }
            ];
        Animation.play(spr, star_seq);
    };

    _playCircle(c1, -1);
    _playCircle(c2, 1);
    _playCircle(c3, -1);
    _playCircle(c4, 1);
    _playCircle(c5, -1);
};

Effects.playAnimation = function(main_spr, name)
{
    Effects.Animations[name](main_spr);
};

Effects.Particles.light_stars = function(main_spr)
{
       var config = {
        "posVar": {
            "x": 35,
            "y": 13
        },
        "life": 2,
        "lifeVar": 0,
        "totalParticles": 40,
        "emissionRate": 10,
        "startColor": [
            30.6,
            63.75,
            193.8,
            1
        ],
        "startColorVar": [
            0,
            0,
            0,
            0
        ],
        "endColor": [
            0,
            0,
            0,
            0
        ],
        "endColorVar": [
            0,
            0,
            0,
            0
        ],
        "radius": 16,
        "radiusVar": 0,
        "startScale": 1,
        "endScale": 1,
        "texture": null,
        "textureEnabled": true,
        "textureAdditive": true,
        "speed": 0,
        "speedVar": 0,
        "angle": 0,
        "angleVar": 0,
        "gravity": {
            "x": 0,
            "y": 0
        },
        "radialAccel": 0,
        "radialAccelVar": 0,
        "tangentialAccel": 0,
        "tangentialAccelVar": 0,
        "startRotation": 0,
        "startRotationVar": 0,
        "rotationSpeed": 0,
        "rotationSpeedVar": 0,
        "rotationCoef": 0,
        "rotationCoefVar": 0
    };

    var particle = new Sprite(bitmaps["light_star"].bitmap, 16, 16, 1, 1);
    var emitter = new ParticleSystem.Emitter(config, {x: 0, y: 0}, particle);
    emitter.setEmitter(main_spr);
};

Effects.Particles.star_fire = function(main_spr)
{
    var config = {
        "posVar": {"x": 14,"y": 0},
        "life": 1,
        "lifeVar": 0,
        "totalParticles": 20,
        "emissionRate": 10,
        "startColor": [30.6, 63.75, 193.8, 1],
        "startColorVar": [0,0,0,0],
        "endColor": [0, 0, 0, 0],
        "endColorVar": [0,0,0,0],
        "radius": 16,
        "radiusVar": 0,
        "startScale": 0.5,
        "endScale": 0.2,
        "texture": null,
        "textureEnabled": true,
        "textureAdditive": true,
        "speed": 0,
        "speedVar": 0,
        "angle": 0,
        "angleVar": 0,
        "gravity": {"x": 0,"y": -40},
        "radialAccel": 0,
        "radialAccelVar": 0,
        "tangentialAccel": 0,
        "tangentialAccelVar": 0,
        "startRotation": 0,
        "startRotationVar": 0,
        "rotationSpeed": 0,
        "rotationSpeedVar": 0,
        "rotationCoef": 0,
        "rotationCoefVar": 0
    };

    var particle = new Sprite(bitmaps["particle_7"].bitmap, 16, 16, 1, 1);
    setGraphics(particle, "circle", 0, 0, {radius: 4, fillColor: "#fff", lineWidth: 0});
    var emitter = new ParticleSystem.Emitter(config, {x: 0, y: -3}, particle);
    emitter.setEmitter(main_spr);
};

Effects.Particles.staff = function(main_spr)
{
    var config = {
        "posVar": {"x": 40,"y": 40},
        "life": 1,
        "lifeVar": 0,
        "totalParticles": 100,
        "emissionRate": 60,
        "startColor": [30.6, 63.75, 193.8, 1],
        "startColorVar": [0,0,0,0.5],
        "endColor": [0, 0, 0, 0],
        "endColorVar": [0,0,0,0],
        "radius": 70,
        "radiusVar": 0,
        "startScale": 0.9,
        "endScale": 0.2,
        "texture": null,
        "textureEnabled": true,
        "textureAdditive": true,
        "speed": 50,
        "speedVar": 10,
        "angle": 3.14,
        "angleVar": 6.28,
        "gravity": {"x": 0,"y": 0},
        "radialAccel": 3,
        "radialAccelVar": 0,
        "tangentialAccel": 0,
        "tangentialAccelVar": 0,
        "startRotation": 0,
        "startRotationVar": 0,
        "rotationSpeed": 0,
        "rotationSpeedVar": 0,
        "rotationCoef": 0,
        "rotationCoefVar": 0
    };

    var p2 = new Sprite(bitmaps["particle_2"].bitmap, 7, 7, 1, 1);
    var emitter = new ParticleSystem.Emitter(config, {x: 0, y: 0}, p2);
    emitter.setEmitter(main_spr);
    return emitter;
};

Effects.Particles.wind = function(main_spr)
{
    var config = {
        "posVar": {"x": 0,"y": 100},
        "life": 10,
        "lifeVar": 2,
        "totalParticles": 20,
        "emissionRate": 0.8,
        "startColor": [30.6, 63.75, 193.8, 1],
        "startColorVar": [0,0,0,0],
        "endColor": [0, 0, 0, 1],
        "endColorVar": [0,0,0,0],
        "radius": 0,
        "radiusVar": 0,
        "startScale": 1,
        "endScale": 0.9,
        "texture": null,
        "textureEnabled": true,
        "textureAdditive": true,
        "speed": 0,
        "speedVar": 0,
        "angle": 0,
        "angleVar": 0,
        "gravity": {"x": 48, "y": 32},
        "radialAccel": 0,
        "radialAccelVar": 50,
        "tangentialAccel": 0,
        "tangentialAccelVar": 50,
        "startRotation": 0,
        "startRotationVar": 1,
        "rotationSpeed": 0.14,
        "rotationSpeedVar": 0.04,
        "rotationCoef": 0,
        "rotationCoefVar": 0
    };

    var p1 = new Sprite(bitmaps["particle_3"].bitmap, 27, 26);
    var p2 = new Sprite(bitmaps["particle_4"].bitmap, 19, 17);
    var p3 = new Sprite(bitmaps["particle_5"].bitmap, 20, 31);
    var p4 = new Sprite(bitmaps["particle_6"].bitmap, 24, 20);
    var emitter = new ParticleSystem.Emitter(config, {x: -260, y: -180}, [p1, p2, p3, p4]);
    emitter.setEmitter(main_spr);
};

ParticleSystem.Emitter.prototype.setEmitter = function(parent_spr)
{
    parent_spr.emitter = this;
    this.parent_spr = parent_spr;
    this.stageListener = Utils.proxy(function(e)
    {
        if (this.parent_spr.destroy) stage.removeEventListener("pretick", this.stageListener);
        this.update(e.delta);
        ParticleSystem.Renderer.render(parent_spr, this.particles);
    }, this);
    stage.addEventListener("pretick", this.stageListener);
};

ParticleSystem.Emitter.prototype.stopParticle = function()
{
    this.stop();
    stage.removeEventListener("pretick", this.stageListener);
};

ParticleSystem.Emitter.prototype.playParticle = function()
{
    this.play();
    stage.addEventListener("pretick", this.stageListener);
};

Effects.playParticle = function(main_spr, name)
{
    Effects.Particles[name](main_spr);
};
