// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import TipsLayer from "../../../Public/ControlScript/TipsLayer";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordRank extends cc.Component {
	protected className: string = "顶部开奖记录";

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.Label,displayName:"提示"})
    m_TipsLab: cc.Label = null;

	@property({type:cc.Node,displayName:"信息层"})
    m_InfoLayer: cc.Node = null;

	//红白模版
	@property({type:[cc.SpriteFrame],displayName:"红白模版"})
    m_SpriteMode:cc.SpriteFrame[] = []

	//单  双   大  小
	@property({type:[cc.SpriteFrame],displayName:"单双大小"})
    m_SpriteDSDX:cc.SpriteFrame[] = []


	m_parent = null
   
	m_loagIndex = 0

	m_RecordData = []

	//开牌数据  
	m_data = {
		gamesnumber:1,  //局数
		Card:2,			//红碟数
	}

	m_GameResult = []

	onEnable(){
		TipsLayer.showTips()
	}


	onLoad(){
		let self= this
		this.node.getChildByName("sheet_15").setScale(0)
		this.node.getChildByName("BackLayout").off(cc.Node.EventType.TOUCH_END)
		this.node.getChildByName("BackLayout").on(cc.Node.EventType.TOUCH_END,function(){
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		this.node.getChildByName("sheet_15").getChildByName("close_but").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		this.m_InfoLayer.on(cc.Node.EventType.TOUCH_END,function(){
			self.m_InfoLayer.active = false
		}.bind(this),this)

		//具体信息层
		this.m_InfoLayer.on(cc.Node.EventType.TOUCH_END,function(){
			self.m_InfoLayer.active = false
		}.bind(this),this)

		this.m_InfoLayer.getChildByName("close_but").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			self.m_InfoLayer.active = false
		}.bind(this),this)

		this.m_ScrollView.node.on('scrolling', this.onScrolling, this);

		this.initChangeImage()
	}

	onScrolling() {
        let offset = this.m_ScrollView.getScrollOffset();
        let maxOffset = this.m_ScrollView.getMaxScrollOffset();
        let percentY = offset.y / maxOffset.y;

		//动态加载
		if (percentY >= 0.95  && this.m_loagIndex < this.m_RecordData.length) {
			this.fucAddItem()
		}
    }

	
	//多国语言适配Image
	initChangeImage(){
		//标签
		let n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("sheet_31")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)
	}

	fucwritedata(){
		this.m_RecordData = []
		for (let index = 0; index < this.m_GameResult.length; index++) {
			let n_data = JSON.parse(JSON.stringify(this.m_data))
			n_data.gamesnumber = this.m_GameResult[index].IssueNo 
			n_data.Card= Number(this.m_GameResult[index].LotteryOpen)
			this.m_RecordData.push(n_data)	
		}
	}


	fucShowNode(){
		this.m_GameResult = []
		this.node.active = true
		this.node.getChildByName("sheet_15").stopAllActions()
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.3,1.0))
		this.m_loagIndex = 0
		this.m_ScrollView.content.removeAllChildren()
	}

	fucUpView(data){
		this.m_GameResult = data
		this.fucwritedata()
		this.fucAddItem()
		this.m_ScrollView.scrollToTop()
		TipsLayer.showCloseTips()
	}

	fucAddItem(){
		for (let index = this.m_loagIndex; index < (this.m_loagIndex+10); index++) {
			if (this.m_RecordData[index]) {
				let  n_data = this.m_RecordData[index]
				let  item = this.fucSetItemInfo(n_data)
				this.m_ScrollView.content.addChild(item)
			}
		}
		this.m_loagIndex += 10
		if (this.m_RecordData.length > 8) {
			this.m_ScrollView.content.setContentSize(cc.size(this.m_LayoutMode.getContentSize().width,this.m_LayoutMode.getContentSize().height*this.m_loagIndex))
		}
	}

	fucSetItemInfo(data){
		let Item = cc.instantiate(this.m_LayoutMode)
		
		let pair = data.gamesnumber.slice(4);

		Item.getChildByName("Ju_num").getComponent(cc.Label).string = Number(pair) +""

		this.fucGetRedCount(Item,data.Card)
		this.fucSingleDouble(Item,data.Card)
		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucShowInfo(data)
		}.bind(this),this)
		Item.active = true
		return Item
	}

	//单  双   大  小
	fuccompareCard(Value){
		if (Value > 2 ) {
			return 2
		}
		if (Value < 2) {
			return 1
		}
		return 3
	}

	//单双
	fucSingleDouble(node,Value){
		let img_info_6 = node.getChildByName("img_info_6")
		let img_info_7 = node.getChildByName("img_info_7")   
		const path = 'Game/ColorDish/resources/loadRes/img/game/Sedie';
	
		if (this.fuccompareCard(Value) == 1 ) {
			manager().resourceMgr.loadPlistImage(img_info_7,path,"img_info_8",function(){
				GameInstInfo.getinstance().fucChangeImage(img_info_7)
			}); //小
		}else if(this.fuccompareCard(Value) == 2 )
		{
			manager().resourceMgr.loadPlistImage(img_info_7,path,"img_info_7",function(){
				GameInstInfo.getinstance().fucChangeImage(img_info_7)
			}); //大
		}

		if (Value == 2) {
			manager().resourceMgr.loadPlistImage(img_info_7,path,"img_info_9",function(){
				GameInstInfo.getinstance().fucChangeImage(img_info_7)
			}); //和
		}

		if (Value%2 == 0) {
			manager().resourceMgr.loadPlistImage(img_info_6,path,"img_info_6",function(){
				GameInstInfo.getinstance().fucChangeImage(img_info_6)
			}); //双
		}else{
			manager().resourceMgr.loadPlistImage(img_info_6,path,"img_info_5",function(){
				GameInstInfo.getinstance().fucChangeImage(img_info_6)
			}); //单
		}
	}

	fucGetRedCount(node,Count){
		//三白一红
		if (Count == 1) {
			for (let index = 0; index < 4; index++) {
				let sheet_1 = node.getChildByName("sheet_"+(index+1))  //1-4
				sheet_1.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[0]
			}
			for (let index = 0; index < 3; index++) {
				let sheet_1 = node.getChildByName("sheet_"+(index+1))  //1-4
				sheet_1.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[1]
			}
		}else{
			for (let index = 0; index < 4; index++) {
				let sheet_1 = node.getChildByName("sheet_"+(index+1))  //1-4
				sheet_1.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[1]
			}
			for (let index = 0; index < Count; index++) {
				let sheet_1 = node.getChildByName("sheet_"+(index+1))  //1-4
				sheet_1.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[0]
			}
		}
	}

	fucShowInfo(_data){
		this.m_InfoLayer.active = true
		let MaskLayer= this.m_InfoLayer.getChildByName("Info_Layout")
		MaskLayer.opacity = 0
		MaskLayer.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
			MaskLayer.opacity = MaskLayer.opacity+2
		})),50))
		//三白一红
		this.fucGetRedCount(this.m_InfoLayer,_data.Card)
		this.fucSingleDouble(this.m_InfoLayer,_data.Card)
	}
}