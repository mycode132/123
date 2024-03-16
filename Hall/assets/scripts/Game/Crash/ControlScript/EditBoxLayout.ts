// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

	@property({type: cc.Label, displayName: '总额度'})
	mAllMoney_lab: cc.Label = null;
	//底分  加倍
	@property({type:[cc.SpriteFrame],displayName:"类型"})
    m_SpriteMode:cc.SpriteFrame[] = []
	//加减
	@property({type: cc.Button, displayName: '加'})
	m_AddBut: cc.Button = null;

	@property({type: cc.Button, displayName: '减'})
	m_subBut: cc.Button = null;
	//滑动条
	@property({type: cc.Slider, displayName: '滑动条'})
	m_slider: cc.Slider = null;
	//确认
	@property({type: cc.Button, displayName: '确认'})
	m_conBut: cc.Button = null;
	//停利   停损
	@property({type: cc.Label, displayName: '停利停损'})
	m_LiLab: cc.Label = null;
	//金币  底分
	@property({type: cc.Sprite, displayName: '金币底分'})
	m_Score: cc.Sprite = null;
    
	m_callback = null
	m_selectStr = ""

	m_Index = 0
	m_Number = []
	m_Type = ""

    start (){
		this.m_slider.node.on('slide', this.callback, this);

		this.m_AddBut.node.on(cc.Node.EventType.TOUCH_END,function(){this.fucAddOrSubfuc(1)},this)

		this.m_subBut.node.on(cc.Node.EventType.TOUCH_END,function(){this.fucAddOrSubfuc(0)},this)

		this.m_conBut.node.on(cc.Node.EventType.TOUCH_END,function(){this.fucConfirm()},this)
    }

	//底分  加倍   停利  停损    //  最低分与最高分
	fucShowType(Num,Type,lab){
		this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ Num
		this.m_Type = Type
		this.m_Number = []
		switch(Type){
			case "amount":
				this.m_Number =GameInfo.getinstance().m_Basicscore
				this.m_Score.node.active = true
				this.m_LiLab.node.active = false
				this.m_Score.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[0]
				break;
			case "odd":
				this.m_Score.node.active = true
				this.m_LiLab.node.active = false
				this.m_Number = GameInfo.getinstance().m_multiple
				this.m_Score.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[1]
				break;
			case "Li":
				this.m_Score.node.active = false
				this.m_LiLab.node.active = true
				this.m_Number = GameInfo.getinstance().m_stopLi
				this.m_LiLab.getComponent(cc.Label).string = "停利"
				break;
			case "Sun":
				this.m_Score.node.active = false
				this.m_LiLab.node.active = true
				this.m_Number = GameInfo.getinstance().m_stopSun
				this.m_LiLab.getComponent(cc.Label).string = "停损"
				break;
		}
	}

	fucAddOrSubfuc(Type){
		if (Type) {
			if (this.m_Index + 1 < this.m_Number.length) {
				this.m_Index += 1
			}
		}else{
			if (this.m_Index - 1 > 0) {
				this.m_Index -= 1
			}
		}
		let nCount  = this.m_Number[this.m_Index]

		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}

		if (this.m_Type == "amount") {
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ toThousands(nCount) +"K"
			GameInfo.getinstance().m_GameData.m_Basicscore = nCount
		}else if (this.m_Type == "odd") {
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ nCount + ".00X"
			GameInfo.getinstance().m_GameData.m_multiple = nCount
		}else if (this.m_Type == "Li" ) {
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ toThousands(nCount) + ".00tr"
			GameInfo.getinstance().m_GameData.m_stopLi = nCount
		}else if(this.m_Type == "Sun"){
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ toThousands(nCount) + ".00tr"
			GameInfo.getinstance().m_GameData.m_stopSun = nCount
		}
	}

	fucConfirm(){
		if (this.m_callback) {
			this.m_callback(this.mAllMoney_lab.getComponent(cc.Label).string)
		}
		this.node.removeFromParent()
	}

	callback(slider) {
		let nCount = 0
		if (slider.progress == 0) {
			nCount = this.m_Number[0]
		}else if(slider.progress == 1){
			nCount = this.m_Number[this.m_Number.length-1]
		}else{
			nCount = Math.round(this.m_Number[this.m_Number.length-1]*slider.progress) 
		}

		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}

		if (this.m_Type == "amount") {
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ toThousands(nCount) +"K"
			GameInfo.getinstance().m_GameData.m_Basicscore = nCount
		}else if (this.m_Type == "odd") {
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ nCount + ".00X"
			GameInfo.getinstance().m_GameData.m_multiple = nCount
		}else if (this.m_Type == "Li" ) {
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ toThousands(nCount) + ".00tr"
			GameInfo.getinstance().m_GameData.m_stopLi = nCount
		}else if(this.m_Type == "Sun"){
			this.mAllMoney_lab.getComponent(cc.Label).string  = ""+ toThousands(nCount) + ".00tr"
			GameInfo.getinstance().m_GameData.m_stopSun = nCount
		}

	}

	fucCallBcak(callback){
		this.m_callback = callback
	}
}