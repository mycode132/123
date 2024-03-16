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
import Compare from "./Compare";


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
	
	m_parent = null
   
	m_loagIndex = 0

	m_RecordData = []


	m_GameResult = []

	//开牌数据  
	m_data = {
		gamesnumber:1,  //局数
		Card:[],	//红黑两方牌数据
		type:[],	//红黑两方牌型
		result:-1,	//红黑输赢
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
		TipsLayer.showTips()
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
			n_data.result = n_result[2]
			this.m_RecordData.push(n_data)	
		} 
	}

	fucGameresult(data){
		//获取开奖结果
	    //data.LotteryOpen = '10,2,12,10,13,2,12,6,8,7,4,4,4,3,2,1,1,4,4,3'  //测试数据
		
		//data.LotteryOpen = '9,13,4,5,8,10,13,12,2,11,2,2,3,2,2,4,3,2,1,4'

		let result =  data.LotteryOpen.split(",");
		let GameCardsData = []
		let cardValue = []
		for (let index = 0; index < 10; index++) {
			let  element = Number(result[index])
			let  Color =  Number(result[ 10 + index])
			cardValue[index] =  element +  (Color -1)*13
		}

		//红方   黑方
		GameCardsData =cardValue //cardValue.reverse()

		let  cards = []
		let Cardresult = [0,0]
		for (let index = 0; index < 5; index++) {
			cards[index] = GameCardsData[index];	
		}
		Cardresult[0] = this.m_Compare.getType(cards)
		let  cards1 = []
		for (let index = 5; index < 10; index++) {
			cards1[index-5] = GameCardsData[index];
			
		}
		Cardresult[1] = this.m_Compare.getType(cards1)
		let n_result = this.fucGetWinTarget(Cardresult,GameCardsData)
		//红黑牌数据    牌类型  最终大小
		return [[cards,cards1],Cardresult,n_result]
	}

	//扑克比大小
	fucGetWinTarget(Cardresult,GameCardsData){
		if (Cardresult[0] == Cardresult[1]) {
			let  cards_1 = []
			for (let index = 0; index < 5; index++) {
				cards_1[index] = GameCardsData[index];	
			}
			let  cards_2 = []
			for (let index = 5; index < 10; index++) {
				cards_2[index-5] = GameCardsData[index];
			}

			//高牌
			if ( Cardresult[0]== 0) {
				return this.m_Compare.fucBankCompare(cards_1,cards_2)
			}

			//对子  两对    找出最大对子
			if(Cardresult[0] >= this.m_Compare.PaiType.YD-1  &&  Cardresult[0] <= this.m_Compare.PaiType.TZ -1){
				return this.m_Compare.fucCardRresult(cards_1,cards_2)
			}
			//顺子 同花顺 比较 乌龙(不成牌型)
			if(Cardresult[0] > this.m_Compare.PaiType.SZ -1  &&  Cardresult[0] <= this.m_Compare.PaiType.THS -1 ){
				return this.m_Compare.fucShunZiCompare(cards_1,cards_2)
			}
			//不成牌型 散牌比较
			return this.m_Compare.fucBankCompare(cards_1,cards_2)
		}
		return (Cardresult[0] > Cardresult[1] ) ? 0 : 1
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

	// WL:1,//高牌
	// YD:2,//1对
	// ED:3,//2对
	// ST:4,//三条
	// SZ:5,//顺子
	// TH:6,//同花
	// HL:7,//葫芦
	// TZ:8,//四条
	// THS:9,//同花顺
	// HJTHS:10,//皇家同花顺
	m_strtypeName = ["高牌","1对","2对","三条","顺子","同花","葫芦","四条","同花顺"]

	fucSetItemInfo(data){
		let Item = cc.instantiate(this.m_LayoutMode)
		let pair = data.gamesnumber.slice(4);

		Item.getChildByName("Ju_num").getComponent(cc.Label).string = Number(pair) +""
		//显示牌型 
		let  CardsType = Item.getChildByName("red_type")
		CardsType.getComponent(cc.Label).string =GameEngine.m_services.i18nSrv.getI18nString( this.m_strtypeName[data.type[0]])

		let CardsType1 = Item.getChildByName("black_type")
		CardsType1.getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString(this.m_strtypeName[data.type[1]])

		//大小比较结果
		let  Win_player = Item.getChildByName("Win_player")
		if (data.result == 0 ) {  //红赢
			Win_player.getComponent(cc.Sprite).spriteFrame = Item.getChildByName("img_content_1").getComponent(cc.Sprite).spriteFrame
		}else{
			Win_player.getComponent(cc.Sprite).spriteFrame = Item.getChildByName("img_content_2").getComponent(cc.Sprite).spriteFrame
		}
		GameInstInfo.getinstance().fucChangeImage(Win_player)

		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("img_content_1"))
		GameInstInfo.getinstance().fucChangeImage(Item.getChildByName("img_content_2"))

		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucShowInfo(data)
		}.bind(this),this)
		Item.active = true
		return Item
	}

	fucShowInfo(data){
		this.m_InfoLayer.active = true
		this.m_InfoLayer.opacity = 0
		//显示10张牌  与牌型

		let sort = function(cards){
			cards.sort(function(a,b){
				a = a%13;b = b%13
				if (a == 1) a = 100
				if (b == 1) b = 100
				if (a == 0) a = 50
				if (b == 0) b = 50
				return ( a  - b );
			});
			return cards
		}

		data.Card[0] = sort(data.Card[0])
		data.Card[1] = sort(data.Card[1])


		for (let index = 0; index < 5; index++) {
			let CardsModeComponent =this.m_InfoLayer.getChildByName("CardsMode"+(index+1)).getComponent("CardsMode_RedBlack")
			CardsModeComponent.showPoker(data.Card[0][index])
		}

		for (let index = 5; index < 10; index++) {
			let CardsModeComponent =this.m_InfoLayer.getChildByName("CardsMode"+(index+1)).getComponent("CardsMode_RedBlack")
			CardsModeComponent.showPoker(data.Card[1][index-5])
		}

		//显示牌型 
		let  CardsType = this.m_InfoLayer.getChildByName("card_Lab1")
		CardsType.getComponent(cc.Label).string =GameEngine.m_services.i18nSrv.getI18nString( this.m_strtypeName[data.type[0]])

		let CardsType1 = this.m_InfoLayer.getChildByName("card_Lab2")
		CardsType1.getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString(this.m_strtypeName[data.type[1]])

		this.m_InfoLayer.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
			this.m_InfoLayer.opacity = this.m_InfoLayer.opacity+2
		})),127))
	}
}