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
		zhuang_Card:0, //游戏点数
		Xian_Card:0,

		zhuang_CardData:[],
		Xian_CardData:[],

		zhuang_Color:[],
		xian_Color:[],

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

	fucGameresult(data){
		//获取开奖结果
		let result =  data.LotteryOpen.split(",");
	
		let n_data = JSON.parse(JSON.stringify(this.m_data))
	
		//牌值
		n_data.zhuang_CardData = []  
		n_data.Xian_CardData   = []
		//花色
		n_data.zhuang_Color = []
		n_data.xian_Color   = []

		//期数   时间
		n_data.IssueNo = data.IssueNo
		n_data.UTC_TIME= data.UTC_TIME

		let  n_index = 0
		for (let index = 0; index < result[1]; index++) {
			let element = Number(result[result.length-1  - n_index])
			n_data.zhuang_Color[index] = element
			n_index +=1
		}
		n_data.zhuang_Color = n_data.zhuang_Color.reverse(); 
		for (let index = 0; index < result[0]; index++) {
			let element = Number(result[result.length-1  - n_index])
			n_data.xian_Color[index] = element
			n_index +=1
		}
		n_data.xian_Color = n_data.xian_Color.reverse(); 

		//如：2,2,8,12,3,9,2,3  闲牌2张牌,庄牌2张牌,,闲点数8,12,庄点数3,9,闲牌花色2,庄牌花色3
		if (Number(result[0]) == 3 ) {
			n_data.Xian_CardData[0] = Number(result[2])
			n_data.Xian_CardData[1] = Number(result[3])
			n_data.Xian_CardData[2] = Number(result[4])

			n_data.zhuang_CardData[0] = Number(result[5])
			n_data.zhuang_CardData[1] = Number(result[6])
			n_data.zhuang_CardData[2] = 0
			//闲 3  庄 3
			if (Number(result[1]) == 3) {
				n_data.zhuang_CardData[2] = Number(result[7])
			}
		}else{
			n_data.Xian_CardData[0] = Number(result[2])
			n_data.Xian_CardData[1] = Number(result[3])
			n_data.Xian_CardData[2] = 0

			n_data.zhuang_CardData[0] = Number(result[4])
			n_data.zhuang_CardData[1] = Number(result[5])
			n_data.zhuang_CardData[2] = 0
			if (Number(result[1]) == 3) {
				n_data.zhuang_CardData[2] = Number(result[6])
			}
		}

		n_data.zhuang_Card= this.fuccompareCard(n_data.zhuang_CardData)
		n_data.Xian_Card= this.fuccompareCard(n_data.Xian_CardData)


		return  n_data
	}

	//  闲 :1   庄:0   tie:2
	fuccompareCard(TouziPonits){
		let result =0
		for (let index = 0; index < TouziPonits.length; index++) {
			const element = TouziPonits[index];
			if (element>=10 ) {
				result +=0
			}else{
				result +=element
			}
			if (result>=10) {
				result = result-10
			}
		}
		return result
	}

	fucwritedata(data){
		for (let index = 0; index < data.length; index++) {
			let n_data = this.fucGameresult(data[index])
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

		let pair = data.IssueNo.slice(4);

		Item.getChildByName("Ju_num").getComponent(cc.Label).string = Number(pair) +""

		Item.getChildByName("DraNum").getComponent(cc.Label).string = `（${data.zhuang_Card}）`

		Item.getChildByName("TigNum").getComponent(cc.Label).string = `（${data.Xian_Card}）`

		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucShowInfo(data)
		}.bind(this),this)

		//适配图片
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("Dralab"))
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("Tiglab"))

		if (data.zhuang_Card > data.Xian_Card) {
			
			Item.getChildByName("Wintage").getComponent(cc.Sprite).spriteFrame = Item.getChildByName("Dralab").getComponent(cc.Sprite).spriteFrame
		}else if (data.zhuang_Card < data.Xian_Card) {
			
			Item.getChildByName("Wintage").getComponent(cc.Sprite).spriteFrame = Item.getChildByName("Tiglab").getComponent(cc.Sprite).spriteFrame
		}else {
			
			Item.getChildByName("Wintage").getComponent(cc.Sprite).spriteFrame = Item.getChildByName("Tieab").getComponent(cc.Sprite).spriteFrame
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
	
		for (let index = 0; index < 3; index++) {
			this.m_InfoLayer.getChildByName("CardsMode1_"+(index+1)).active =false
			this.m_InfoLayer.getChildByName("CardsMode2_"+(index+1)).active =false
			
		}
		//点数显示
		this.m_InfoLayer.getChildByName("zuang_Label").getComponent(cc.Label).string = _data.zhuang_Card +""
		this.m_InfoLayer.getChildByName("xian_Label").getComponent(cc.Label).string = _data.Xian_Card+""
		
		for (let index = 0; index < _data.zhuang_CardData.length; index++) {
			if ( _data.zhuang_CardData[index] == 0) {
				continue
			}
			let  cardValue = _data.zhuang_CardData[index];
			let  cardColor = _data.zhuang_Color[index];
			this.m_InfoLayer.getChildByName("CardsMode1_"+(index+1)).active = true
			let CardsMode1 = this.m_InfoLayer.getChildByName("CardsMode1_"+(index+1)).getComponent("CardsMode_Baccarat")
			CardsMode1.fucShowData(cardValue,cardColor)
		}

		
		for (let index = 0; index < _data.Xian_CardData.length; index++) {
			if ( _data.Xian_CardData[index] == 0) {
				continue
			}
			let  cardValue = _data.Xian_CardData[index];
			let  cardColor = _data.xian_Color[index];
			this.m_InfoLayer.getChildByName("CardsMode2_"+(index+1)).active = true
			let CardsMode1 = this.m_InfoLayer.getChildByName("CardsMode2_"+(index+1)).getComponent("CardsMode_Baccarat")
			CardsMode1.fucShowData(cardValue,cardColor)
		}
	}
}