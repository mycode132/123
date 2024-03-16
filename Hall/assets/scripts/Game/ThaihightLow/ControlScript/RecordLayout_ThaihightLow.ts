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

    @property({type:cc.Label,displayName:"大"})
    hu_label: cc.Label = null;

	@property({type:cc.Label,displayName:"小"})
    long_label: cc.Label = null;

	@property({type:cc.Label,displayName:"和"})
    he_label: cc.Label = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"第二视窗"})
    m_ScrollView: cc.ScrollView = null;
	m_ItemRecord = [] //Item
	
	@property({type:cc.Node,displayName:"大小和标记"})
    GameRes_Sprite: cc.Node = null;

	@property({type:cc.Node,displayName:"数目统计标记"})
    Tongji_Sprite: cc.Node = null;
	
	@property({type:cc.ScrollView,displayName:"第一视窗"})
    m_ScrollView_1: cc.ScrollView = null;
	m_TongjiItem = [] //Item

	@property({type:cc.Node,displayName:"数据显示层"})
    m_LabLayout: cc.Node = null;

	m_RecordData = []  //大小和
	m_SDData = []  //单双结果

	m_CountRecord = [0,0,0]  

	m_GameResult = []  //游戏结果

	//结果   几个  单双
	m_Result ={
		mValue:0,
		Type:1,
	}

	m_ScrollviewLayout_1 = null
	m_ScrollviewLayout_2 = null

	m_TongjiPool = null
	m_SizePllo = null
	onLoad(){
		this.m_TongjiPool = new cc.NodePool();
		this.m_SizePllo = new cc.NodePool();
		let initCount = 1000;
		
		for (let i = 0; i < initCount; ++i) {
			let  enemy = cc.instantiate(this.Tongji_Sprite)
			this.m_TongjiPool.put(enemy);
			enemy = cc.instantiate(this.GameRes_Sprite)
			this.m_SizePllo.put(enemy);
		}

		this.m_ScrollviewLayout_1 = new ScrollviewLayout()
		this.m_ScrollviewLayout_2 = new ScrollviewLayout()
	}


	createTongji() {
		let enemy = null;
		if (this.m_TongjiPool.size() > 0) { 
			enemy = this.m_TongjiPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.Tongji_Sprite);
		}
		return enemy
	}

	createSize() {
		let enemy = null;
		if (this.m_SizePllo.size() > 0) { 
			enemy = this.m_SizePllo.get();
		} 
		else { 
			enemy = cc.instantiate(this.GameRes_Sprite);
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

	//  小 :1   大:2   和:3
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
	fucSingleDouble(Value){
		let n_Result = JSON.parse(JSON.stringify(this.m_Result))
		n_Result.mValue = Number(Value) 
		n_Result.Type = Value%2==0?1:2  //1双2单
		return n_Result
	}

	fucInitData(nData){
		let  val = nData.reverse(); 
		this.m_GameResult =JSON.parse(JSON.stringify(val))
		this.m_RecordData = []
		this.m_SDData= []
		
		for (let index = 0; index < this.m_GameResult.length; index++) {
			const element = this.m_GameResult[index].LotteryOpen;
			this.m_RecordData.push(this.fuccompareCard(element))
			this.m_SDData.push(this.fucSingleDouble(element))
		}

		this.fucCalculateData()
		//第一视图
		let self = this
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,3,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
	
		this.m_ScrollviewLayout_1.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem_1.bind(this),true,20)
		//第二视图
		n_Result = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_SDData,null,function(a,b) {
			return  a.Type == b.Type
		})  
		
		this.m_ScrollviewLayout_2.initView(this.m_LayoutMode,this.m_ScrollView_1,n_Result,this.fucupItem_2.bind(this),true,20)
	}

	fucWiterData(nData){
		const element = nData.LotteryOpen;
		this.m_RecordData.push(this.fuccompareCard(element))

		this.m_SDData.push(this.fucSingleDouble(element))
		//第一视图
		let self = this
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,3,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		
		this.m_ScrollviewLayout_1.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_1)

		//第二视图
		n_Result = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_SDData,null,function(a,b) {
			return  a.Type == b.Type
		}) 
	
		this.m_ScrollviewLayout_2.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_2)
		//查找倒数第六个

		this.fucCalculateData()
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

	fucupItem_1(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			for (let index = 0; index < itemNode.children.length; index++) {
				let element = itemNode.children[index];
				this.m_SizePllo.put(element); 
			}
			if (data[deskindex] && data[deskindex] > 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
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
				this.m_TongjiPool.put(element); 
			}
			
			if (data &&  data[deskindex] && data[deskindex].mValue >= 0) {
				let recordSprite = this.fucCloneItem(data[deskindex].mValue)
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	update (dt) {
		if (this.m_ScrollviewLayout_1) {
			this.m_ScrollviewLayout_1.update(dt)
		}

		if (this.m_ScrollviewLayout_2) {
			this.m_ScrollviewLayout_2.update(dt)
		}
    }

	fucGetItem(nValue){
		//小 :1   大:2   和:3
		let recordSprite = this.createSize()//cc.instantiate(this.GameRes_Sprite)
		const path = 'Game/ColorDish/resources/loadRes/img/game/Sedie';
		let Imagename = `img_content_${nValue}`
		if (nValue ==2 ) {
			Imagename = `img_content_1`
		}else if (nValue == 1) {
			Imagename = `img_content_2`
		}else{
			Imagename = `img_content_3`
		}
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	// 
	fucExactlySame(DraValue,TigValue){
		if (DraValue == 3  || TigValue == 3) {
			return true
		}
		if (DraValue != TigValue) {
			return false
		}
		return true
	}

	fucCloneItem(nValue){
		let recordSprite =this.createTongji()
		let path = 'Game/ColorDish/resources/loadRes/img/game/Sedie';
		let Imagename = `img_content_1_${nValue}`
		if (nValue%2 == 0) {
			Imagename= `img_content_2_${nValue}`
		}
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	fucCalculateData(){
		let layoutMode= this.node.getChildByName("lab_Layout")
		let n_data = JSON.parse(JSON.stringify(this.m_SDData))
		let nShowData = [0,0,0,0,0]  //0-4红
		for (let index = 0; index < n_data.length; index++) {
			let element = n_data[index];
			nShowData[element.mValue] +=1
		}

		let lab = layoutMode.getChildByName("lab_red_0")
		lab.getComponent(cc.Label).string = "" +nShowData[0]

		lab = layoutMode.getChildByName("lab_red_1")
		lab.getComponent(cc.Label).string = "" +nShowData[1]

		lab = layoutMode.getChildByName("lab_red_2")
		lab.getComponent(cc.Label).string = "" +nShowData[2]

		lab = layoutMode.getChildByName("lab_red_3")
		lab.getComponent(cc.Label).string = "" +nShowData[3]

		lab = layoutMode.getChildByName("lab_red_4")
		lab.getComponent(cc.Label).string = "" +nShowData[4]

		//单双
		lab = layoutMode.getChildByName("lab_red_5")
		lab.getComponent(cc.Label).string = "" +(nShowData[0] + nShowData[1]+nShowData[3])

		lab = layoutMode.getChildByName("lab_red_6")
		lab.getComponent(cc.Label).string = "" +(nShowData[2] + nShowData[4])

		this.m_CountRecord = [0,0,0] 
		for (let index = 0; index < this.m_RecordData.length; index++) {
			this.m_CountRecord[this.m_RecordData[index]-1] +=1
		}

		this.hu_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[1]
		this.long_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[0]
		this.he_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[2]
	}
}