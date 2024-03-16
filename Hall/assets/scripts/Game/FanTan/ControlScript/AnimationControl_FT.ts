// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";



const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimationControl extends cc.Component {
	protected className: string = "动画控制器";
	//动画控制器
    @property({ type:sp.Skeleton ,displayName:"开始下注" })//开始下注  停止下注 倒计时
    Startspine: sp.Skeleton | null = null;


	@property({ type:sp.Skeleton ,displayName:"开奖" })//
    OpenAnimation: sp.Skeleton | null = null;

	@property({type: cc.Sprite, displayName: '点数'})
    m_GamePoint: cc.Sprite = null;

	m_CallBcak = null
	
	b_IsOpen = false
	n_Index = 0

    start () {
		
		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		this.OpenAnimation.node.active = true
		this.OpenAnimation.setAnimation(0,"time", true)
		this.OpenAnimation.setCompleteListener(function(){
			if (this.m_CallBcak) {
				this.m_CallBcak(this.n_Index)
			}
			this.m_CallBcak = null

			if (this.b_IsOpen) {
				let path = 'Game/FanTan/resources/loadRes/img/game/HeTuList';
				let Imagename = `mb_img_answer_${this.n_Index+1}`
				manager().resourceMgr.loadPlistImage(this.m_GamePoint,path,Imagename);
				this.m_GamePoint.node.active = true
				//播报点数
				SoundMgr.palyFishCrabsSound("fan_"+(this.n_Index+1))
			}
		}.bind(this))
    }

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}

	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["open_1","open_2","open_3","open_4"]
		let endskins =   ["end_1","end_2","end_3","end_4",]
		if (isOpen) {
			this.OpenAnimation.setAnimation(0, startskins[skinId], is_loop)
			this.schedule(function(){
				SoundMgr.palyGamePublicSound("arrange")
			},0.2,17,4)
		}else{
			this.OpenAnimation.setAnimation(0, endskins[skinId], is_loop)
			this.OpenAnimation.addAnimation(0,"time", true)

			
			this.schedule(function(){
				SoundMgr.palyGamePublicSound("openreawr")
			},1,3,1)

		}
		
		this.b_IsOpen = isOpen
		this.m_CallBcak = CallBcak
		if (isOpen) {
			this.node.runAction(cc.sequence(cc.delayTime(2.8),cc.callFunc(()=>{
				
			})))
		}else{
			this.node.runAction(cc.sequence(cc.delayTime(0.8),cc.callFunc(()=>{
				
			})))
			this.m_GamePoint.node.active = false
		}
		this.n_Index = skinId	
	}
}