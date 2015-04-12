var SoundUtils = {};

SoundUtils.tracks =
[
    "active_bonus",//
    "active_passive_bonus",//
    "appearance_inserts_paper",
    "appearance_windows_information_bonuses",
    "appearance_windows_paper",//
    "bomb_destroyed",//
    "button_clicked",
    "chains_destroyed",
    "comet_bonus",
    "comet_bonus_2",
    "cross_destroyed",//
    "falling_level_goal_destroyed",//
    "flight_silver_star_the_level",
    "flight_silver_star_the_level_finish",
    "game_level_ambient_sound_1",//
    "game_level_ambient_sound_2",//
    "flight_stars_ball",
    "fly_silver_map",
    "fly_star_map",
    "frozen_destroyed",
    "fusion_chip_effect",
    "group_bonus",//
    "ice_emitter_destroyed",//
    "level_complete",//
    "level_failed",//
    "light_bonus",
    "main_theme",//
    "no_more_moves", //
    "no_possible_moves",//
    "opening_blocker",
    "opening_level",
    "purchase_bonuses",
    "show_limit",//
    "simple_chip_destroyed",//
    "stars_during_the_level",
    "star_destroyed",//
    "tile_destroy",
    "time_is_up", //
    "wall_destroyed",
    "wave_destroyed",//
    "wrong_click" //
];

SoundUtils.soundEnable = false;
SoundUtils.effectEnable = false;
SoundUtils.mixer = null;
SoundUtils.soundBtn = null;
SoundUtils.effectBtn = null;
SoundUtils.iosMode = false;
SoundUtils.android = false;
SoundUtils.currentTrack = '';
SoundUtils.channel_cnt = 10;

SoundUtils.playBack = function()
{
    if (!SoundUtils.mixer) return;
    if (!SoundUtils.soundEnable) return;
    var track;
    if (gameState == STATE_GAME) track = "game_level_ambient_sound_"+getRandomValue(1,2);
    else track = "main_theme";
    if (track == SoundUtils.currentTrack) return;
    var a = SoundUtils.mixer.play(track, true, false, 0);
    SoundUtils.currentTrack = track;
};

SoundUtils.setMixer = function()
{
    SoundUtils.iosMode = navigator.userAgent.toLowerCase().indexOf("mac") != -1;
    if (!SoundUtils.iosMode && Utils.touchScreen) SoundUtils.android = true;
    var channels = AudioMixer.isWebAudioSupport() ? SoundUtils.channel_cnt : 1;
    SoundUtils.mixer = new AudioMixer("sounds", channels);

    if (UserSettings.music == 1) SoundUtils.soundEnable = true;
    if (UserSettings.effects == 1) SoundUtils.effectEnable = true;
};

SoundUtils.setSoundBtn = function()
{
    SoundUtils.soundBtn.icon = setSprite(SoundUtils.soundBtn, SoundUtils.soundEnable ? "music_on" : "music_off", 0, 0);
};

SoundUtils.switchSoundBtn = function()
{
    if (!SoundUtils.soundBtn) return false;
    SoundUtils.soundEnable ? SoundUtils.offSoundBtn() : SoundUtils.onSoundBtn();
};
SoundUtils.onSoundBtn = function()
{
    if (!SoundUtils.soundBtn) return false;
    SoundUtils.soundBtn.gotoAndStop(0);
    SoundUtils.soundBtn.icon.bitmap = bitmaps["music_on"].bitmap;
    SoundUtils.soundEnable = true;
    SoundUtils.playBack();
    UserSettings.music = 1;
    UserSettings.save();
};
SoundUtils.offSoundBtn = function()
{
    if (!SoundUtils.soundBtn) return false;
    if (!SoundUtils.mixer) return false;
    SoundUtils.soundBtn.icon.bitmap = bitmaps["music_off"].bitmap;
    SoundUtils.soundEnable = false;
    SoundUtils.mixer.stop(0);
    SoundUtils.currentTrack = "";
    UserSettings.music = 0;
    UserSettings.save();
};

SoundUtils.setEffectBtn = function()
{
    SoundUtils.effectBtn.icon = setSprite(SoundUtils.effectBtn, SoundUtils.effectEnable ? "sound_on" : "sound_off", 0, 0);
    if (!AudioMixer.isWebAudioSupport()) SoundUtils.effectBtn.visible = false;
};

SoundUtils.switchEffectBtn = function()
{
    if (!SoundUtils.effectBtn) return false;
    SoundUtils.effectEnable ? SoundUtils.offEffectBtn() : SoundUtils.onEffectBtn();
};

SoundUtils.onEffectBtn = function()
{
    if (!SoundUtils.effectBtn) return false;
    SoundUtils.effectBtn.icon.bitmap = bitmaps["sound_on"].bitmap;
    SoundUtils.effectEnable = true;
    UserSettings.effects = 1;
    UserSettings.save();
};

SoundUtils.offEffectBtn = function()
{
    if (!SoundUtils.effectBtn) return false;
    SoundUtils.effectBtn.icon.bitmap = bitmaps["sound_off"].bitmap;
    SoundUtils.effectEnable = false;
    UserSettings.effects = 0;
    UserSettings.save();
};

SoundUtils.playEffect = function(track)
{
    if (!AudioMixer.isWebAudioSupport()) return false;
    if (!SoundUtils.mixer) return;
    if (!SoundUtils.effectEnable) return;
    SoundUtils.mixer.play(track, false, true);
};