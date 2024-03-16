// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";



const {ccclass, property} = cc._decorator;

@ccclass
export default class BettingRecord extends cc.Component {

	protected className: string = "用户自己下注记录";

   
	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;


	@property({type:cc.Button,displayName:"关闭"})
    m_ButClose: cc.Button = null;

	@property({type:[cc.SpriteFrame],displayName:"0-4 大小  单双"})
    m_SpriteMode:cc.SpriteFrame[] = []

	m_loagIndex = 0
	m_Data = []
	m_BettingInfo = {
		m_DownMoney :0,
		m_Time:"",
		BetNum:"",
		m_win:0,
		State_Winning:0
	}
    onLoad () {
		let self= this
		this.node.getChildByName("sheet_15").setScale(0)
		this.m_ButClose.node.off(cc.Node.EventType.TOUCH_END)
		this.m_ButClose.node.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)
		this.node.off(cc.Node.EventType.TOUCH_END)
		this.node.on(cc.Node.EventType.TOUCH_END,function(){
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)
		this.m_ScrollView.content.removeAllChildren()
		this.m_Data = []
		for (let index = 0; index < 200; index++) {
			let info = JSON.parse(JSON.stringify(this.m_BettingInfo))
			info.m_Rank = index+1
			this.m_Data.push(info)
		}
		this.m_ScrollView.node.on('scrolling', this.onScrolling, this);
	}

	fucUpdata(data){
		this.m_Data = []
		this.m_loagIndex = 0
		for (let index = 0; index < data.length; index++) {
			let element = data[index];
			let info = JSON.parse(JSON.stringify(this.m_BettingInfo))
			info.m_DownMoney= Number(element.Bet_amount)
			info.m_Time= element.Bet_time
			info.BetNum= element.BetNum
			info.State_Winning= Number(element.State_Winning)
			info.m_win= Number(element.Winning_amount)
			this.m_Data.push(info)
		}
	}

    start () {

    }

	onScrolling() {
        let offset = this.m_ScrollView.getScrollOffset();
        let maxOffset = this.m_ScrollView.getMaxScrollOffset();
        let percentY = offset.y / maxOffset.y;
		//动态加载
		if (percentY >= 0.95  && this.m_loagIndex < this.m_Data.length) {
			this.fucAddItem()
		}
    }

	fucUpView(){
		this.node.active = true
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.2,1.0))
		this.m_ScrollView.content.removeAllChildren()
		this.fucAddItem()
		this.m_ScrollView.scrollToTop()
	}

	fucAddItem(){
		for (let index = this.m_loagIndex; index < (this.m_loagIndex+10); index++) {
			if (this.m_Data[index]) {
				let  n_data = this.m_Data[index]
				let  item = this.fucSetItemInfo(n_data)
				this.m_ScrollView.content.addChild(item)
			}
		}
		this.m_loagIndex += 10
		if (this.m_Data.length > 8) {
			this.m_ScrollView.content.setContentSize(cc.size(this.m_LayoutMode.getContentSize().width,this.m_LayoutMode.getContentSize().height*this.m_loagIndex))
		}
	}

	fucSetItemInfo(data){
		let Item = cc.instantiate(this.m_LayoutMode)
		//在这设定数据   待定
		let lab_downMoney = Item.getChildByName("lab_downMoney")
		lab_downMoney.getComponent(cc.Label).string = ""+(GameInstInfo.getinstance().fucScroeTransition(data.m_DownMoney))

		let lab_Time = Item.getChildByName("lab_Time")
		lab_Time.getComponent(cc.Label).string = ""+ this.fucTime(new Date(data.m_Time*1000))  //毫秒

		let lab_winmoney= Item.getChildByName("lab_winmoney")
		lab_winmoney.getComponent(cc.Label).string = "+ " +(data.m_win?(data.m_win/100):0) 

		let betting_number = ["0" , "even" ,  "odd"  ,  "4" , "1" , "small"  ,  "big"   , "3"]
		betting_number = ["0" , "1" ,  "2"  ,  "3" , "big" , "small"  ,  "odd"   , "even"]

		//big small odd even  0 1 3 4
		let  result = Item.getChildByName("jieguo")
		for (let index = 0; index < betting_number.length; index++) {
			const element = betting_number[index];
			if (data.BetNum ==  element) {
				result.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[index]
				if (index > 3) {
					GameInstInfo.getinstance().fucChangeImage(result)
				}
			}
			
		}

		if (data.State_Winning == 1){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = "已中奖"
		}else if(data.State_Winning == 2){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = "未中奖"
		}else if(data.State_Winning == 3){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = "待开奖"
		}else if(data.State_Winning == 4){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = "已撤单"
		}

		Item.active = true
		return Item
	}

	fucTime(date){
		let year = date.getFullYear();
		let month = date.getMonth() + 1; // 注意：月份是从0开始的，所以需要+1
		let day = date.getDate();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();
		let dateTimeString = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
		return dateTimeString
	}
}
