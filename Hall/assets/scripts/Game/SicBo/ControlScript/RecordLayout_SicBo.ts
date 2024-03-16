// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ScrollviewLayout from "../../../Public/ControlScript/ScrollviewLayout";



const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";

	//骰子模版
	@property({type:cc.Node,displayName:"骰子模版"})
    m_TouziMode: cc.Node = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.Node,displayName:"标记模版"})
    m_SpriteMode: cc.Node = null;
	
	@property({type:cc.ScrollView,displayName:"第一视窗"})
    m_ScrollView_1: cc.ScrollView = null;
	m_TongjiItem = [] //Item

	@property({type:cc.ScrollView,displayName:"第二视窗"})
    m_ScrollView: cc.ScrollView = null;
	m_ItemRecord = [] //Item

	@property({type:cc.ScrollView,displayName:"第3视窗"})
    m_ScrollView3: cc.ScrollView = null;
	m_ItemRecord3 = [] //Item

	@property({type:cc.Node,displayName:"数据显示层"})
    m_LabLayout: cc.Node = null;

	m_RecordData = []  

	m_CountRecord = [0,0,0,0]  //  大小  单双

	m_GameResult = []  //游戏结果

	//结果   几个  单双
	m_Result ={
		mValue:0,  //和值
		Type:1,		//单双
		nSize:0,    //大小
		nData:[]    //原始数据
	}

	m_ScrollviewLayout_1 = null
	m_ScrollviewLayout_2 = null
	m_ScrollviewLayout_3 = null

	m_enemyPool = null
	onLoad() {
		this.m_enemyPool = new cc.NodePool();
		let initCount = 1000;
		for (let i = 0; i < initCount; ++i) {
			let enemy = cc.instantiate(this.m_SpriteMode); 
			this.m_enemyPool.put(enemy); 
		}

		this.m_ScrollviewLayout_1 = new ScrollviewLayout()
		this.m_ScrollviewLayout_2 = new ScrollviewLayout()
		this.m_ScrollviewLayout_3 = new ScrollviewLayout()
	}

	createSize() {
		let enemy = null;
		if (this.m_enemyPool.size() > 0) { 
			enemy = this.m_enemyPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.m_SpriteMode);
		}
		return enemy
	}

    start () {
		this.initChangeImage()
    }

	//多国语言适配Image
	initChangeImage(){
		let btnInning = this.node.getChildByName('image_Node');   //大小和
		for (let index = 0; index < btnInning.children.length; index++) {
			let element = btnInning.children[index];
			GameInstInfo.getinstance().fucChangeImage(element)
		}
		
		btnInning = this.node.getChildByName('lab_Layout');   // 单 双
		for (let index = 6; index < 8; index++) {
			let element = btnInning.getChildByName("sheet_"+index)
			GameInstInfo.getinstance().fucChangeImage(element)
		}
	}

	//单双
	fucSingleDouble(Value){
		let n_Result = JSON.parse(JSON.stringify(this.m_Result))
		n_Result.mValue = Number(Value[0]) + Number(Value[1]) +  Number(Value[2])
		n_Result.Type = n_Result.mValue%2 == 0 ? 1 : 2  //1双2单

		n_Result.nSize = n_Result.mValue >10 ? 2 : 1  //1小2大
		n_Result.nData = Value
		return n_Result
	}

	fucInitData(Data){
		
		let  val = Data.reverse(); 
		this.m_GameResult =JSON.parse(JSON.stringify(val))
		this.m_RecordData = []
	
		this.m_CountRecord = [0,0,0,0] 
		for (let index = 0; index < this.m_GameResult.length; index++) {
			let element =  this.m_GameResult[index].LotteryOpen.split(",");
			this.m_RecordData.push(this.fucSingleDouble(element))
		}
		
		//第一视图
		let self = this
		let n_Result =this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout_1.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem_1.bind(this),true,35)

		//第二视图
		n_Result = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return  self.fucBigEve(a ,b)
		})  
		this.m_ScrollviewLayout_2.initView(this.m_LayoutMode,this.m_ScrollView_1,n_Result,this.fucupItem_2.bind(this),true,35)

		//第3视图
		this.m_ScrollviewLayout_3.initView(this.m_TouziMode,this.m_ScrollView3,this.m_RecordData,this.fucGetItem3.bind(this),true,15)


		this.fucUpLabe()  
	}

	fucWiterData(nCardData){
		let LotteryOpen =  nCardData.LotteryOpen.split(",");
		this.m_RecordData.push(this.fucSingleDouble(LotteryOpen))
		
		this.m_CountRecord = [0,0,0,0] 

		let self = this
		//1
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		
		this.m_ScrollviewLayout_1.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_1)

		//2
		n_Result = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucBigEve(a ,b)
		})  
		
		this.m_ScrollviewLayout_2.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_2)

		//3
		this.m_ScrollviewLayout_3.fucupdatainfo(this.m_RecordData)
	
		this.fucUpLabe()  
	}

	fucupItem_1(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_enemyPool.put(element); 
			}
			if (data[deskindex] && data[deskindex].mValue ) {
				let recordSprite = this.fucGetItem(data[deskindex],0)
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	fucupItem_2(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_enemyPool.put(element); 
			}
			if (data[deskindex] && data[deskindex].mValue) {
				let recordSprite = this.fucGetItem(data[deskindex],1)
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
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


	fucGetItem3(recordSprite, nValue){
		const path = 'Game/SicBo/resources/loadRes/img/game/Trendchart'
		for (let index = 0; index < nValue.nData.length; index++) {
			const element =  Number(nValue.nData[index])
			let  dice = recordSprite.getChildByName("dice_"+(index+1))
			
			let Imagename = `img_dice_s_${element}`
			manager().resourceMgr.loadPlistImage(dice,path,Imagename);
		}

		//点数
		let  dice = recordSprite.getChildByName("count")
		let Imagename = `num_show_${nValue.mValue}`
		manager().resourceMgr.loadPlistImage(dice,path,Imagename);

		//大小
		let  bigSp = recordSprite.getChildByName("img_info_1")
		if (nValue.nSize == 2) {
			GameInstInfo.getinstance().fucChangeImageName(bigSp,"img_info_1")
		}else{
			GameInstInfo.getinstance().fucChangeImageName(bigSp,"img_info_2")
		}

		//单双
		let  EveSp = recordSprite.getChildByName("img_info_3")
		if (nValue.Type == 1) { 
			GameInstInfo.getinstance().fucChangeImageName(EveSp,"img_info_4")
		}else{
			GameInstInfo.getinstance().fucChangeImageName(EveSp,"img_info_3")
		}
	}


	// type：1  大小   0：单双
	fucGetItem(nValue,nType){
		let recordSprite = this.createSize()// cc.instantiate(this.m_SpriteMode)
		const path = 'Game/SicBo/resources/loadRes/img/game/Trendchart'
		let Imagename = ""
		if (nType == 1) {
			if (nValue.nSize == 2) {
				Imagename = `img_content_1`
			}else{
				Imagename = `img_content_2`
			}	
		}else {
			if (nValue.Type   == 1) {
				Imagename = `img_content_4`
			}else{
				Imagename = `img_content_3`
			}
		}
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	fucUpLabe(){
		this.m_CountRecord = [0,0,0,0]
		let element = this.m_RecordData[0];
		for (let index = 0; index < this.m_RecordData.length; index++) {
			element = this.m_RecordData[index];

			if (element.nSize == 2) {
				this.m_CountRecord[0] += 1
			}else{
				this.m_CountRecord[1] += 1
			}

			if (element.Type == 1) {
				this.m_CountRecord[3] += 1
			}else{
				this.m_CountRecord[2] += 1
			}
		}

		this.node.getChildByName("lab_Layout").getChildByName("lab_red_3").getComponent(cc.Label).string = this.m_CountRecord[0]+ "";
		this.node.getChildByName("lab_Layout").getChildByName("lab_red_4").getComponent(cc.Label).string = this.m_CountRecord[1]+ "";
		this.node.getChildByName("lab_Layout").getChildByName("lab_red_5").getComponent(cc.Label).string = this.m_CountRecord[2]+ "";
		this.node.getChildByName("lab_Layout").getChildByName("lab_red_6").getComponent(cc.Label).string = this.m_CountRecord[3]+ "";
	}

	//单双
	fucExactlySame(DraValue,TigValue){
		if (DraValue.Type   != TigValue.Type ) {
			return false
		}
		return true
	}

	//大小
	fucBigEve(DraValue,TigValue){
		if (DraValue.nSize   != TigValue.nSize ) {
			return false
		}
		return true
	}

}