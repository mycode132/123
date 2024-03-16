// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

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

	m_CallBcak = null
	
	b_IsOpen = false
	n_Index = 0

    start () {
		this.OpenAnimation.node.active = false
		this.OpenAnimation.setAnimation(0, "in_00", false)

		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		this.Touzispine.setCompleteListener(function(){
			
		}.bind(this))

		this.OpenAnimation.setCompleteListener(function(){
			if (this.m_CallBcak) {
				this.m_CallBcak(this.n_Index)
			}

			if (!this.b_IsOpen) {
				this.OpenAnimation.node.active = false
			}
			this.m_CallBcak = null
		}.bind(this))
    }

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}

	fucPlayTouzi(skinId,is_loop = false){
		let skins = ["shake","stay"]
		this.Touzispine.node.active = true

		this.Touzispine.setAnimation(0, skins[skinId], is_loop)
		this.Touzispine.addAnimation(0,skins[1], true, 0)

		if (skinId == 0) {
			this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(()=>{
				SoundMgr.palyTouziSound()
			}),cc.delayTime(2.5),cc.callFunc(()=>{
				SoundMgr.palyFangWanSound()
			})))
		}
	}

	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["in_00","in_01","in_02","in_03","in_04"]
		let endskins =  ["out_00","out_01","out_02","out_03","out_04"]
		
		if (isOpen) {
			this.OpenAnimation.setAnimation(0, startskins[skinId], is_loop)
		}else{
			this.OpenAnimation.setAnimation(0, endskins[skinId], is_loop)
		}
		this.OpenAnimation.node.active = true

		this.b_IsOpen = isOpen
		
		this.m_CallBcak = CallBcak
		if (isOpen) {
			this.node.runAction(cc.sequence(cc.delayTime(2.8),cc.callFunc(()=>{
				SoundMgr.palyOpenWanSound()
			})))
		}else{
			this.node.runAction(cc.sequence(cc.delayTime(0.8),cc.callFunc(()=>{
				SoundMgr.palyGaiWanSound()
			})))
		}
		this.n_Index = skinId	
	}
}