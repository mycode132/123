// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SoundMgr from "./SoundMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChipControl extends cc.Component {
	protected className: string = "底部筹码排列控制器";

	@property({type:cc.ScrollView,displayName:"筹码列表"})
	m_ChipView : cc.ScrollView = null

	@property({type:cc.Button,displayName:"左"})
	btn_left : cc.Button = null

	@property({type:cc.Button,displayName:"右"})
	btn_right : cc.Button = null

	@property({type:cc.Node,displayName:"筹码模板"})
	n_ChipMode:cc.Node = null
	//筹码列表
	n_ChipNumber = [1,10,50,100,500,1000,5000,10000]
	//
	m_ChipButArray = []
	m_SelectIndex = 0
	//是否可以点击
	m_ChipIsClick:boolean = true
	//滑动原点
	m_origin:number = 0

    start () {
		this.fucUpGameChip(100000000)  //初始化全部可以点击
		this.btn_left.node.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucMoveScrollView(0)
		}.bind(this),this)

		this.btn_right.node.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucMoveScrollView(1)
		}.bind(this),this)

		//this.m_ChipView.node.on('scrolling', this.onScrolling, this);
		this.m_ChipView.horizontal = false
		this.m_origin = this.m_ChipView.content.getPosition().x
    }

	//@param 实时刷新当前用户金币可以选择的筹码数目
	fucUpButStatus(nMoney){
		for (let index = 0; index < this.m_ChipButArray.length; index++) {
			let But_Chip = this.m_ChipButArray[index]
			this.fucSetNumber(But_Chip,this.n_ChipNumber[index],true)
			if (nMoney < this.n_ChipNumber[index]) {
				this.fucSetNumber(But_Chip,this.n_ChipNumber[index],false)
				if (this.m_SelectIndex > index && nMoney > this.n_ChipNumber[0] ) {
					this.fucSelectChip(0)
				}
			}
		}
	}

	//@param 当前用户金币可以选择的筹码数目
	fucUpGameChip(nMoney){
		let count = -1
		for (let index = 0; index < this.n_ChipNumber.length; index++) {
			if (nMoney > this.n_ChipNumber[index]) {
				count = index
			}
		}
		this.m_ChipView.content.removeAllChildren()
		this.m_ChipButArray = []
		for (let index = 0; index < this.n_ChipNumber.length; index++) {
			let ChipMode = cc.instantiate(this.n_ChipMode)
			ChipMode.active = true
			ChipMode.on(cc.Node.EventType.TOUCH_END,function(){
				if (ChipMode.getComponent(cc.Button).interactable) {
					this.fucSelectChip(index)
				}
			}.bind(this),this)

			if (count  >= index) {
				this.fucSetNumber(ChipMode,this.n_ChipNumber[index],true)
			}else{
				this.fucSetNumber(ChipMode,this.n_ChipNumber[index],false)
			}
			this.m_ChipView.content.addChild(ChipMode)
			this.m_ChipButArray.push(ChipMode)
		}
		//默认第一个
		this.fucSelectChip(0)
	}
	//@param 节点   数目  是否可以继续点击
	fucSetNumber(chipNode,_number,interactable = true){
		let chipComponent = chipNode.getComponent('ChipNode')
		chipComponent.fucSetNumber(_number)
		if (!interactable) {
			let blackSprite = chipNode.getChildByName("blackSprite")
			if (blackSprite) {
				blackSprite.active = true
			}
			chipNode.getComponent(cc.Button).interactable = false
		}else{
			let blackSprite = chipNode.getChildByName("blackSprite")
			if (blackSprite) {
				blackSprite.active = false
			}
			chipNode.getComponent(cc.Button).interactable = true
		}
	}
	//@param 下标
	fucSelectChip(_index){
		if (!this.m_ChipIsClick) {
			return
		}
		let  element = this.m_ChipButArray[_index];
		element.interactable = false
		element.runAction(cc.moveTo(0.1,cc.v2(0,25)))
		let blackSprite = element.getChildByName("blackSprite")
		
		if (this.m_SelectIndex != _index) {
			element = this.m_ChipButArray[this.m_SelectIndex];
			element.interactable = true
			element.runAction(cc.moveTo(0.1,cc.v2(0,0)))
			blackSprite = element.getChildByName("blackSprite")
			if (blackSprite) {
				if (!element.getComponent(cc.Button).interactable) {
					blackSprite.active  = true
				}else{
					blackSprite.active = false
				}
			}
			
		}
		this.m_SelectIndex = _index
		SoundMgr.palySelectChipSound()
	}

	//刷新筹码状态  开奖时不允许点击
	//@param 是否可以点击
	fucUpChipType(bCanClick){
		this.m_ChipIsClick = bCanClick
		for (let index = 0; index < this.m_ChipButArray.length; index++) {
			let item = this.m_ChipButArray[index];
			let chipComponent = item.getComponent('ChipNode')
			chipComponent.fucUpChipType(bCanClick)
		}
	}

	onScrolling() {
        let offset = this.m_ChipView.getScrollOffset();
        let maxOffset = this.m_ChipView.getMaxScrollOffset();
        let percentX = offset.x / maxOffset.x;
        let percentY = offset.y / maxOffset.y;
    }

	fucMoveScrollView(index){
		let  Offset =  this.m_ChipView.getContentPosition()
		let n_OffsetX = this.n_ChipMode.getContentSize().width + this.m_ChipView.content.getComponent(cc.Layout).spacingX
		this.m_ChipView.content.stopAllActions()
		if (index == 0) {
			if (Offset.x + n_OffsetX  >= this.m_origin) {
				this.m_ChipView.content.runAction(cc.moveTo(0.2,cc.v2(this.m_origin,-30)))
			} else {
				this.m_ChipView.content.runAction(cc.moveTo(0.2,cc.v2(Offset.x + n_OffsetX,-30)))
			}
		} else {
			let spacingX = (this.n_ChipMode.getContentSize().width + this.m_ChipView.content.getComponent(cc.Layout).spacingX) * 3   //可移动3
			if (Offset.x - n_OffsetX  >= this.m_origin -spacingX ) {
				this.m_ChipView.content.runAction(cc.moveTo(0.2,cc.v2(Offset.x - n_OffsetX,-30)))
			} else {
				this.m_ChipView.content.runAction(cc.moveTo(0.2,cc.v2(this.m_origin -spacingX,-30)))
			}
		}
	}
}