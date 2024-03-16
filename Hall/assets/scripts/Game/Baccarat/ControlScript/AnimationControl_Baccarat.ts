// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";



const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimationControl extends cc.Component {
	protected className: string = "动画控制器";
	//动画控制器
    @property({ type:sp.Skeleton ,displayName:"开始下注" })//开始下注  停止下注 倒计时
    Startspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"骰子" })//
    Touzispine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"开奖" })//
    OpenAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"显示1" })//
    ShowAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"显示2" })//
    ShowAnimation2: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"赢" })//
    WinAnimation: sp.Skeleton | null = null;

	
	m_CallBcak = null
	
	b_IsOpen = false
	n_Index = 0

    start () {
		let self = this

		this.WinAnimation.setCompleteListener(function(){
			this.WinAnimation.node.active = false
		}.bind(this))

		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		
		this.ShowAnimation.setCompleteListener(function(){
			this.ShowAnimation.node.active = false
			
		}.bind(this))

		this.ShowAnimation2.setCompleteListener(function(){
			this.ShowAnimation2.node.active = false
			
		}.bind(this))

		this.Touzispine.setCompleteListener(function(){
			this.Touzispine.node.active = false
		}.bind(this))

		this.OpenAnimation.setCompleteListener(function(){
			if (self.m_CallBcak) {
				self.m_CallBcak(self.n_Index)
			}

			if (!this.b_IsOpen) {
				this.Touzispine.node.active = false
				this.OpenAnimation.setToSetupPose()
			}
		}.bind(this))
    }

	fucPlayWin(index,is_loop = false){
		let posX = [-200,0,200]
		this.WinAnimation.node.active = true
		this.WinAnimation.node.x = posX[index]
		this.WinAnimation.node.active = true
		this.WinAnimation.setAnimation(0, "animation", is_loop)
	}

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}

	fucPlayTouzi(skinId,is_loop = false){
		let skins = ["loop"]
		this.Touzispine.node.active = true

		this.Touzispine.setAnimation(0, "loop", is_loop)
	}

	fucZhuangPk(skinId,is_loop = false){
		let skins = ["show_0","show_1","show_2","show_3","show_4","show_5","show_6","show_7","show_8","show_9",]
		this.ShowAnimation.node.active = true
		this.ShowAnimation.setAnimation(0, skins[skinId], is_loop)
	}


	fucPlayPk(skinId,is_loop = false){
		let skins = ["show_0","show_1","show_2","show_3","show_4","show_5","show_6","show_7","show_8","show_9",]
		this.ShowAnimation2.node.active = true
		this.ShowAnimation2.setAnimation(0, skins[skinId], is_loop)
	}


	fucGetIndex(skinId){
		return skinId *2 - 2 + Math.floor(Math.random()*1)
	}

	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["stand1","stand2","stand3"]
		this.OpenAnimation.node.active = true
		if (isOpen) {
			this.OpenAnimation.setAnimation(0, startskins[2], is_loop)
			this.OpenAnimation.addAnimation(0,startskins[1], true, 0)
			this.fucPlayTouzi(0)
		}else{
			this.OpenAnimation.setAnimation(0, startskins[1], is_loop)
			this.Touzispine.node.active = false
		}
		this.b_IsOpen = isOpen
		this.m_CallBcak = CallBcak
	}
}