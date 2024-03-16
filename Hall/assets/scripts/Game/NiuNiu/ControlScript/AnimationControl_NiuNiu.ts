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

	@property({ type:sp.Skeleton ,displayName:"牌型庄" })//牌型
    Show_An_Zhuan: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"牌型闲1" })//
    Show_An_Xian1: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"牌型闲2" })//牌型
    Show_An_Xian2: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"牌型闲3" })//
    Show_An_Xian3: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"win1" })//
    Win1: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"win2" })//
    Win2: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"win3" })//
    Win3: sp.Skeleton | null = null;


    start () {
		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
		}.bind(this))

		this.Win1.setCompleteListener(function(){
			this.Win1.node.active = false
		}.bind(this))

		this.Win2.setCompleteListener(function(){
			this.Win2.node.active = false
			
		}.bind(this))
		this.Win3.setCompleteListener(function(){
			this.Win3.node.active = false
		}.bind(this))
    }

	//start
	fucPlayStart(skinId,is_loop = false){
		let skins = ["start","stop","times"]
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, skins[skinId], is_loop)
	}

	//Win
	fucPlayWin(skinId,index,is_loop = false){
		let O_Animation = [this.Win1,this.Win2,this.Win3]
		let posX = [-172,172]
		O_Animation[skinId].node.active = true
		O_Animation[skinId].node.x = posX[index]
		O_Animation[skinId].setAnimation(0, "animation", is_loop)
	}

	fucCardsType(skinId,index,is_loop = false){
		if (index == 0) {
			this.Show_An_Zhuan.node.active = true
			this.Show_An_Zhuan.setAnimation(0, "show"+skinId, is_loop)
		}
		else if (index ==1){
			this.Show_An_Xian1.node.active = true
			this.Show_An_Xian1.setAnimation(0, "show"+skinId, is_loop)
		}
		else if (index == 2){
			this.Show_An_Xian2.node.active = true
			this.Show_An_Xian2.setAnimation(0, "show"+skinId, is_loop)
		}
		else if (index == 3){
			this.Show_An_Xian3.node.active = true
			this.Show_An_Xian3.setAnimation(0, "show"+skinId, is_loop)
		}
	}

	fucClose(){
		this.Show_An_Zhuan.node.active = false
		this.Show_An_Xian1.node.active = false
		this.Show_An_Xian2.node.active = false
		this.Show_An_Xian3.node.active = false
	}
}