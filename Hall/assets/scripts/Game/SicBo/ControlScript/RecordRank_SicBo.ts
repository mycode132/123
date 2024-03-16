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
			n_data.Card= this.m_GameResult[index].LotteryOpen.split(",");
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
		let  item = null
		for (let index = this.m_loagIndex; index < (this.m_loagIndex+10); index++) {
			if (this.m_RecordData[index]) {
				item = this.fucSetItemInfo( this.m_RecordData[index])
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
		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucShowInfo(data)
		}.bind(this),this)
		Item.active = true
		return Item
	}

	//  3个骰子    点数   大小   单双
	fucGetRedCount(node,Count){
		node.getChildByName("sheet_1")
		let  path = 'Game/SicBo/resources/loadRes/img/game/SicBoHeTu'
		for (let index = 0; index < Count.length; index++) {
			let hSp = node.getChildByName('sheet_'+(index+1))
			
			let Imagename = `img_dice_s_${Number( Count[index])}`
			manager().resourceMgr.loadPlistImage(hSp,path,Imagename);
		}
		let n_result = Number( Count[0])+Number( Count[1])+Number( Count[2])
		let Exp_1 =  node.getChildByName("Exp_1")

		let Imagename = `num_show_${n_result}`
		manager().resourceMgr.loadPlistImage(Exp_1,path,Imagename);

		Exp_1 =  node.getChildByName("Exp_2")  //点
		GameInstInfo.getinstance().fucChangeImage(Exp_1)

		let b_Big = n_result>10 ? "img_info_1" : "img_info_2"
		Exp_1 =  node.getChildByName("Exp_3")
		GameInstInfo.getinstance().fucChangeImageName(Exp_1,b_Big)
		
		let b_Eve = n_result%2 != 0 ? "img_info_3" : "img_info_4"
		Exp_1 =  node.getChildByName("Exp_4")
		GameInstInfo.getinstance().fucChangeImageName(Exp_1,b_Eve)
	}

	fucShowInfo(_data){
		this.m_InfoLayer.active = true
		let MaskLayer= this.m_InfoLayer.getChildByName("Info_Layout")
		MaskLayer.opacity = 0
		MaskLayer.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
			MaskLayer.opacity = MaskLayer.opacity+2
		})),50))
		this.fucGetRedCount(this.m_InfoLayer,_data.Card)
	}
}