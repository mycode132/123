// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine, { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import TipsLayer from "../../../Public/ControlScript/TipsLayer";
import Compare from "./Compare_NiuNiu";

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

	//牌型算法
	m_Compare:Compare = new Compare(); 
	
	m_loagIndex = 0

	m_RecordData = []

	m_GameResult = []

	//开牌数据  
	m_data = {
		gamesnumber:1,  //局数
		Card:[],	//牌数据
		type:[],	//牌型
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

	onEnable(){
		TipsLayer.showTips(5.0)
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

			let n_result =  this.fucGameresult(this.m_GameResult[index])
			n_data.Card=n_result[0]
			n_data.type =n_result[1]
			this.m_RecordData.push(n_data)	
		} 
	}

	fucGameresult(data){
		//data.LotteryOpen = '9,13,4,5,8,10,13,12,2,11,2,2,3,2,2,4,3,2,1,4'
		let result =  data.LotteryOpen.split(",");
		let GameCardsData = []
		let cardValue = []
		for (let index = 0; index < 20; index++) {
			let  element = Number(result[index])
			let  Color =  Number(result[ 20 + index])
			cardValue[index] =  element +  (Color -1)*13
		}
		//转化后的手牌
		GameCardsData =cardValue //cardValue.reverse()

		let n_result = this.fucGetWinTarget(GameCardsData)
		return [GameCardsData,n_result]
	}

	//扑克比大小
	fucGetWinTarget(GameCardsData){
		let n_result = []
		
		let  cards_1 = []
		for (let index = 0; index < 5; index++) {
			cards_1[index] = GameCardsData[index];	
		}
		let  cards_2 = []
		for (let index = 5; index < 10; index++) {
			cards_2[index-5] = GameCardsData[index];
		}

		let  cards_3 = []
		for (let index = 10; index < 15; index++) {
			cards_3[index-10] = GameCardsData[index];
		}
	
		let  cards_4 = []
		for (let index = 15; index < 20; index++) {
			cards_4[index-15] = GameCardsData[index];
		}

		n_result[0] = this.m_Compare.getHandsType(cards_1).handsType
		n_result[1] = this.m_Compare.getHandsType(cards_2).handsType
		n_result[2] = this.m_Compare.getHandsType(cards_3).handsType
		n_result[3] = this.m_Compare.getHandsType(cards_4).handsType

		return n_result
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
		//手动排序
		data.sort(function(a,b){
			return ( Number(b.IssueNo)  - Number(a.IssueNo) );
		});

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

	//牛1 -  五小牛    6国语言翻译
	m_strtypeName = [
					["无牛","牛1","牛2","牛3","牛4","牛5","牛6","牛7","牛8","牛9","牛牛","4花牛","5花牛","炸弹"],
					["cowless","Cow1","Cow2","Cow3","Cow4","Cow5","Cow6","Cow7","Cow8","Cow9","Niuniu","4 Hua Niu","5 Hua Niu","Bombs"],
					["cowless","Cow1","Cow2","Cow3","Cow4","Cow5","Cow6","Cow7","Cow8","Cow9","Niuniu","4 Hua Niu","5 Hua Niu","Bombs"],
					["cowless","Cow1","Cow2","Cow3","Cow4","Cow5","Cow6","Cow7","Cow8","Cow9","Niuniu","4 Hua Niu","5 Hua Niu","Bombs"],
					["cowless","Cow1","Cow2","Cow3","Cow4","Cow5","Cow6","Cow7","Cow8","Cow9","Niuniu","4 Hua Niu","5 Hua Niu","Bombs"],
					["cowless","Cow1","Cow2","Cow3","Cow4","Cow5","Cow6","Cow7","Cow8","Cow9","Niuniu","4 Hua Niu","5 Hua Niu","Bombs"]
					]

	fucSetItemInfo(data){
		let Item = cc.instantiate(this.m_LayoutMode)
		let pair = data.gamesnumber.slice(4);

		Item.getChildByName("Ju_num").getComponent(cc.Label).string = Number(pair) +""

		//显示点数
		Item.getChildByName("ZhuangLabel").getComponent(cc.Label).string = `(${this.m_strtypeName[GameEngine.m_services.i18nSrv.getI18nSetting()][data.type[0]]})`
		Item.getChildByName("XainLabel1").getComponent(cc.Label).string  = `(${this.m_strtypeName[GameEngine.m_services.i18nSrv.getI18nSetting()][data.type[1]]})`
		Item.getChildByName("XainLabel2").getComponent(cc.Label).string  = `(${this.m_strtypeName[GameEngine.m_services.i18nSrv.getI18nSetting()][data.type[2]]})`
		Item.getChildByName("XainLabel3").getComponent(cc.Label).string  = `(${this.m_strtypeName[GameEngine.m_services.i18nSrv.getI18nSetting()][data.type[3]]})`

		//修改语言图片  修改RGB
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("mb_tx_table_zhuang"))
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("mb_tx_table_xian1"))
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("mb_tx_table_xian2"))
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("mb_tx_table_xian3"))

		let n_result = this.fucPuKersort(data.Card)
		if (n_result[0] == 0) {
			Item.getChildByName("mb_tx_table_xian1").color = cc.Color.RED
		}

		if (n_result[1] == 0) {
			Item.getChildByName("mb_tx_table_xian2").color = cc.Color.RED
		}

		if (n_result[2] == 0) {
			Item.getChildByName("mb_tx_table_xian3").color = cc.Color.RED
		}

		let self = this
		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			self.fucShowInfo(data,n_result)
		}.bind(this),this)
		Item.active = true
		return Item
	}

	fucUpinfocolor(n_result){
		let self = this
		self.m_InfoLayer.getChildByName("mb_tx_content_xian1").color = cc.Color.GREEN
		self.m_InfoLayer.getChildByName("mb_tx_content_xian2").color = cc.Color.GREEN
		self.m_InfoLayer.getChildByName("mb_tx_content_xian3").color = cc.Color.GREEN
		//0表示庄赢
		if (n_result[0]== 0) {
			self.m_InfoLayer.getChildByName("mb_tx_content_xian1").color = cc.Color.RED
		}

		if (n_result[1]== 0) {
			self.m_InfoLayer.getChildByName("mb_tx_content_xian2").color = cc.Color.RED
		}

		if (n_result[2]== 0) {
			self.m_InfoLayer.getChildByName("mb_tx_content_xian3").color = cc.Color.RED
		}
	}

	fucShowInfo(data,result){
		this.m_InfoLayer.active = true
		this.m_InfoLayer.opacity = 0
		
		//修改语言图片
		GameInstInfo.getinstance().fucChangeImage(this.m_InfoLayer.getChildByName("mb_tx_puke_zhuang"))
		GameInstInfo.getinstance().fucChangeImage(this.m_InfoLayer.getChildByName("mb_tx_content_xian1"))
		GameInstInfo.getinstance().fucChangeImage(this.m_InfoLayer.getChildByName("mb_tx_content_xian2"))
		GameInstInfo.getinstance().fucChangeImage(this.m_InfoLayer.getChildByName("mb_tx_content_xian3"))

		for (let index = 0; index < 20; index++) {
			let CardsModeComponent =this.m_InfoLayer.getChildByName("CardsMode"+(index+1)).getComponent("CardsMode_NiuNiu")
			CardsModeComponent.showPoker1(data.Card[index])
		}

		this.m_InfoLayer.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
			this.m_InfoLayer.opacity = this.m_InfoLayer.opacity+2 <= 255 ? this.m_InfoLayer.opacity+2 :255
		})),127))

		this.fucUpinfocolor(result)
	}

	//扑克牌序
	fucPuKersort(data){
		let  cards = []
		for (let index = 0; index < 5; index++) {
			cards[index] = data[index];	
		}
		let  cards1 = []
		for (let index = 5; index < 10; index++) {
			cards1[index-5] = data[index];
		}
		let  cards2 = []
		for (let index = 10; index < 15; index++) {
			cards2[index-10] = data[index];
		}
		let  cards3 = []
		for (let index = 15; index < 20; index++) {
			cards3[index-15] = data[index];
		}
	

		//按牛排序
		cards = this.m_Compare.fucgetNiuCard(cards)
		cards1 = this.m_Compare.fucgetNiuCard(cards1)
		cards2 = this.m_Compare.fucgetNiuCard(cards2)
		cards3 = this.m_Compare.fucgetNiuCard(cards3)

		for (let index = 0; index < cards.length; index++) {
			data[index] = cards[index];
		}
		for (let index = 5; index < 10; index++) {
			data[index] = cards1[index-5];
		}
		for (let index = 10; index < 15; index++) {
			data[index] = cards2[index-10];
		}
		for (let index = 15; index < 20; index++) {
			data[index] = cards3[index-15];
		}

		let  cardsType = []
		cardsType[0] = this.m_Compare.compareCards(cards,cards1)
		cardsType[1] = this.m_Compare.compareCards(cards,cards2)
		cardsType[2] = this.m_Compare.compareCards(cards,cards3)

		return cardsType
	}
}