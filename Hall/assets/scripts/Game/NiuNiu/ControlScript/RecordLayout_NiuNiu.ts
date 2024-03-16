// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ScrollviewLayout from "../../../Public/ControlScript/ScrollviewLayout";
import Compare from "./Compare_NiuNiu";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";


	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView2: cc.ScrollView = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView3: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"红黑标记"})
    Red_Sprite: cc.Node = null;


	//牌型算法
	m_Compare:Compare = new Compare(); 

	m_ItemRecord = []
	m_ItemRecord2 = []
	m_ItemRecord3 = []

	m_RecordData = []
	m_RecordData2 = []
	m_RecordData3 = []

	m_CountRecord = [0,0]    


	m_ScrollviewLayout_1 = null
	m_ScrollviewLayout_2 = null
	m_ScrollviewLayout_3 = null

	m_RedPool = null
	
	onLoad(){
		this.m_ScrollviewLayout_1 = new ScrollviewLayout()
		this.m_ScrollviewLayout_2 = new ScrollviewLayout()
		this.m_ScrollviewLayout_3 = new ScrollviewLayout()
	
		this.m_RedPool = new cc.NodePool();
		let initCount = 100;
		
		for (let i = 0; i < initCount; ++i) {
			let  enemy = cc.instantiate(this.Red_Sprite)
			this.m_RedPool.put(enemy);
		}
	}


	createRedPool() {
		let enemy = null;
		if (this.m_RedPool.size() > 0) { 
			enemy = this.m_RedPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.Red_Sprite)
		}
		return enemy
	}


    start () {
		this.initChangeImage()
    }

	//多国语言适配Image
	initChangeImage(){
		for (let index = 0; index < 6; index++) { 
			let btnInning = this.node.getChildByName('lab_Layout').getChildByName('card00'+(index+1)); 
			GameInstInfo.getinstance().fucChangeImage(btnInning)
		}

		let btnInning = this.node.getChildByName('lab_Layout').getChildByName('mb_tx_content_xian1'); 
		GameInstInfo.getinstance().fucChangeImage(btnInning)

		btnInning = this.node.getChildByName('lab_Layout').getChildByName('mb_tx_content_xian2'); 
		GameInstInfo.getinstance().fucChangeImage(btnInning)

		btnInning = this.node.getChildByName('lab_Layout').getChildByName('mb_tx_content_xian3'); 
		GameInstInfo.getinstance().fucChangeImage(btnInning)
	}


	fucGameresult(data){
		//获取开奖结果
		let result =  data.LotteryOpen.split(",");
		let GameCardsData = []
		let cardValue = []
		for (let index = 0; index < 20; index++) {
			let  element = Number(result[index])
			let  Color =  Number(result[ 20 + index])
			cardValue[index] =  element +  (Color -1)*13
		}
		GameCardsData =cardValue//cardValue.reverse()

		let n_result = this.fucGetWinTarget(GameCardsData)
		return n_result
	}

	//扑克比大小
	fucGetWinTarget(GameCardsData){
		let n_result = []
		
		let  cards_1 = []
		for (let index = 0; index < 5; index++) {
			cards_1[index] =GameCardsData[index];	
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

		n_result[0] = this.m_Compare.compareCards(cards_1,cards_2)  == 0 ? 0 : 1
		n_result[1] = this.m_Compare.compareCards(cards_1,cards_3) == 0 ? 0 : 1
		n_result[2] = this.m_Compare.compareCards(cards_1,cards_4)== 0 ? 0 : 1
		return n_result
	}
	
	//初始化
	fucWiterData(CardData){
		let nCardData = CardData.reverse()  
		for (let index = 0; index < nCardData.length; index++) {
			let nData = nCardData[index];
			this.m_RecordData.push(this.fucGameresult(nData)[0])
			this.m_RecordData2.push(this.fucGameresult(nData)[1])
			this.m_RecordData3.push(this.fucGameresult(nData)[2])
		}
		this.fucUpLabe()
		
		//第一视图
		let self = this
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		},2)  
		this.m_ScrollviewLayout_1.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem_1.bind(this),true,20)

		//第二视图
		let n_Result2 = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_RecordData2,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		},2)  
		this.m_ScrollviewLayout_2.initView(this.m_LayoutMode,this.m_ScrollView2,n_Result2,this.fucupItem_1.bind(this),true,20)

		//第3视图
		let n_Result3 = this.m_ScrollviewLayout_3.fucDataTongjiToArray(this.m_RecordData3,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		},2)  
		this.m_ScrollviewLayout_3.initView(this.m_LayoutMode,this.m_ScrollView3,n_Result3,this.fucupItem_1.bind(this),true,20)
	}

	//追加结果
	fucAddResult(nCardData){
		this.m_RecordData.push(this.fucGameresult(nCardData)[0])
		this.m_RecordData2.push(this.fucGameresult(nCardData)[1])
		this.m_RecordData3.push(this.fucGameresult(nCardData)[2])

		
		this.fucUpLabe()
		
		let self = this
		//1
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		},2)  
	
		this.m_ScrollviewLayout_1.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_1)

		//2
		let n_Result2 = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_RecordData2,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		},2)  
	
		this.m_ScrollviewLayout_2.fucupdatainfo(n_Result2)
		this.fucblink(this.m_ScrollviewLayout_2)

		//3
		let n_Result3 = this.m_ScrollviewLayout_3.fucDataTongjiToArray(this.m_RecordData3,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		},2)  
	
		this.m_ScrollviewLayout_3.fucupdatainfo(n_Result3)
		this.fucblink(this.m_ScrollviewLayout_3)
	}

	fucupItem_1(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			//回收
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_RedPool.put(element); 
			}
			
			if (data[deskindex] >= 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}
	
	fucGetItem(n_Value){
		let recordSprite =this.createRedPool()
		const path = 'Public/resources/coin/Chip_List';
		let Imagename = ``
		if (n_Value == 0) {
			Imagename= `img_content_1`
		}else  {
			Imagename= `img_content_2`
		}
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	fucblink(_ScrollviewLayout){
		let n_Result = _ScrollviewLayout.m_endItemPos
		let Item = _ScrollviewLayout.itemsArr[n_Result[0]]
		if (Item) {
			let itemNode = Item.getChildByName("desk"+n_Result[1])
			if (itemNode) {
				itemNode.stopAllActions()
				itemNode.runAction(cc.blink(3,5))
			}
		}
	}

	fucUpLabe(){
		this.m_CountRecord = [0,0,0,0,0,0] 
		
		for (let z = 0; z < this.m_RecordData.length; z++) {
			let  n_data = this.m_RecordData[z];  // 0  0   0
			if (n_data == 0 ) {
				this.m_CountRecord[0] +=1
			}else{
				this.m_CountRecord[1] +=1
			}
		}
	
		for (let z = 0; z < this.m_RecordData2.length; z++) {
			let  n_data = this.m_RecordData2[z];  // 0  0   0
			if (n_data == 0 ) {
				this.m_CountRecord[2] +=1
			}else{
				this.m_CountRecord[3] +=1
			}
		}
	
		for (let z = 0; z < this.m_RecordData3.length; z++) {
			let  n_data = this.m_RecordData3[z];  // 0  0   0
			if (n_data == 0 ) {
				this.m_CountRecord[4] +=1
			}else{
				this.m_CountRecord[5] +=1
			}
		}

		for (let index = 0; index < 6; index++) {
			let labstr = this.node.getChildByName("lab_Layout").getChildByName("lab_red_"+(index+1))
			labstr.getComponent(cc.Label).string  = ""+ this.m_CountRecord[index]
		}
	}

	update (dt) {
		if (this.m_ScrollviewLayout_1) {
			this.m_ScrollviewLayout_1.update(dt)
		}

		if (this.m_ScrollviewLayout_2) {
			this.m_ScrollviewLayout_2.update(dt)
		}
		if (this.m_ScrollviewLayout_3) {
			this.m_ScrollviewLayout_3.update(dt)
		}
    }

	//  dra :1   tig:2 
	fucExactlySame(DraValue,TigValue){
		if (DraValue != TigValue) {
			return false
		}
		return true
	}
}