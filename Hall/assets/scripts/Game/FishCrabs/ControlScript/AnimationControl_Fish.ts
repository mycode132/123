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

	@property({ type:sp.Skeleton ,displayName:"显示" })//
    ShowAnimation: sp.Skeleton | null = null;

	//12个元素 图片  每个两种形态
	//蟹  鱼  鸡   虾  葫芦  铜板
	@property({type:[cc.SpriteFrame],displayName:"12个元素"})
    m_SpriteMode:cc.SpriteFrame[] = []

	@property({type:[cc.SpriteFrame],displayName:"6显示个元素"})
    m_ShowSpriteMode:cc.SpriteFrame[] = []

	m_CallBcak = null
	
	b_IsOpen = false
	n_Index = 0

    start () {
		let self = this

		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		this.ShowAnimation.setCompleteListener(function(){
			//this.ShowAnimation.node.active = false
			
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
			}else{
				this.ShowAnimation.node.active = true
				this.ShowAnimation.setAnimation(1, "in", false)
				this.node.runAction(cc.sequence(cc.delayTime(1.5),cc.callFunc(()=>{
					this.ShowAnimation.setAnimation(1, "out", false)
				})))
			}
		}.bind(this))
    }

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(1, skins[skinId], is_loop)
	}

	fucPlayTouzi(skinId,is_loop = false){
		this.Touzispine.node.active = true
		this.Touzispine.setAnimation(1, "loop", is_loop)
	}

	//  1 - 6    2-12
	//蟹  鱼  鸡   虾  葫芦  铜板
	//1-12图   随机
	fucGetIndex(skinId){
		return skinId *2 - 2 + Math.floor(Math.random()*1)
	}

	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["big_in","big_out","small_in","small_shake","small_stay"]
		this.OpenAnimation.node.active = true
		if (isOpen) {
			//直接换图
			let att = this.OpenAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[6].dice03;
			let region = GameInstInfo.getinstance().CreateRegion(this.m_SpriteMode[this.fucGetIndex(skinId[0])].getTexture()) 
			att.region = region
			att.setRegion(region)
			att.updateOffset()

			let att1 = this.OpenAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[7].dice02;
			let region1 = GameInstInfo.getinstance().CreateRegion(this.m_SpriteMode[this.fucGetIndex(skinId[1])].getTexture()) 
			att1.region = region1
			att1.setRegion(region1)
			att1.updateOffset()

			let att2 = this.OpenAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[8].dice01;
			let region2 = GameInstInfo.getinstance().CreateRegion(this.m_SpriteMode[this.fucGetIndex(skinId[2])].getTexture()) 
			att2.region = region2
			att2.setRegion(region2)
			att2.updateOffset()


			//直接换图
			let att3 = this.ShowAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[3].dice_pic;  // 
			let region3 = GameInstInfo.getinstance().CreateRegion(this.m_ShowSpriteMode[(skinId[0])].getTexture(),true) 
			att3.region = region3
			att3.setRegion(region3)
			att3.updateOffset()

			let att4 = this.ShowAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[4].dice_pic;  //  
			let region4 = GameInstInfo.getinstance().CreateRegion(this.m_ShowSpriteMode[(skinId[1])].getTexture(),true) 
			att4.region = region4
			att4.setRegion(region4)
			att4.updateOffset()

			let att5 = this.ShowAnimation.skeletonData.getRuntimeData().defaultSkin.attachments[5].dice_pic;  //  
			let region5 = GameInstInfo.getinstance().CreateRegion(this.m_ShowSpriteMode[(skinId[2])].getTexture(),true)
			att5.region = region5
			att5.setRegion(region5)
			att5.updateOffset()
				
			this.OpenAnimation.setAnimation(1, "big_in", is_loop)

			this.fucPlayTouzi(0)
			
			//开音效
			SoundMgr.palyFishCrabsopen()
		}else{
			SoundMgr.palyFishCrabsbowl()
			this.OpenAnimation.setAnimation(1, startskins[3], is_loop)
			this.Touzispine.node.active = false
		}
		
		this.b_IsOpen = isOpen
		this.m_CallBcak = CallBcak
	}
}