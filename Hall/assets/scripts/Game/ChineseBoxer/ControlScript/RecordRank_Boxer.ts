// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

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

	m_parent = null
   
	m_loagIndex = 0

	m_RecordData = []

	m_GameLab = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]

	//开牌数据  龙虎点数与花色
	m_data = {
		dragonCard:2,
		tigerCard:3,
		dragonColor:2,
		tigerColor:1,
		IssueNo:"",
		UTC_TIME:0,
	}

	onEnable(){
		TipsLayer.showTips()
	}


	onLoad(){
		let self= this
		this.node.getChildByName("sheet_15").setScale(0)
		this.node.getChildByName("BackLayout").off(cc.Node.EventType.TOUCH_END)
		this.node.getChildByName("BackLayout").on(cc.Node.EventType.TOUCH_END,function(){
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.0),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		this.node.getChildByName("sheet_15").getChildByName("close_but").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.0),cc.callFunc(()=>{
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

		this.fucChangeImage()
	}

	fucChangeImage(){
		//标签
		let n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("sheet_31")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)

		let drag= this.m_InfoLayer.getChildByName("drag")
		GameInstInfo.getinstance().fucChangeImage(drag)
		let tig= this.m_InfoLayer.getChildByName("tig")
		GameInstInfo.getinstance().fucChangeImage(tig)
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

	fucShowNode(){
		this.m_RecordData = []
		this.node.active = true
		this.node.getChildByName("sheet_15").stopAllActions()
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.3,1.0))
		this.m_loagIndex = 0
		this.m_ScrollView.content.removeAllChildren()
	}

	fucwritedata(data){
		let n_data = null
		let  aa = null
		for (let index = 0; index < data.length; index++) {
			n_data = JSON.parse(JSON.stringify(this.m_data))
			aa  = data[index].LotteryOpen.split(",");
			n_data.dragonCard= Number(aa[0])
			n_data.tigerCard= Number(aa[1])
			n_data.dragonColor= Number(aa[2])
			n_data.tigerColor= Number(aa[3])
			n_data.IssueNo = data[index].IssueNo
			n_data.UTC_TIME= data[index].UTC_TIME
			this.m_RecordData.push(n_data)	
		}
		this.fucAddItem()
		this.m_ScrollView.scrollToTop()
		TipsLayer.showCloseTips()
	}

	fucUpView(data){
		this.m_loagIndex = 0
		this.m_ScrollView.content.removeAllChildren()
		let  self = this
		self.fucwritedata(data)
	}

	fucAddItem(){
		for (let index = this.m_loagIndex; index < (this.m_loagIndex+10); index++) {
			if (this.m_RecordData[index]) {
				let  n_data = this.m_RecordData[index]
				let  item = this.fucSetItemInfo(n_data)
				this.m_ScrollView.content.addChild(item)
			}
		}

		if (this.m_loagIndex + 10 < this.m_RecordData.length+10) {
			this.m_loagIndex += 10
		}else{
			this.m_loagIndex = this.m_RecordData.length
		}

		if (this.m_RecordData.length > 8) {
			this.m_ScrollView.content.setContentSize(cc.size(this.m_LayoutMode.getContentSize().width,this.m_LayoutMode.getContentSize().height*this.m_loagIndex))
		}
	}

	fucSetItemInfo(data){
		let Item = cc.instantiate(this.m_LayoutMode)

		let pair = data.IssueNo.slice(4)

		Item.getChildByName("Ju_num").getComponent(cc.Label).string = Number(pair) +""

		Item.getChildByName("DraNum").getComponent(cc.Label).string = `（${this.m_GameLab[data.dragonCard-1]}）`

		Item.getChildByName("TigNum").getComponent(cc.Label).string = `（${this.m_GameLab[data.tigerCard-1]}）`

		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucShowInfo(data)
		}.bind(this),this)

		//适配图片
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("Dralab"))
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("Tiglab"))

		if (data.dragonCard > data.tigerCard) {
			//赢
			Item.getChildByName("Wintage").getComponent(cc.Sprite).spriteFrame = Item.getChildByName("Dralab").getComponent(cc.Sprite).spriteFrame
		}else if (data.dragonCard < data.tigerCard) {
			//赢
			Item.getChildByName("Wintage").getComponent(cc.Sprite).spriteFrame = Item.getChildByName("Tiglab").getComponent(cc.Sprite).spriteFrame
		}else {
			//赢
			Item.getChildByName("Wintage").getComponent(cc.Sprite).spriteFrame = Item.getChildByName("Tielab").getComponent(cc.Sprite).spriteFrame
		}
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("Wintage"))
		

		Item.active = true
		return Item
	}

	fucShowInfo(_data){
		this.m_InfoLayer.active = true
		let MaskLayer= this.m_InfoLayer.getChildByName("Info_Layout")
		
		MaskLayer.opacity = 0
		MaskLayer.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
			MaskLayer.opacity = MaskLayer.opacity+2
		})),50))

		let CardsMode1 = this.m_InfoLayer.getChildByName("CardsMode1").getComponent("CardsMode_Boxer")
		CardsMode1.fucShowData(_data.dragonCard,_data.dragonColor)

		let CardsMode2 = this.m_InfoLayer.getChildByName("CardsMode2").getComponent("CardsMode_Boxer")
		CardsMode2.fucShowData(_data.tigerCard,_data.tigerColor)
	}
}