// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine from "../../control/engines/GameEngine";
import GameInstInfo from "./GameInstInfo";
import SoundMgr from "./SoundMgr";

const {ccclass, property} = cc._decorator;

//通用模块

//

@ccclass
export default class gameSet extends cc.Component {
	protected className: string = "游戏设置";

	@property({type:cc.Toggle,displayName:"音乐"})
	m_MusicBut : cc.Toggle = null

	@property({type:cc.Toggle,displayName:"音效"})
	m_SoundBut : cc.Toggle = null

	@property({type:cc.Toggle,displayName:"筹码"})
	m_ChipShowBut :cc.Toggle = null

	@property({type:cc.Toggle,displayName:"玩法"})
	m_PlayingBut : cc.Toggle = null

	@property({type:cc.Toggle,displayName:"记录"})
    m_RecordBut:cc.Toggle = null

	@property({type:cc.Node,displayName:"关闭按钮"})
	m_CloseBUt:cc.Node = null

	m_parent = null

	m_Callbcak = null

	But_MusicIndex: number = 0;
	But_SoundIndex: number = 1;
	But_ChipShowIndex: number = 2;
	But_PlayingIndex: number = 3;
	But_RecordIndex: number = 4;

	onLoad(){
	}

    start () {
		this.m_MusicBut.node.on('toggle', function(event){
			SoundMgr.palyButSound()
			this.fucButClickFunc(this.But_MusicIndex)
		
			if (!this.m_MusicBut.getComponent(cc.Toggle).isChecked) {
				SoundMgr.PlayBgMusic()
			}else{
				SoundMgr.PlayStopBgMusic()
			}
		}.bind(this), this);

		this.m_SoundBut.getComponent(cc.Toggle).isChecked = !GameEngine.m_managers.soundMgr.isSoundEnabled()
		this.m_SoundBut.node.on('toggle', function(event){
			SoundMgr.palyButSound()
			GameEngine.m_managers.soundMgr.setSoundEnabled(!this.m_SoundBut.getComponent(cc.Toggle).isChecked)

			if (!this.m_SoundBut.getComponent(cc.Toggle).isChecked) {
				SoundMgr.PlayBgMusic()
			}
			
   		}.bind(this), this);
		this.m_ChipShowBut.node.on('toggle', function(event){
			SoundMgr.palyButSound()
			this.fucButClickFunc(this.But_ChipShowIndex)
   		}.bind(this), this);
		this.m_PlayingBut.node.on('toggle', function(event){
			SoundMgr.palyButSound()
			this.fucButClickFunc(this.But_PlayingIndex)
   		}.bind(this), this);
		this.m_RecordBut.node.on('toggle', function(event){
			SoundMgr.palyButSound()
			this.fucButClickFunc(this.But_RecordIndex)
   		}.bind(this), this);

		let  self = this
		this.m_CloseBUt.on(cc.Node.EventType.TOUCH_END, function(event){
			SoundMgr.palyButSound()
			self.m_parent.m_GameSetNode.active = false

			self.fucButClickFunc(10)
   		}.bind(this), this);

		this.fucChangeImage()
    }

	fucChangeImage(){
		//标签
		let layout = this.node.getChildByName("layout")
		let n_Recordst =  layout.getChildByName("SoundToggle").getChildByName("nSprite")
		GameInstInfo.getinstance().fucChangeSettingImage(n_Recordst)

		n_Recordst =  layout.getChildByName("MusicToggle").getChildByName("nSprite")
		GameInstInfo.getinstance().fucChangeSettingImage(n_Recordst)

		n_Recordst =  layout.getChildByName("ChipToggle").getChildByName("nSprite")
		GameInstInfo.getinstance().fucChangeSettingImage(n_Recordst)

		n_Recordst =  layout.getChildByName("PlayToggle").getChildByName("nSprite")
		GameInstInfo.getinstance().fucChangeSettingImage(n_Recordst)

		n_Recordst =  layout.getChildByName("RecordToggle").getChildByName("nSprite")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)

		//动画  //公平验证
		if (GameInstInfo.getinstance().GameName == "Crash" ) {
			layout.getChildByName("ChipToggle").active = false
		}
	}

	fucButClickFunc(index){
		if (this.m_Callbcak) {
			this.m_Callbcak(index)
		}
	}

	fucSteCallback(callbcak){
		this.m_Callbcak = callbcak
	}

	
	fucSetParent(_parent){
		this.m_parent = _parent
	}
}