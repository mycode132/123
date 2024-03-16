// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import TipsLayer from "../../../Public/ControlScript/TipsLayer";

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

	@property({type:[cc.SpriteFrame],displayName:"3个元素"})
    m_SpriteMode:cc.SpriteFrame[] = []

	m_loagIndex = 0
	m_Data = []
	m_BettingInfo = {
		m_DownMoney :0,
		m_Time:"",
		BetNum:"",
		m_win:0,
		State_Winning:0,
		betting_issuseNo:""
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

		let n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("sheet_31")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)
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
			info.betting_issuseNo =element.betting_issuseNo
			info.BetNum= element.BetNum
			info.State_Winning= Number(element.State_Winning)
			info.m_win= Number(element.Winning_amount)
			this.m_Data.push(info)
		}

		this.node.getChildByName("TipsLab").active = data.length?false:true
		if (this.node.getChildByName("TipsLab").active) {
			this.node.getChildByName("TipsLab").getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("暂无数据")
		}

		this.fucAddItem()
		this.m_ScrollView.scrollToTop()
		TipsLayer.showCloseTips()
	}

	onEnable(){
		TipsLayer.showTips()
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
		this.node.getChildByName("sheet_15").stopAllActions()
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.3,1.0))
		this.m_ScrollView.content.removeAllChildren()	
	}

	fucAddItem(){
		for (let index = this.m_loagIndex; index < (this.m_loagIndex+10); index++) {
			if (this.m_Data[index]) {
				let  n_data = this.m_Data[index]
				let  item = this.fucSetItemInfo(n_data)
				this.m_ScrollView.content.addChild(item)
			}
		}
		
		if (this.m_loagIndex + 10 < this.m_Data.length+10) {
			this.m_loagIndex += 10
		}else{
			this.m_loagIndex = this.m_Data.length
		}
		if (this.m_Data.length > 8) {
			this.m_ScrollView.content.setContentSize(cc.size(this.m_LayoutMode.getContentSize().width,this.m_LayoutMode.getContentSize().height*this.m_loagIndex))
		}
	}

	fucSetItemInfo(data){
		let Item = cc.instantiate(this.m_LayoutMode)
		//在这设定数据   待定
		let lab_downMoney = Item.getChildByName("lab_downMoney")
		lab_downMoney.getComponent(cc.Label).string = ""+ GameInstInfo.getinstance().fucScroeTransition(data.m_DownMoney)

		let lab_Time = Item.getChildByName("lab_Time")
		lab_Time.getComponent(cc.Label).string = ""+ this.fucTime(new Date(data.m_Time*1000))  //毫秒

		let lab_issuseNo = Item.getChildByName("lab_vis")
		lab_issuseNo.getComponent(cc.Label).string = ""+data.betting_issuseNo

		let lab_winmoney= Item.getChildByName("lab_winmoney")
		lab_winmoney.getComponent(cc.Label).string ="+ " +(data.m_win?( GameInstInfo.getinstance().fucScroeTransition(data.m_win)):0) 


		let betting_number = ["Player","Tie","Banker"]
		let  result = Item.getChildByName("jieguo")
		for (let index = 0; index < betting_number.length; index++) {
			const element = betting_number[index];
			if (data.BetNum ==  element) {
				result.getComponent(cc.Sprite).spriteFrame = this.m_SpriteMode[index]
			}
		}
		
		GameInstInfo.getinstance().fucChangeImage(result)
		Item.getChildByName("name").getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("百家乐")  

		if (data.State_Winning == 1){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("已中奖")  
		}else if(data.State_Winning == 2){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("未中奖")  
		}else if(data.State_Winning == 3){
			Item.getChildByName("lab_win").getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("待开奖")  
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