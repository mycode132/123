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

	@property({ type:sp.Skeleton ,displayName:"公主" })//
    OpenAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"王子" })//
    OpenAnimation1: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"牌型显示1" })//  牌型
    ShowAnimation: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"牌型显示2" })//
    ShowAnimation2: sp.Skeleton | null = null;

	
	m_CallBcak = null
	m_CallBcak1= null
	
	b_IsOpen = false
	n_Index = 0

    start () {
		let self = this

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


		this.OpenAnimation1.setCompleteListener(function(){
			
			if (self.m_CallBcak1) {
				self.m_CallBcak1(self.n_Index)
				self.m_CallBcak1 = null
			}
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

	fucPlayTouzi(is_loop = false){
		this.Touzispine.node.active = true
		this.Touzispine.setAnimation(0, "animation", is_loop)
	}

	fucZhuangPk(skinId,is_loop = false){
		let skins =["type_01_GaoPai",
					"type_02_DuiZi",
					"type_03_LiangDui",
					"type_04_SanTiao",
					"type_05_ShunZi",
					"type_06_TongHua",
					"type_07_Hulu",
					"type_08_SiTiao",
					"type_09_TongHuaShun",
					"type_10_HuanGjiaTongHuaShun",]
		this.ShowAnimation.node.active = true
		this.ShowAnimation.setAnimation(0, skins[skinId], is_loop)
	}

	fucPlayPk(skinId,is_loop = false){
		let skins =["type_01_GaoPai",
					"type_02_DuiZi",
					"type_03_LiangDui",
					"type_04_SanTiao",
					"type_05_ShunZi",
					"type_06_TongHua",
					"type_07_Hulu",
					"type_08_SiTiao",
					"type_09_TongHuaShun",
					"type_10_HuanGjiaTongHuaShun",]
		this.ShowAnimation2.node.active = true
		this.ShowAnimation2.setAnimation(0, skins[skinId], is_loop)
	}

	//赢   ：  攻击   高兴   常态
	//输   ：  眩晕    哭    常态
	fucPlayOpen(skinId,CallBcak,isOpen = false,is_loop = false){
		//攻击  眩晕  输 常态  赢
		let startskins = ["attack","hurt","lost","stand","win"]
		if (skinId == 4) {
			startskins = ["attack","win","stand"]
		}else{
			startskins = ["hurt","lost","stand"]
		}
		this.OpenAnimation.node.active = true
		
		this.OpenAnimation.setAnimation(0,startskins[0], is_loop)
		this.OpenAnimation.addAnimation(0,startskins[1], false, 2)
		this.OpenAnimation.addAnimation(0,startskins[2], true, 4)
		//开音效
		SoundMgr.palyFishCrabsopen()
		
		this.b_IsOpen = isOpen
		this.m_CallBcak = CallBcak
	}

	fucPlayOpen1(skinId,CallBcak,isOpen = false,is_loop = false){
		let startskins = ["attack","hurt","lost","stand","win"]
		if (skinId == 4) {
			startskins = ["attack","win","stand"]
		}else{
			startskins = ["hurt","lost","stand"]
		}
		this.OpenAnimation1.node.active = true
		this.OpenAnimation1.setAnimation(0,startskins[0], is_loop)
		this.OpenAnimation1.addAnimation(0,startskins[1], false, 2)
		this.OpenAnimation1.addAnimation(0,startskins[2], true, 4)

		this.m_CallBcak1 = CallBcak
	}
}