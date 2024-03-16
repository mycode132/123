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

	@property({ type:sp.Skeleton ,displayName:"龙" })//
    Dragonspine: sp.Skeleton | null = null;

	@property({ type: sp.Skeleton, displayName: "虎" })//
    Tigerspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"VS" })//
    Vsspine: sp.Skeleton | null = null;

	//赢   龙  虎
	@property({ type:sp.Skeleton ,displayName:"赢龙" })//
    WinDragonspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"赢虎" })//
    WinTigerspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"和" })//
    WinTiespine: sp.Skeleton | null = null;

    start () {
		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		this.Dragonspine.setCompleteListener(function(){
			//this.Dragonspine.setAnimation(0, "stand", true)
		}.bind(this))

		this.Dragonspine.setEndListener(function(){
			//this.Dragonspine.setAnimation(0,"stand", true);
		}.bind(this))

		this.Tigerspine.setCompleteListener(function(){
			//this.Tigerspine.setAnimation(0, "stand", true)
		}.bind(this))

		this.Tigerspine.setEndListener(function(){
			//this.Tigerspine.setAnimation(0,"stand", true);
		}.bind(this))

		this.Vsspine.setCompleteListener(function(){
			this.Vsspine.node.active = false
		}.bind(this))


		//赢
		this.WinTiespine.setCompleteListener(function(){
			this.WinTiespine.node.active = false
		}.bind(this))

		this.WinDragonspine.setCompleteListener(function(){
			this.WinDragonspine.node.active = false
		}.bind(this))

		this.WinTigerspine.setCompleteListener(function(){
			this.WinTigerspine.node.active = false
		}.bind(this))
    }

	//龙
	fucPlayDragon(skinId,is_loop= false){
		let skins = ["attack","hurt","stand"]
		this.Dragonspine.setAnimation(0, skins[skinId], is_loop)
		this.Dragonspine.addAnimation(0,skins[2], true, 0)
	}

	//虎
	fucPlayTiger(skinId,is_loop= false){
		let skins = ["attack","hurt","stand"]
		this.Tigerspine.setAnimation(0,skins[skinId], is_loop);
		this.Tigerspine.addAnimation(0,skins[2], true, 0)
	}

	//vs  callback
	fucPlayVS(){
		SoundMgr.palygame_vsSound()
		this.Vsspine.node.active = true
		this.Vsspine.setAnimation(0, "animation", false)
		this.Vsspine.timeScale = 0.8  //慢速播放
	
	}

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}


	//callback
	fucPlayWinDragon(){
		this.WinDragonspine.node.active = true
		this.WinDragonspine.setAnimation(0, "animation", false)
		SoundMgr.palyDagSound()
		this.fucPlayDragon(0,false)
		this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(()=>{
			this.fucPlayTiger(1,false)
		}),cc.delayTime(0.5),cc.callFunc(()=>{
			SoundMgr.palyDWinSound()
		})))
	}

	//callback
	fucPlayWinTiger(){
		this.WinTigerspine.node.active = true
		this.WinTigerspine.setAnimation(0, "animation", false)
		this.fucPlayTiger(0,false)
		SoundMgr.palyTigSound() 
		this.node.runAction(cc.sequence(cc.delayTime(0.4),cc.callFunc(()=>{
			this.fucPlayDragon(1,false)
			
		}),cc.delayTime(0.5),cc.callFunc(()=>{
			SoundMgr.palyTWinSound()
			
		})))
	}

	//和
	fucPlayTie(){
		this.WinTiespine.node.active = true
		this.WinTiespine.setAnimation(0, "animation", false)
		this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(()=>{
			SoundMgr.palyTieWinSound()
		})))
	}
}