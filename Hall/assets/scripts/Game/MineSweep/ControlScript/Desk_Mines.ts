// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import GameInfo from "./GameInfo_Mines";


const {ccclass, property,menu} = cc._decorator;

@ccclass
export default class NewClass{

	m_bInit = false
	m_node = null 
	m_this = null
	m_PageIndex = 0


	m_TimeLab = null  //时间显示
	m_diamondCount = null  //钻石显示
	m_minesCount = null    //地雷数目显示
	m_TipLab   =null       //  游戏提示显示

	//倍率子节点
	m_MulptyNode = []

	//岩石块
	m_RockArray = []

	/*初始化桌子类*/
	fucInit(self) {
		this.m_this = self

		this.fucInitBg()

		this.fucInitGameLayer()

		this.fucInitPower()

		this.fucInitControlLayer()
		//设置为初始化过
		this.m_bInit = true
		//播放背景音效
		SoundMgr.PlayBgMusic()

		this.fucInitLanguage()
	}


	//国际语言适配
	fucInitLanguage(){
		this.m_this.ndBG.getChildByName("Tiplab") //广告

		let _Label = this.m_this.ControlRoot.getChildByName("HandContro").getChildByName("ScroeLayout").getChildByName("_Label")  //投注金额
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("投注金额")

		_Label = this.m_this.ControlRoot.getChildByName("TButton").getChildByName("Background").getChildByName("Label")  //投注
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("投注")
		_Label = this.m_this.ControlRoot.getChildByName("AButton").getChildByName("Background").getChildByName("Label")  //自动
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("自动")

		
		_Label = this.m_this.ControlRoot.getChildByName("HButton").getChildByName("Background").getChildByName("Label")  //手动
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("手动")

		_Label = this.m_this.ControlRoot.getChildByName("DButton").getChildByName("Background").getChildByName("Label")  //兑出奖金
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("兑出奖金")
		_Label = this.m_this.ControlRoot.getChildByName("SButton").getChildByName("Background").getChildByName("Label")  //随机打开
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("随机打开")

		_Label = this.m_this.ControlRoot.getChildByName("HandContro").getChildByName("AutoLayout").getChildByName("_Label_1") //自动局数
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("自动局数")

		_Label = this.m_this.ControlRoot.getChildByName("HandContro").getChildByName("AutoLayout").getChildByName("_Label_2") //自动止盈
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("自动止盈")

		_Label = this.m_this.ControlRoot.getChildByName("HandContro").getChildByName("AutoLayout").getChildByName("_Label_3") //自动止损
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("自动止损")


		_Label =this.m_this.ControlRoot.getChildByName("HandContro").getChildByName("AutoLayout").getChildByName("TButton").getChildByName("Background").getChildByName("Label") //自动开始
		_Label.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("自动开始")
	

	}

	//初始化背景
	fucInitBg(){
		let self = this
		this.m_TimeLab = this.m_this.ndBG.getChildByName("Timelab")
		this.m_diamondCount = this.m_this.ndBG.getChildByName("diamondlab")
		this.m_minesCount = this.m_this.ndBG.getChildByName("Mineslab")
		this.m_TipLab = this.m_this.ndBG.getChildByName("Tiplab")

		//唯一定时器用于显示时间
		GameInstInfo.getinstance().fucschedule(this.m_this,function(){
			let date = new Date()
			let n_time = "" +String(date.getHours()).padStart(2, '0')  +":"+String(date.getMinutes() ).padStart(2, '0')  
			self.m_TimeLab.getComponent(cc.Label).string = n_time
		}) 

		//控制按钮
		let  b_ControlBut = this.m_this.ndBG.getChildByName("ControlBut")
		b_ControlBut.on(cc.Node.EventType.TOUCH_END,function() {
			b_ControlBut.getChildByName("NewLayout").active = !b_ControlBut.getChildByName("NewLayout").active
		},this)

		//声音按钮
		let btn_Sound = b_ControlBut.getChildByName("NewLayout").getChildByName("MusicToggle").getComponent(cc.Toggle)
		btn_Sound.node.on('toggle', function(event){
			GameInfo.getinstance().m_MusicBopen = !btn_Sound.getComponent(cc.Toggle).isChecked
			if (GameInfo.getinstance().m_MusicBopen) {
				SoundMgr.PlayBgMusic()
			}else{
				SoundMgr.PlayStopBgMusic()
			}
		}.bind(this), this);

		//玩法说明
		let btn_play = b_ControlBut.getChildByName("NewLayout").getChildByName("PlayButton")
		btn_play.on(cc.Node.EventType.TOUCH_END,function() {
			let n_GameExplainComponent = self.m_this.node.getChildByName("nGameExplain").getComponent("GameExplain_Mines")
			n_GameExplainComponent.fucUpView()
		},this)
	}

	//初始化倍率
	fucInitPower(){
		let self = this
		let n_Gameproportion = self.m_this.downRoot.getChildByName("PowerPageView").getComponent(cc.PageView)
		//n_Gameproportion.removeAllPages()
		self.m_PageIndex =  n_Gameproportion.getCurrentPageIndex()
		//左右控制
		let n_ButL = self.m_this.downRoot.getChildByName("LButton")
		n_ButL.on(cc.Node.EventType.TOUCH_END,function() {
			if (self.m_PageIndex +1 < n_Gameproportion.getPages().length-1) {
				if (self.m_PageIndex +1 < 3) {
					self.m_PageIndex = 2
				}
				self.m_PageIndex += 1
				n_Gameproportion.setCurrentPageIndex(self.m_PageIndex)
			}
		},self)

		let n_ButR = self.m_this.downRoot.getChildByName("RButton")
		n_ButR.on(cc.Node.EventType.TOUCH_END,function() {
			if (self.m_PageIndex-1>=2 ) {
			 	self.m_PageIndex-=1
				n_Gameproportion.setCurrentPageIndex(self.m_PageIndex)
			}
		},self)
		//测试数据
		self.fucUpPower([])
	}

	//接收到赔率数据
	fucUpPower(data){
		let self = this
		let n_Gameproportion = self.m_this.downRoot.getChildByName("PowerPageView").getComponent(cc.PageView)
		n_Gameproportion.removeAllPages()
		for (let index = 0; index <30; index++) {
			let n_RockNode = cc.instantiate(self.m_this.downRoot.getChildByName("pageMode"))
			n_Gameproportion.addPage(n_RockNode)
			n_RockNode.active = true
			n_RockNode.getChildByName("nLabel").getComponent(cc.Label).string = index+".53X"
			self.m_MulptyNode[index] = n_RockNode
			GameInfo.getinstance().m_GameAutoConfig.m_Mulpty[index] = index+0.53
		}
	}

	//跳转到指定赔率
	fucSetCurrentPageIndex(_Index){
		let self = this
		let n_Gameproportion = self.m_this.downRoot.getChildByName("PowerPageView").getComponent(cc.PageView)
		if (self.m_PageIndex >= 2) {
			self.m_PageIndex = _Index
			if (self.m_PageIndex <3) {
				self.m_PageIndex = 2
			}
			n_Gameproportion.setCurrentPageIndex(self.m_PageIndex)
		}else if (self.m_PageIndex <= 2 &&  _Index <= 2) {
			self.m_PageIndex = 2
		}else{
			self.m_PageIndex = _Index
		}

		//保持当前在最前面
		if (_Index>0) {
			if (_Index == 1) {
				self.m_PageIndex += 1
			}else{
				self.m_PageIndex += 2
			}
		}
		
		n_Gameproportion.setCurrentPageIndex(self.m_PageIndex)

		let butUnSelectRgb = cc.color(5,63,40)  //未选择
		let butSelectRgb = cc.color(87,219,167)  //选择
		for (let index = 0; index < self.m_MulptyNode.length; index++) { 
			const element = self.m_MulptyNode[index];
			if (_Index == index) {
				element.color = butSelectRgb
			}else{
				element.color = butUnSelectRgb
			}
		}
	}

	//初始化控制
	fucInitControlLayer(){
		let self = this

		let butUnSelectRgb = cc.color(147,111,68)  //未选择
		let butSelectRgb = cc.color(33,115,144)  //选择

		//键盘脚本
		let KetComponent  = self.m_this.ControlRoot.parent.getChildByName("keyboard").getComponent("KeyBoard")
		
		let n_AutoLayout = self.m_this.ControlRoot.getChildByName("HandContro").getChildByName("AutoLayout")

		let MinesLayout = self.m_this.ControlRoot.getChildByName("HandContro").getChildByName("MinesLayout")
		//炸弹数目
		let CountLabel = MinesLayout.getChildByName("CountLabel")
		CountLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount
		let ScroesLayout = self.m_this.ControlRoot.getChildByName("HandContro").getChildByName("ScroeLayout")
		//投注金额
		let ScroetLabel = ScroesLayout.getChildByName("CountLabel")
		ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore

		//炸弹数目加减

		//投注金额加减

		let MinesAdd = MinesLayout.getChildByName("abbBut")
		let MinesSub = MinesLayout.getChildByName("subBut")
		let ScroesAdd = ScroesLayout.getChildByName("doubleBut")
		let ScroesSub = ScroesLayout.getChildByName("divideBut")

		//顶部钻石数与炸弹数
		let  RockCount = self.m_this.ndBG.getChildByName("diamondlab")
		let  MineslabCount = self.m_this.ndBG.getChildByName("Mineslab")

		MineslabCount.getComponent(cc.Label).string = ""+GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount
		RockCount.getComponent(cc.Label).string = ""+ (25 - GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount)

		//炸弹数控制  刷新顶部炸弹数
		MinesAdd.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			if (GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount >= 23) {
				return
			}
			
			GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount += 1
			CountLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount
			MineslabCount.getComponent(cc.Label).string = ""+GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount
			RockCount.getComponent(cc.Label).string = ""+ (25 - GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount)

			//这里需要控制显示倍率

		},self)

		MinesSub.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			if (GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount <= 1) {
				return
			}
		
			GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount -= 1
			CountLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount
			MineslabCount.getComponent(cc.Label).string = ""+GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount
			RockCount.getComponent(cc.Label).string = ""+ (25 - GameInfo.getinstance().m_GameAutoConfig.m_GameMinesCount)
			//这里需要控制显示倍率


		},self)


		//积分控制
		ScroesAdd.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			//判断自己金额是否足够
			if (self.m_this.m_GameStatus.mUserGold < GameInfo.getinstance().m_GameAutoConfig.m_DownScore *2 ) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("余额不足"))
				return
			}
		
			GameInfo.getinstance().m_GameAutoConfig.m_DownScore = GameInfo.getinstance().m_GameAutoConfig.m_DownScore*2
			ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore
		},self)

		ScroesSub.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			//判断自己金额是否足够
			if ( GameInfo.getinstance().m_GameAutoConfig.m_DownScore /2 < 1 ) {
				self.fucShowTips("Minimum bet 1 ")
				return
			}
			
			GameInfo.getinstance().m_GameAutoConfig.m_DownScore =Math.floor(GameInfo.getinstance().m_GameAutoConfig.m_DownScore/2)  //向下取整
			ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore
		},self)



		//手动

		//自动   自动开始按钮

		// 5个按钮
		let SButton = self.m_this.ControlRoot.getChildByName("SButton")
		let Abutton = self.m_this.ControlRoot.getChildByName("AButton")
		let TButton = self.m_this.ControlRoot.getChildByName("TButton")
		let DButton = self.m_this.ControlRoot.getChildByName("DButton")
		let Hbutton = self.m_this.ControlRoot.getChildByName("HButton")


		//4个金额选择
		let nHandContro =  self.m_this.ControlRoot.getChildByName("HandContro").getChildByName("ScoreBut")
		let ASelectScore1 = nHandContro.getChildByName("1But")
		let ASelectScore20 = nHandContro.getChildByName("20But")
		let ASelectScore50 = nHandContro.getChildByName("50But")
		let ASelectScore100 = nHandContro.getChildByName("100But")

		ASelectScore1.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			//判断自己金额是否足够
			if (self.m_this.m_GameStatus.mUserGold < 1) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("余额不足"))
				return
			}
			GameInfo.getinstance().m_GameAutoConfig.m_DownScore = 1
			ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore
		},self)
		ASelectScore20.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			//判断自己金额是否足够
			if (self.m_this.m_GameStatus.mUserGold < 20) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("余额不足"))
				return
			}
			GameInfo.getinstance().m_GameAutoConfig.m_DownScore = 20
			ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore
		},self)
		ASelectScore50.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			//判断自己金额是否足够
			if (self.m_this.m_GameStatus.mUserGold < 50) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("余额不足"))
				return
			}
			
			GameInfo.getinstance().m_GameAutoConfig.m_DownScore = 50
			ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore
		},self)
		ASelectScore100.on(cc.Node.EventType.TOUCH_END,function() {
			if (GameInfo.getinstance().m_GameIsStart){
				return
			}
			//判断自己金额是否足够
			if (self.m_this.m_GameStatus.mUserGold < 100) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("余额不足"))
				return
			}
			
			GameInfo.getinstance().m_GameAutoConfig.m_DownScore = 100
			ScroetLabel.getComponent(cc.Label).string ="" + GameInfo.getinstance().m_GameAutoConfig.m_DownScore
		},self)


		//随机开奖
		SButton.on(cc.Node.EventType.TOUCH_END,function() {
			
		},self)

		//投注
		TButton.on(cc.Node.EventType.TOUCH_END,function() {

			GameInfo.getinstance().m_GameIsStart = true
			TButton.active = false
			//发送投注消息
		},self)

		//兑出
		DButton.on(cc.Node.EventType.TOUCH_END,function() {
			//发送兑出消息
			
		},self)

		//手动 
		Hbutton.on(cc.Node.EventType.TOUCH_END,function() {
			n_AutoLayout.active = false

			TButton.active = true

			Hbutton.getChildByName("Background").color = butSelectRgb
			Abutton.getChildByName("Background").color = butUnSelectRgb
		},self)

		//自动开始按钮
		let butAutoGame   = n_AutoLayout.getChildByName("TButton").getComponent(cc.Button)
		//自动 伴随  随机开奖
		Abutton.on(cc.Node.EventType.TOUCH_END,function() {
			n_AutoLayout.active = true
			TButton.active = false
			Abutton.getChildByName("Background").color = butSelectRgb
			Hbutton.getChildByName("Background").color = butUnSelectRgb

			self.fucCheckIsAuto(butAutoGame,butSelectRgb,butUnSelectRgb) //初始化自动开始

		},self)



		//自动模式下三个输入框
		let GameCount = n_AutoLayout.getChildByName("GameCount").getComponent(cc.Button)
		GameCount.node.on(cc.Node.EventType.TOUCH_END, function () {
				//键盘事件回调
			let strLabel =GameCount.node.getChildByName("LABEL_").getComponent(cc.Label).string
			KetComponent.fucShowNode(function(inputText,_node){
				GameInfo.getinstance().m_GameAutoConfig.m_inningCount = Number(inputText)
				self.fucCheckIsAuto(butAutoGame,butSelectRgb,butUnSelectRgb)
				_node.getChildByName("LABEL_").getComponent(cc.Label).string = inputText
			},self,GameCount.node,strLabel)

		}, this);
       
	

		let GameWin   = n_AutoLayout.getChildByName("GameWin").getComponent(cc.Button)
		GameWin.node.on(cc.Node.EventType.TOUCH_END, function () {
			let strLabel =GameWin.node.getChildByName("LABEL_").getComponent(cc.Label).string
			KetComponent.fucShowNode(function(inputText,_node){
				//止盈判断
				GameInfo.getinstance().m_GameAutoConfig.m_WinCount = Number(inputText)
				self.fucCheckIsAuto(butAutoGame,butSelectRgb,butUnSelectRgb)
				_node.getChildByName("LABEL_").getComponent(cc.Label).string = inputText
			},self,GameWin.node,strLabel)
		}, this);
       

		let GameLoss  = n_AutoLayout.getChildByName("GameLoss").getComponent(cc.Button)
		GameLoss.node.on(cc.Node.EventType.TOUCH_END, function () {
			let strLabel =GameLoss.node.getChildByName("LABEL_").getComponent(cc.Label).string
			KetComponent.fucShowNode(function(inputText,_node){
				//止损判断
				GameInfo.getinstance().m_GameAutoConfig.m_LossCount = Number(inputText)
				self.fucCheckIsAuto(butAutoGame,butSelectRgb,butUnSelectRgb)
				_node.getChildByName("LABEL_").getComponent(cc.Label).string = inputText
			},self,GameLoss.node,strLabel)
		}, this);

		butAutoGame.node.on(cc.Node.EventType.TOUCH_END,function() {
			if (!GameInfo.getinstance().m_GameAutoConfig.m_inningCount) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("局数错误"))
				return
			}
			
			if (!GameInfo.getinstance().m_GameAutoConfig.m_WinCount) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("止盈错误"))
				return
			}

			if (!GameInfo.getinstance().m_GameAutoConfig.m_LossCount) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("止损错误"))
				return
			}


			//设置随机开奖
			GameInfo.getinstance().m_GameRandomDraw = true
			//自动开始
			GameInfo.getinstance().m_GameAutoConfig.m_GameIsAutoStart= true



			//发送自动开始数据

		},self)
	}

	//判断是否可以自动开始
	fucCheckIsAuto(but,selectc,unselectc){
		if (GameInfo.getinstance().m_GameAutoConfig.m_inningCount > 0 &&
			GameInfo.getinstance().m_GameAutoConfig.m_WinCount > 0 &&
			GameInfo.getinstance().m_GameAutoConfig.m_LossCount> 0 ) {
				but.interactable = true 
				but.node.getChildByName("Background").color = selectc
		}else{
			but.interactable = false 
			but.node.getChildByName("Background").color = unselectc
		}
	}

	//初始化游戏
	fucInitGameLayer(){
		let self = this
		let n_GameLayer = this.m_this.GameLayer.getChildByName("Game")
		n_GameLayer.removeAllChildren()
		self.m_RockArray = []
		for (let index = 0; index < 25; index++) {
			let n_RockNode = cc.instantiate(self.m_this.GameLayer.getChildByName("ClubMode"))
			n_GameLayer.addChild(n_RockNode)
			n_RockNode.active = true
			let Component = n_RockNode.getComponent("Rock")
			Component.fucSetID(index)  //设置ID
			self.m_RockArray.push(Component)

			GameInfo.getinstance().m_GameAutoConfig.GameMap[index] = 0  //未被翻开
			
			//发送相应请求数据
			n_RockNode.on(cc.Node.EventType.TOUCH_END,function() {
				if (!Component.m_bOpen  &&  GameInfo.getinstance().m_GameIsStart ) {
					self.fucRockClickEvent(index)   
				}
			},self)
		}
	}

	//岩石块点击  发送请求  接收到相应数据
	fucRockClickEvent(index){
		let self = this
	
		let Component = self.m_RockArray[index]
		let aa = 1
		if (index == 24 ) {
			aa = 2
		}

		//先停止  再继续开



		//参数控制显示类型
		Component.showPoker(aa,0.2,false,function(){
			GameInfo.getinstance().m_GameAutoConfig.GameMap[index] = 1  //被翻开
			GameInfo.getinstance().m_GameAutoConfig.m_OpenCount += 1
			if (index == 24) {
				self.fucRestore()

				self.m_this.node.runAction(cc.sequence(cc.delayTime(5.0),cc.callFunc(()=>{
					self.fucRandomOpen() //随机开奖
				})))
				return
			}
			self.m_this.node.runAction(cc.sequence(cc.delayTime(2.0),cc.callFunc(()=>{
				self.fucRandomOpen() //随机开奖
			})))

			self.fucSetCurrentPageIndex(GameInfo.getinstance().m_GameAutoConfig.m_OpenCount -1  )

		})
	}

	//随机开奖
	fucRandomOpen(){

		let  pos = []
		for (let index = 0; index < GameInfo.getinstance().m_GameAutoConfig.GameMap.length; index++) {
			const element = GameInfo.getinstance().m_GameAutoConfig.GameMap[index]
			if (!element) {
				pos.push(index)
			}
		}

		let index =pos[Math.floor(Math.random()*pos.length)] 

		if (index != undefined ) {
			this.fucRockClickEvent(index)
		}
		
	}

	//游戏结束 岩石块恢复
	fucRestore(){
		let self = this
		let n_allopen= true
		for (let index = 0; index < self.m_RockArray.length; index++) {
			let Component = self.m_RockArray[index];
		
			if (!Component.m_bOpen) {
				n_allopen = false
				//没有翻开的全部点开
				let aa = Math.floor(Math.random()*2)+1    //需要服务端数据
				Component.showPoker(aa,0.02,true,function(){
					let b_Allopen = true
					for (let a = 0; a  < self.m_RockArray.length; a ++) {
						let nComponent = self.m_RockArray[a];
						if (!nComponent.m_bOpen){
							b_Allopen = false
							break
						}
					}
					if (b_Allopen) {
						self.m_this.node.runAction(cc.sequence(cc.delayTime(2.0),cc.callFunc(()=>{
							for (let z = 0; z < self.m_RockArray.length; z++) {
								let nComponent = self.m_RockArray[z];
								if (nComponent.m_bOpen) {
									nComponent.fucRestHide()
								}
							}
						})))
					}
				})
			}

			//全部翻开
			if (index == self.m_RockArray.length-1  && n_allopen) {
				self.m_this.node.runAction(cc.sequence(cc.delayTime(2.0),cc.callFunc(()=>{
					for (let z = 0; z < self.m_RockArray.length; z++) {
						let nComponent = self.m_RockArray[z];
						if (nComponent.m_bOpen) {
							nComponent.fucRestHide()
						}
					}
				})))
			}
			GameInfo.getinstance().m_GameAutoConfig.GameMap[index] = 0  
		}
		GameInfo.getinstance().m_GameAutoConfig.m_OpenCount = 0

		GameInfo.getinstance().m_GameIsStart = false
		//倍率滑动条
		let n_Gameproportion = self.m_this.downRoot.getChildByName("PowerPageView").getComponent(cc.PageView)
		n_Gameproportion.setCurrentPageIndex(2)
		this.fucSetCurrentPageIndex(-1)
	}

	//控制游戏显示


	//

	//提示
	fucShowTips(_str,_time = 1.0){
		let str = this.m_this.GameTipsNode.getChildByName("strLabel")
		str.getComponent(cc.Label).string = _str
		this.m_this.GameTipsNode.stopAllActions()
		this.m_this.GameTipsNode.active =true
		this.m_this.GameTipsNode.runAction(cc.sequence(cc.show(),cc.delayTime(_time),cc.hide()))
	}



	//刷新游戏显示
	fucupGameTips(str){

		

	}




	//刷新自己余额
	fucUpMoney(){



	}


	//刷新倍率
	fucUpMultiply(data){
		//顶部列表变化

		//兑奖按钮显示变化


	}

	//自动模式刷新剩余局数
	fucUpGameCountNumber(data){
		//根据游戏进行 判断自动开始的游戏还剩余多少局

	}

	//

}
