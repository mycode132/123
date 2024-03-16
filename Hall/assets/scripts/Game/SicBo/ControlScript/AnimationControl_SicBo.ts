// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimationControl extends cc.Component {
	protected className: string = "动画控制器";
	//动画控制器
    @property({ type:sp.Skeleton ,displayName:"开始下注" })//开始下注  停止下注 倒计时
    Startspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"人物" })//
    NpcAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"开奖" })//
    OpenAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"骰子" })//
    TouziAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"高亮" })//
    HightAnimation: sp.Skeleton | null = null;

	@property({type:[cc.SpriteFrame],displayName:"6个骰子"})
    m_SpriteMode:cc.SpriteFrame[] = []

	@property({type:[cc.SpriteFrame],displayName:"6显示个元素"})
    m_ShowSpriteMode:cc.SpriteFrame[] = []

	//3-12点
	@property({type:[cc.SpriteFrame],displayName:"3-12"})
    m_Showpoint:cc.SpriteFrame[] = []

	//大小 单双  点 
	m_SpriteNode = []
	
	m_CallBcak = null
	
	b_IsOpen = true
	n_Index = 0

	onLoad(){
		this.initChangeImage()
	}

    start () {
		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		this.HightAnimation.setCompleteListener(function(){
			this.HightAnimation.node.active = false
		}.bind(this))
	
		this.OpenAnimation.node.active = true

		this.OpenAnimation.setCompleteListener(function(){
			if (this.m_CallBcak) {
				this.m_CallBcak(this.n_Index)
			}
			this.m_CallBcak = null

			if (!this.b_IsOpen) {
				this.TouziAnimation.node.active = false
			}
		}.bind(this))
    }

	//多国语言适配Image
	initChangeImage(){
		this.m_SpriteNode = []
		for (let index = 0; index < 5; index++) {
			let btnInning = this.node.getChildByName('SpriteMode_'+index);  
			GameInstInfo.getinstance().fucChangeImage(btnInning)
			this.m_SpriteNode.push(btnInning)
		}
	}

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}

	fucPlayNPC(skinId,is_loop = false){
		let startskins = ["stand1","stand2","stand3","stand4"]
		this.NpcAnimation.node.active = true
		this.NpcAnimation.setAnimation(0, startskins[skinId], is_loop)
		this.NpcAnimation.addAnimation(0,startskins[0], true)
	}

	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["zoom_in","zoom_out"]

		if (isOpen) {
			let att = this.OpenAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[5].img_dice_2;
			let region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteMode[skinId[0]-1].getTexture()) 
			att.region = region
			att.setRegion(region)
			att.updateOffset()

			att = this.OpenAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[6].img_dice_6;
			region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteMode[skinId[1]-1].getTexture()) 
			att.region = region
			att.setRegion(region)
			att.updateOffset()

			att = this.OpenAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[7].img_dice_4;
			region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteMode[skinId[2]-1].getTexture()) 
			att.region = region
			att.setRegion(region)
			att.updateOffset()

			this.OpenAnimation.setAnimation(0, startskins[0], is_loop)

			this.scheduleOnce(function(){
				this.HightAnimation.node.active = true
				this.HightAnimation.setAnimation(0, "loop", is_loop)
			},1.0)

			SoundMgr.palyGamePublicSound("sicbo_shake")

			this.scheduleOnce(function(){
				this.fucShowTouziAnimation(skinId)
			},2.0)
		}else{
			this.OpenAnimation.setAnimation(0, startskins[1], is_loop)
		
			this.TouziAnimation.setAnimation(0, "out", is_loop)
			this.fucPlayNPC(2)
		}
		
		this.b_IsOpen = isOpen
		this.m_CallBcak = CallBcak
		if (isOpen) {
			this.node.runAction(cc.sequence(cc.delayTime(2.8),cc.callFunc(()=>{
				
			})))
		}else{
			this.node.runAction(cc.sequence(cc.delayTime(0.8),cc.callFunc(()=>{
				
			})))
		}
		this.n_Index = skinId	
	}

	//延时显示
	fucShowTouziAnimation(skinId,is_loop = false){
		//直接换图
		let att1 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[0].img_show_dice_4;  // 
		let region = GameInstInfo.getinstance().CreateRegion(this.m_ShowSpriteMode[skinId[0]-1].getTexture(),true) 
		att1.region = region
		att1.setRegion(region)
		att1.updateOffset()

		let att2 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[1].img_show_dice_2;  //  
		region = GameInstInfo.getinstance().CreateRegion(this.m_ShowSpriteMode[skinId[1]-1].getTexture(),true) 
		att2.region = region
		att2.setRegion(region)
		att2.updateOffset()

		let att3 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[2].img_show_dice_6;  //  
		region = GameInstInfo.getinstance().CreateRegion(this.m_ShowSpriteMode[skinId[2]-1].getTexture(),true)
		att3.region = region
		att3.setRegion(region)
		att3.updateOffset()

		let n_result = skinId[0] + skinId[1] + skinId[2]

		let  n_big = n_result > 10 ? 0 : 1
		let att4 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[5].tx_show_big;  //    大小
		region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteNode[n_big].getComponent(cc.Sprite).spriteFrame.getTexture(),true)
		att4.region = region
		att4.setRegion(region)
		att4.updateOffset() 

		let  n_even = n_result%2==0 ? 3 : 2
		let att5 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[6].tx_show_even;  //   单双
		region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteNode[n_even].getComponent(cc.Sprite).spriteFrame.getTexture(),true)
		att5.region = region
		att5.setRegion(region)
		att5.updateOffset() 
		
		let att6 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[3].num_show_12;  // 
		region = GameInstInfo.getinstance().CreateRegion(this.m_Showpoint[n_result-3].getTexture(),true)
		att6.region = region
		att6.setRegion(region)
		att6.updateOffset() 
		
		let att7 = this.TouziAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[4].tx_show_points;  //  点
		region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteNode[4].getComponent(cc.Sprite).spriteFrame.getTexture(),true)
		att7.region = region
		att7.setRegion(region)
		att7.updateOffset() 

		this.TouziAnimation.node.active = true
		this.TouziAnimation.setAnimation(0, "in", is_loop)
	}
}