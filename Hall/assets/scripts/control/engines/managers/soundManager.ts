/**
 * 声音管理
 */

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import GameEngine, { services } from "../GameEngine";
import { I18nLanguageEnum } from "../services/i18nContent/i18nInterface";
import superManager from "./superManager";

const { ccclass, property } = cc._decorator;

//声音管理本地数据
export interface SoundLocal {
  sound: boolean;
  vibrate: boolean;
}

export const SOUND_LOCAL_KEY: string = "sound-manager-key-1";

@ccclass("soundManager")
export default class soundManager extends superManager {
  protected className: string = "声音管理";

  constructor() {
    super();
  }

  async loadManager(): Promise<boolean> {
    await super.loadManager();
    //
    this.onReadSetting();
    //
    return Promise.resolve(true);
  }

  //
  private soundResPath = "preload/sound/";

  //声音开关
  private m_soundEnabled: boolean = true;
  //振动开头
  private m_vibrateEnabled: boolean = true;

  //获取声音的开关
  isSoundEnabled() {
    return this.m_soundEnabled;
  }

  isVibrateEnabled() {
    return this.m_vibrateEnabled;
  }

  setVibrateEnabled(enabled: boolean) {
    this.m_vibrateEnabled = enabled;
    this.onSetWriteSetting();
  }

  //设置声音的开关
  setSoundEnabled(enabled: boolean) {
    this.m_soundEnabled = enabled;
    if (!this.isSoundEnabled()) {
      this.stopMusic();
    }
    this.onSetWriteSetting();
  }

  private onSetWriteSetting() {
    let obj: SoundLocal = {
      sound: this.m_soundEnabled,
      vibrate: this.m_vibrateEnabled,
    };
    services().localStorageSrv.setStorage(SOUND_LOCAL_KEY, JSON.stringify(obj));
  }

  private onReadSetting() {
    let data = services().localStorageSrv.getStorage(SOUND_LOCAL_KEY);
    if (data) {
      let obj: SoundLocal = JSON.parse(data);
      this.m_soundEnabled = obj.sound;
      this.m_vibrateEnabled = obj.vibrate;
    }
  }

  /**
   * 播放背景音
   * gameBundle/preload/sound/aaa.mp3  ryw_playBGM("aaa")
   * @param name 具体名字 不带后缀.mp3
   */
  playMusic(name: string, otherBundle: cc.AssetManager.Bundle = null) {
    if (!this.isSoundEnabled()) return;
    let url = this.getSoundUrl(name);
    //播放背景音乐
    // const bundle = otherBundle == null ? modules().uiControlModule.getGameBundle() : otherBundle;
    const bundle = cc.resources;
    //
    bundle.load(url, cc.AudioClip, function (err, clip: cc.AudioClip) {
      if (err) {
        cc.error(err);
        return;
      }
      cc.audioEngine.playMusic(clip, true);
    });
  }

  /**
   * 停止播放背景音乐
   */
  stopMusic() {
    cc.audioEngine.stopMusic();
  }

  /**
   * 播放音效
   * @param name 具体名字 不带后缀.mp3
   * @returns 异步返回 播放的ID soundId
   */
  async playSound(
    name: string,
    otherBundle: cc.AssetManager.Bundle = null
  ): Promise<number> {
    return new Promise((resolve) => {
      if (!this.isSoundEnabled()) {
        return resolve(null);
      }
      let url = this.getSoundUrl(name);

      //   const bundle = otherBundle == null ? modules().uiControlModule.getGameBundle() : otherBundle;
      const bundle = cc.resources;
      //
      bundle.load(url, cc.AudioClip, function (err, clip: cc.AudioClip) {
        if (err) {
          cc.error(err);
          return resolve(null);
        }
        try {
          if (clip) {
            let audioId = cc.audioEngine.play(clip, false, 1);
            resolve(audioId);
          }
        } catch (e) {
          console.warn("#89警告 存在音频问题", url);
        }
      });
    });
  }

  /**
   * 停止音效
   * @param soundId
   */
  stopSound(audioId: number) {
    cc.audioEngine.stop(audioId);
  }

  setSoundUrl(Path: string) {
    this.soundResPath = Path;
    
  }

  getSoundUrl(name: string): string {
    let url = this.soundResPath + name;
    return url;
  }

  /**
   * 播放音效
   * @param name 具体名字 不带后缀.mp3
   * @returns 异步返回 播放的ID soundId
   */
   async playi18Sound(
    name: string,
    otherBundle: cc.AssetManager.Bundle = null
  ): Promise<number> {
    return new Promise((resolve) => {
      if (!this.isSoundEnabled()) {
        return resolve(null);
      }

	  let path = "ZH_CN"
	  switch (GameEngine.m_services.i18nSrv.getI18nSetting()) {
		case I18nLanguageEnum.ZH_CN:
			path ="ZH_CN"
			break;
		case I18nLanguageEnum.EN:
			path ="EN"
			break;
		case I18nLanguageEnum.ID:
			path ="ID"
			break;
		case I18nLanguageEnum.TH:
			path ="TH"
			break;
		case I18nLanguageEnum.IN:
			path ="IN"
			break;
		case I18nLanguageEnum.VN:
			path ="VN"
			break;
		case I18nLanguageEnum.JP:
			path ="JP"
			break;
		case I18nLanguageEnum.KR:
			path ="KR"
			break;
		  default:
			  break;
	  }

      let url =`Game/${GameInstInfo.getinstance().GameName}/resources/preload/`+ path+"/" +name

      const bundle = cc.resources;
      bundle.load(url, cc.AudioClip, function (err, clip: cc.AudioClip) {
        if (err) {
          cc.error(err);
          return resolve(null);
        }
        try {
          if (clip) {
            let audioId = cc.audioEngine.play(clip, false, 1);
            resolve(audioId);
          }
        } catch (e) {
          console.warn("#89警告 存在音频问题", url);
        }
      });
    });
  }


  /**
   * 播放具体游戏公共音效
   * @param name 具体名字 不带后缀.mp3
   * @returns 异步返回 播放的ID soundId
   */
   async playGamei18Sound(
    name: string,
    otherBundle: cc.AssetManager.Bundle = null
  ): Promise<number> {
    return new Promise((resolve) => {
      if (!this.isSoundEnabled()) {
        return resolve(null);
      }
      let url =`Game/${GameInstInfo.getinstance().GameName}/resources/preload/sound/`+ name
      const bundle = cc.resources;
      bundle.load(url, cc.AudioClip, function (err, clip: cc.AudioClip) {
        if (err) {
          cc.error(err);
          return resolve(null);
        }
        try {
          if (clip) {
            let audioId = cc.audioEngine.play(clip, false, 1);
            resolve(audioId);
          }
        } catch (e) {
          console.warn("#89警告 存在音频问题", url);
        }
      });
    });
  }
}
