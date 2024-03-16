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

	@property({ type:sp.Skeleton ,displayName:"背景动画" })//
    Touzispine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"NPC" })//
    OpenAnimation: sp.Skeleton | null = null;


	
	m_CallBcak = null
	m_CallBcak1= null
	
	b_IsOpen = false
	n_Index = 0

    start () {
		let self = this

		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		
	
		this.OpenAnimation.setCompleteListener(function(){
			if (self.m_CallBcak) {
				self.m_CallBcak(self.n_Index)
				self.m_CallBcak = null
			}

			if (!this.b_IsOpen) {
				this.OpenAnimation.setToSetupPose()
			}
		}.bind(this))
    }

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}
	
	//
	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["idle","start","stop","win"]
		this.OpenAnimation.node.active = true
		
		this.OpenAnimation.setAnimation(0,startskins[skinId], is_loop)
		
		this.OpenAnimation.addAnimation(0,startskins[0], true,1)

		
		this.b_IsOpen = isOpen
		this.m_CallBcak = CallBcak
	}
}