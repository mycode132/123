import PHWL from "../../../control/engines/GameEngine";
import gameConfig from "../../../control/Game/configs/gameConfig";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import GameInfo from "../ControlScript/GameInfo";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("场景/大厅")
export default class hall extends cc.Component {
	@property({type: cc.Node, displayName: '背景节点'})
	ndBG: cc.Node = null;
	@property({type: cc.Node, displayName: '上根节点'})
	upRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '桌面倍数'})
	m_DeskScore: cc.Node = null;

	@property({type: cc.Node, displayName: '下根节点'})
	downRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '自动投注设置'})
	AutodownRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '游戏动画控制'})
	AnimtionNode: cc.Node = null;

	@property({type: cc.Label, displayName: '游戏局数'})
    m_GamePlayLab: cc.Label = null;

	@property({type:cc.Node,displayName:"游戏提示节点"})
	m_GameTipsNode :cc.Node = null

	@property({type: cc.Sprite, displayName: '游戏状态'})
    m_GameStatusLab: cc.Sprite = null;
	@property({type:[cc.SpriteFrame],displayName:"投注状态"})
	m_SpriteFrame:cc.SpriteFrame[] = []

	@property({type: cc.Node, displayName: '断线重连遮罩'})
	m_Disconnec : cc.Node = null

	m_GameSetNode :cc.Node = null
	@property({type:cc.Prefab,displayName:"设置"})
	m_settingprefab :cc.Prefab = null

	@property({type:cc.Prefab,displayName:"弹窗"})
	m_Editboxprefab :cc.Prefab = null

	//所有下注节点
	m_AllDonwButNode = []

	//动画控制
	m_AnimationComponent = null
	//历史记录
	m_RecordsComponent = null
	//投注历史
	m_RecordVerComponent = null
	//投注记录
	m_BettingRecordComponent= null
	//游戏说明
	m_GameExplainComponent =null
	//4个下注卖出按钮
	m_BetButArray = []
	m_BetSellArray = []

	//自动投注
	m_AutoDownChipComponent = null
	//投注排行
	m_DownChipRankComponent = null

	m_GameStatus = {
		//局数
		inningCount: 20235555,
		//是否投注
		isBet: true,
		//游戏当前状态
		gamestatus : 1, //  1：投注   2：结束
		//是否显示筹码
		gamechipshow:true,
		//是否结算
		gameisfinish:false,
		//自己携带金币
		mUserGold:10000,
		//游戏id
		mlottery_code:131,

		//游戏时间
		gameDownChipTime:60,
	}

	protected onLoad(): void {
		//设置mlottery_code
		GameInstInfo.getinstance().m_GameData.findIndex((elem: any) => {
			if (elem[0] == "code") this.m_GameStatus.mlottery_code = Number(elem[1])
		});
	}

	protected start(): void {
		this.initDownRoot()
		this.initGame()
		this.initUpRoot()
		this.initComponent()
		//播放背景音效
		SoundMgr.PlayBgMusic()
		this.initChangeImage()
		

		//let  self = this
		// Http.request("lotteryopen",{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"},function(dtat){

		// 	let JSonData = JSON.parse(dtat)
		// 	self.m_RecordsComponent.fucWiterData(JSonData.Data.item)
		// },IHttpMethod.POST,false)

		//向上冒泡事件  父节点接收
		this.node.parent.off("CocosMesg")
		this.node.parent.on('CocosMesg', function ( event ) {
			this.fucCoCosgetMsg(event.getUserData())
		}.bind(this));
		

		
		if (!cc.sys.isNative) {

			this.node.runAction(cc.sequence(cc.delayTime(5),cc.callFunc(()=>{
				this.fucServerMessige()
			}) ))
			//this.fucServerMessige()
		}


		if (GameInstInfo.getinstance().m_Disconnect) {
			this.m_Disconnec.active = true
		}

	}

	fucCoCosgetMsg(e){
		if (!e.data.data) {
			return
		}
		let self = this
	
		if (GameInstInfo.getinstance().m_Disconnect) {
			GameInstInfo.getinstance().m_Disconnect = false
			
			
			if (this.m_Disconnec) {
				this.m_Disconnec.active = false
			}
			
			
		}

	

		if (e.data.type == "userbalance") {
			//这是获取用户余额
			self.m_GameStatus.mUserGold = Number(e.data.data.Data.BackData)/100
			let m_Money = self.upRoot.getChildByName('ndTime').getChildByName("lMoney")

			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				m_Money.getComponent(cc.Label).string = self.m_GameStatus.mUserGold  +"tr"
			}else{
				m_Money.getComponent(cc.Label).string = GameInstInfo.getinstance().toDecimal(self.m_GameStatus.mUserGold)  +"tr"
			}
		}
		else if(e.data.type =="addbetting"){
			if (e.data.data.status == "1") {
				self.fucShowTips(e.data.data.msg,1.5)
				//减去相应的金额
				this.m_GameStatus.mUserGold -= GameInfo.getinstance().m_GameData.m_Basicscore  * GameInfo.getinstance().m_GameData.m_multiple
				let m_Money = self.upRoot.getChildByName('ndTime').getChildByName("lMoney")
				if (GameInstInfo.getinstance().m_curr == "VND" ) {
					m_Money.getComponent(cc.Label).string = self.m_GameStatus.mUserGold  +"tr"
				}else{
					m_Money.getComponent(cc.Label).string = GameInstInfo.getinstance().toDecimal(self.m_GameStatus.mUserGold)  +"tr"
				}
			}
			if (e.data.data.status == "0") {
				self.fucShowTips("下注失败...",1.5)
			}
		}
		else if(e.data.type =="getrebate"){
			//这是获取赔率
			GameInstInfo.getinstance().m_GameRate = e.data.data.Data.item
		}
		else if(e.data.type =="getbetrecord"){
			//这是获取投注记录
			self.node.getChildByName("nBettingRecord").active = true
			self.m_BettingRecordComponent.fucUpdata(e.data.data.Data1.item)
			self.m_BettingRecordComponent.fucUpView()
		}
			//这是获取开奖记录  只能调用一次
		else if(e.data.type == "lotteryopen1"){
			//清理桌面
			self.fucClear()  
			//开局获取 设置时间
			let n_Servertime  = e.data.data.Data.Servertime
			let Item_data = e.data.data.Data.item[0]
			let  max =  0
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				let pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			self.m_GameStatus.inningCount = max +1 
			//游戏局数
			self.m_GamePlayLab.getComponent(cc.Label).string = ""+self.m_GameStatus.inningCount
			self.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDownTime(n_Servertime,Item_data.UTC_TIME)  //获取倒计时
			//如果时间少于10秒   加入断线重连效果
			if (self.m_GameStatus.gameDownChipTime < gameConfig.Bet_Reward_Time) {
				//模拟玩家下注
			}
			/**
				@func 可设定间隔秒数、重复次数、延迟秒数的定时器; 如果回调刷新，将不会重复调度它，只会更新时间间隔参数
				@param callback 必备参数，回调接口
				@param interval 可选参数，时间间隔，以秒为单位，默认为0
				@param repeat 可选参数，重复次数，会被执行(repeat+1)次，默认为macro.REPEAT_FOREVER表示无限重复
				@param delay 可选参数，延迟时间，以秒为单位，默认为0表示立即调用
			*/
			// self.unschedule(self.fucCountdown)
			// self.schedule(self.fucCountdown, 1.0, cc.macro.REPEAT_FOREVER, 1)
			//GameInstInfo.getinstance().fucstopschedule(self)
			GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
			self.m_RecordsComponent.fucWiterData(e.data.data.Data.item)
		}else if(e.data.type == "lotteryopen2"){   //确认下注时调用
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			self.m_GameStatus.inningCount = Number(pair) +1 

			let n_Data={
					lottery_code: self.m_GameStatus.mlottery_code,
				// betting_number:bettData.betting_number,
				// betting_money: bettData.betting_money,
					betting_count: 1,
					play_detail_code: 1,
					betting_issuseNo:Number(Item_data.IssueNo)+1
			}
			window.parent.postMessage({type: "addbetting", param: { method: "post", url: 'addbetting' ,data:n_Data } }, '*');
			
		}else if(e.data.type == "lotteryopen3"){
				let n_Servertime  = e.data.data.Data.Servertime
				let Item_data = e.data.data.Data.item[0]
				//游戏局数
				let pair = Item_data.IssueNo.slice(4)
				self.m_GameStatus.inningCount = Number(pair) +1 
				self.m_GamePlayLab.getComponent(cc.Label).string = ""+self.m_GameStatus.inningCount
				self.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDownTime(n_Servertime,Item_data.UTC_TIME)  //获取倒计时
				

				//追加开奖结果  //断线重连不要再追加结果
				if (GameInstInfo.getinstance().m_GameIsReconnection ) {
					GameInstInfo.getinstance().m_GameIsReconnection = false
				}else{
					self.m_RecordsComponent.fucWiterData(Item_data)
				}
				//self.m_RecordsComponent.fucWiterData(e.data.data.Data.item)
		}
		else if(e.data.type == "lotteryopen5"){
			let Item_data = e.data.data.Data.item
			self.node.getChildByName("nRecordRank").active = true
			self.m_RecordVerComponent.fucUpView(Item_data)
		}else if(e.data.type == "lotteryopen6"){
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			self.m_GameStatus.inningCount = Number(pair) +1 

			GameInstInfo.getinstance().m_GameSettlement = true
		}
	}

	//游戏消息处理
	fucServerMessige(){
		window.parent.postMessage({type: "getrebate", param: { method: "post", url: 'getrebate' ,data:{LotteryType: "cd"} } }, '*');
		window.parent.postMessage({type: "userbalance", param: { method: "post", url: 'userbalance' ,data:{} } }, '*');
	}
	
	//多国语言适配Image
	initChangeImage(){
		let btnInning = this.upRoot.getChildByName('btnInning');  //左上角局数图片
		GameInstInfo.getinstance().fucChangeImage(btnInning)
		//动画替换
		//GameInstInfo.getinstance().fucChangeStartAnimation(this.m_AnimationComponent.Startspine)
	}

	initGame() {
		
		if (!cc.sys.isNative) {
			//this.schedule(this.fucCountdown, 1.0, cc.macro.REPEAT_FOREVER, 1)  //测试单机启动接口
			//启动游戏接口
			//window.parent.postMessage({type: "lotteryopen1", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } }, '*');
		}else{
			this.schedule(this.fucCountdown, 1.0, cc.macro.REPEAT_FOREVER, 1)
		}
		this.fucCheckMenoy()
	}

	initUpRoot() {
		let  self = this
		let but_version = this.upRoot.getChildByName("btnInning")
		but_version.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			if (!cc.sys.isNative) {
				window.parent.postMessage({type: "lotteryopen5", param: { method: "post", url: 'lotteryopen' ,data:{type:"game",LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } }, '*');
			}

			self.node.getChildByName("nRecordRank").active = true
			self.m_RecordVerComponent.fucUpView([])
		}.bind(this),this)

		let but_gameset = this.upRoot.getChildByName("btnSet").getChildByName("icon")
		but_gameset.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.m_GameSetNode.active = true
		}.bind(this),this)

		this.m_GameSetNode =  cc.instantiate(this.m_settingprefab)
		//this.m_GameSetNode.setPosition(cc.v2(-76,-260))
		this.upRoot.getChildByName("btnSet").addChild(this.m_GameSetNode)
		this.m_GameSetNode.active = false
		this.m_GameSetNode.getComponent("gameSet").fucSetParent(this)
		this.m_GameSetNode.getComponent("gameSet").fucSteCallback(function(index){
			if (index == 2) {
				this.m_GameStatus.gamechipshow = !this.m_GameStatus.gamechipshow
				//关闭动画显示	
			}

			else if (index == 3) {
				if (!this.m_GameExplainComponent) {
					let self = this
					cc.resources.load(GameInstInfo.getinstance().getSubgameByGameID(GameInstInfo.getinstance().m_SelectGameID).pathOfGameExplainPrefab, cc.Prefab, (err, prefab) => {
						if (err) {
							console.error('加载预制体失败:', err);
							return;
						}
						if( !( prefab instanceof cc.Prefab ) ) { cc.log( 'Prefab error' ); return; } 
						let instance = cc.instantiate(prefab);
						self.node.addChild(instance);
						self.m_GameExplainComponent =  instance.getComponent("GameExplain_Baccarat")
						self.m_GameExplainComponent.fucUpView()
						
					});   
				}else{
					this.node.getChildByName("nGameExplain").active = true
					this.m_GameExplainComponent.fucUpView()
				}
			}

			else if (index == 4) {
				if (!cc.sys.isNative) {
					window.parent.postMessage({type: "getbetrecord", param: { method: "post", url: 'getbetrecord' ,data:{lottery_code:this.m_GameStatus.mlottery_code,LotteryType: "cd"} } }, '*');
				}
			}
			//
			else if (index == 5) {
			}
			//
			else if (index == 6) {
			}
		}.bind(this))

		let btnBack = this.upRoot.getChildByName('btnBack');
		btnBack.on(cc.Node.EventType.TOUCH_END,function() {
			window.parent.history.back()
			//cc.game.end()
		},this)
		//游戏局数
		this.m_GamePlayLab.getComponent(cc.Label).string = ""+this.m_GameStatus.inningCount
	}

	//下注界面
	initDownRoot() {
		// 四个下注   
		this.m_BetButArray = []
		this.m_BetSellArray= []
		for (let index = 0; index < 4; index++) {
			let but = this.downRoot.getChildByName("DownNode").getChildByName("but_Down_"+(index+1))
			but.on(cc.Node.EventType.TOUCH_END,function(){

			},this)
			but.getComponent(cc.Button).interactable = false
			but.getChildByName("Label").getComponent(cc.Label).string = ""
			but.getChildByName("mb_tx_bet_next").active = false
			this.m_BetButArray.push(but)
		}

		for (let index = 0; index < 4; index++) {
			let but = this.downRoot.getChildByName("DownNode").getChildByName("but_Sell_"+(index+1))
			but.on(cc.Node.EventType.TOUCH_END,function(){
				but.active = false
				but.stopAllActions()

				SoundMgr.palyButSound()

			},this)
			but.getComponent(cc.Button).interactable = false
			but.getChildByName("Label").getComponent(cc.Label).string = ""
			this.m_BetSellArray.push(but)
		}
		//下注按钮
		//多功能按钮
		let mb_btn_betbg_amount = this.downRoot.getChildByName("mb_btn_betbg_amount")
		this.fucBindBut(mb_btn_betbg_amount,GameInfo.getinstance().m_Basicscore,"amount")

		let mb_btn_betbg_odd = this.downRoot.getChildByName("mb_btn_betbg_odd")
		this.fucBindBut(mb_btn_betbg_odd,GameInfo.getinstance().m_multiple,"odd")
		//btn_addbetting
		let btn_addbetting = this.downRoot.getChildByName("btn_addbetting")
		btn_addbetting.on(cc.Node.EventType.TOUCH_END,function(event){
			//投注按钮
			this.fucBetClick()
		},this)

		let btn_autobet = btn_addbetting.getChildByName("btn_autobet")
		btn_autobet.on(cc.Node.EventType.TOUCH_END,function(event){
			//更多设置
			this.m_AutoDownChipComponent.node.active = true
			this.m_AutoDownChipComponent.fucShow()

			SoundMgr.palyButSound()

		},this)
		//一个开牌记录
	} 

	fucBetClick(){
		//获取  底分  倍数
		let mb_btn_betbg_amount = this.downRoot.getChildByName("mb_btn_betbg_amount")
		let  str_amount = mb_btn_betbg_amount.getChildByName("str_Label").getComponent(cc.Label).string

		let mb_btn_betbg_odd = this.downRoot.getChildByName("mb_btn_betbg_odd")
		let  str_odd = mb_btn_betbg_odd.getChildByName("str_Label").getComponent(cc.Label).string
		let n_Tempbut = null
		for (let index = 0; index < this.m_BetButArray.length; index++) {
			let but = this.m_BetButArray[index]
			if (but.getChildByName("Label").getComponent(cc.Label).string  == "") {
				n_Tempbut = but
				break
			}
		}

		//下注是否已满
		if (!n_Tempbut) {
			this.fucShowTips("下注已满！",1.5)
			return;
		}
		this.m_AnimationComponent.fucPlayChip()  //筹码动画
		n_Tempbut.getChildByName("Label").getComponent(cc.Label).string  = `${str_amount}/${str_odd}`
		n_Tempbut.getChildByName("mb_tx_bet_next").active = true


		SoundMgr.palyCrashChip()


		//发送下注请求
	}

	//绑定多功能按钮  
	fucBindBut(node,lab,Type){
		let self  = this
		let  btn_reduce = node.getChildByName("btn_reduce")
		let  btn_add = node.getChildByName("btn_add")
		let  str_Label = node.getChildByName("str_Label")
		function toNumber(num) {
			num = num.replace(/,/g, "");
			num = num.replace("k", "");
			num = num.replace(".00X", "");
			return Number(num)
		}

		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		if (Type == "amount") {
			str_Label.getComponent(cc.Label).string =  toThousands(lab[0])+"k"
			GameInfo.getinstance().m_GameData.m_Basicscore = (lab[0])
		}else{
			str_Label.getComponent(cc.Label).string = toThousands(lab[0])+".00X"
			GameInfo.getinstance().m_GameData.m_multiple = (lab[0])
		}

		btn_reduce.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			let Num = str_Label.getComponent(cc.Label).string
			const index1 = lab.indexOf(toNumber(Num), 0); 
			if (index1 > -1  && index1 > 1) {
				if (Type == "amount") {
					GameInfo.getinstance().m_GameData.m_Basicscore = toNumber(Num)
					str_Label.getComponent(cc.Label).string = toThousands(lab[index1-1])+"k"
				}else{
					GameInfo.getinstance().m_GameData.m_multiple = toNumber(Num)
					str_Label.getComponent(cc.Label).string = toThousands(lab[index1-1])+".00X"
				}
			}
		},this)

		btn_add.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			let Num = str_Label.getComponent(cc.Label).string
			const index1 = lab.indexOf(toNumber(Num), 0); 
			if (index1 > -1  && index1 < lab.length -1) {
				if (Type == "amount") {
					GameInfo.getinstance().m_GameData.m_Basicscore = toNumber(Num)
					str_Label.getComponent(cc.Label).string = toThousands(lab[index1+1])+"k"
				}else{
					GameInfo.getinstance().m_GameData.m_multiple = toNumber(Num)
					str_Label.getComponent(cc.Label).string = toThousands(lab[index1+1])+".00X"
				}
			}
		},this)

		node.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			let Num = str_Label.getComponent(cc.Label).string
			let EditBoxLayout = cc.instantiate(this.m_Editboxprefab)
			self.node.addChild(EditBoxLayout)
			let Compoent = EditBoxLayout.getComponent("EditBoxLayout")
			Compoent.fucShowType(Num,Type,lab)
			Compoent.fucCallBcak(function(str){
				str_Label.getComponent(cc.Label).string = str
			})
		},this)
	}

	intTemplate(){

		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		

		let mb_btn_betbg_amount = this.downRoot.getChildByName("mb_btn_betbg_amount")
		mb_btn_betbg_amount.getChildByName("str_Label").getComponent(cc.Label).string = toThousands(GameInfo.getinstance().m_GameData.m_Basicscore)+"k"
	
		let mb_btn_betbg_odd = this.downRoot.getChildByName("mb_btn_betbg_odd")
		mb_btn_betbg_odd.getChildByName("str_Label").getComponent(cc.Label).string = toThousands(GameInfo.getinstance().m_GameData.m_multiple)+".00X"
	}

	//初始化脚本
	initComponent(){
		let self = this
		//初始化开将记录
		this.m_RecordsComponent =  this.downRoot.getChildByName("nScrollView").getComponent("RecordLayout_Crash")
		this.m_RecordsComponent.fucInit([])
		// //初始化历史记录
		this.m_RecordVerComponent=  this.node.getChildByName("nRecordRank").getComponent("RecordRank_Crash")
		this.m_RecordVerComponent.m_parent = this

		// this.m_BettingRecordComponent =  this.node.getChildByName("nBettingRecord").getComponent("BettingRecord_Dish")
		// this.m_GameExplainComponent =  this.node.getChildByName("nGameExplain").getComponent("GameExplain_Dish")

		this.m_DownChipRankComponent = this.node.getChildByName("BetListLayout").getComponent("Bettinglist")
		this.m_DownChipRankComponent.fucGameStart()

		//自动投注节点
		this.m_AutoDownChipComponent = this.AutodownRoot.getComponent("AutoDownChip")
		this.m_AutoDownChipComponent.node.active = false
		this.m_AutoDownChipComponent.fucSetParent(this)

		this.m_AnimationComponent  = this.node.getChildByName("AnimtionNode").getComponent("AnimationControl_Crash")
		this.m_AnimationComponent.fucInit()
		this.m_AnimationComponent.fucSetCallBack(function(){
			//
			self.m_AnimationComponent.fucPlayStart()
			self.fucGameEnd()
			self.m_DownChipRankComponent.fucGameStart()


			SoundMgr.palyCrashBoom()
		})

		this.m_AnimationComponent.fucSetCallback(function(){

			SoundMgr.palyCrashSound(1+Math.round(Math.random()*8))  //这个音效需要提前

			self.m_AnimationComponent.fucPlayAction()
			//开始游戏
			self.fucCountdown()
			self.m_DownChipRankComponent.fucGameOver()
		})

		this.m_AnimationComponent.fucStopDeskScore(function(){
			self.fucStopDeskScore()
		})
		self.m_AnimationComponent.fucPlayStart()
	}

	//开始游戏游戏
	fucCountdown(){
		let count = 0
		for (let index = 0; index < this.m_BetButArray.length; index++) {
			let but = this.m_BetButArray[index]
			if (but.getChildByName("Label").getComponent(cc.Label).string  != "") {
				count +=1
			}
			but.getChildByName("Label").getComponent(cc.Label).string = ""
			but.getChildByName("mb_tx_bet_next").active = false
		}

		let  fucUpLabe = function(node){
			node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1/60),cc.callFunc(()=>{
				let num =Number(node.getChildByName("Label").getComponent(cc.Label).string) 
				node.getChildByName("Label").getComponent(cc.Label).string = (num+1)+""
			})) ))
		}

		for (let index = 0; index < count; index++) {
			let element = this.m_BetSellArray[index];
			element.active = true
			//金额从0开始涨
			fucUpLabe(element)
		}

		//桌面数字从1开始   1.00 -60.00   --60s
		count = 100
		this.m_DeskScore.active = true
		this.m_DeskScore.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1/60),cc.callFunc(()=>{
			count+=1 
			GameInfo.getinstance().m_Currentmultiple  = count
			this.m_DeskScore.getComponent(cc.Label).string = (count/100).toFixed(2) +"X"
			//只能调用一次
			if (count == 120 ) {
				this.m_AnimationComponent.fucMoveDisLayout()
			}
		})) ))
	}

	//播放金币动画
	fucPlayGoldAction(){
		let GoldAction  = this.upRoot.getChildByName("ani_coin_1")
		let Temp = cc.instantiate(GoldAction)
		Temp.active = true
		Temp.setPosition(GoldAction.getPosition())
		this.upRoot.addChild(Temp)
		Temp.getComponent(cc.Animation).play()
		Temp.runAction(cc.sequence(cc.moveTo(1.0,cc.v2(210,0)),cc.callFunc(()=>{
			Temp.removeFromParent()
		})))

		function fucMoveAction(Target:any,_count:number,angle:number,pos:cc.Vec3,TargetPos:cc.Vec2){
			let winLab =new cc.Node("winLab");
			let label=winLab.addComponent(cc.Label);
			label.string="+ "+_count

			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				label.string="+ "+ (_count/1000)
			}
			label.fontSize  = 40
			let color=new cc.Color(255,255,255);
			winLab.position=pos;
			winLab.color=color;
			Target.addChild(winLab)
			winLab.angle = angle;
			winLab.runAction(cc.sequence(cc.moveBy(1.5,TargetPos),cc.removeSelf()))
		}

		let winAction = this.upRoot.getChildByName('ndTime').getChildByName("lMoney")
		fucMoveAction(winAction,99,0,new cc.Vec3(0,20,-20),cc.v2(0,50))

		SoundMgr.palyMoveChipSound()
	}

	fucStopDeskScore(){
		this.m_DeskScore.stopAllActions()
		//写入底部记录
		this.m_RecordsComponent.fucWritedata(GameInfo.getinstance().m_Currentmultiple/100)
	}

	//游戏结束
	fucGameEnd(){
		for (let index = 0; index < this.m_BetSellArray.length; index++) {
			const element = this.m_BetSellArray[index];
			element.stopAllActions()
			element.getChildByName("Label").getComponent(cc.Label).string = ""
		}
		//延时1.0秒
		this.node.runAction(cc.sequence(cc.delayTime(1.0),cc.callFunc(()=>{
			for (let index = 0; index < this.m_BetSellArray.length; index++) {
				const element = this.m_BetSellArray[index];
				element.active = false
			}
		})))

		this.m_DeskScore.active = false
		this.m_DeskScore.stopAllActions()

		GameInfo.getinstance().m_Currentmultiple = 0

		//是否自动下注
		//GameInfo.getinstance().m_GameData
		if (GameInfo.getinstance().m_GameData.m_Gameinning > 0) {
			GameInfo.getinstance().m_GameData.m_Gameinning -=1
			//下注 金额   底分    输赢是否加倍
		}
	}

	//游戏结束清理桌面
	fucClear(){
		let self  = this
		
		this.m_GameStatus.isBet = false
		this.m_GameStatus.gameisfinish = false
	
		this.fucCheckMenoy()

		GameInstInfo.getinstance().m_GameSettlement = false  //没局结束重置是否获取到游戏数据
	}

	fucCheckMenoy(){
		if (!cc.sys.isNative) {
			window.parent.postMessage({type: "lotteryopen6", param: { method: "post", url: 'lotteryopen' ,data:{type:"game",LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } }, '*');
		}
	}

	fucShowTips(_str,_time = 1.0){
		let str = this.m_GameTipsNode.getChildByName("strLabel")
		str.getComponent(cc.Label).string = _str
		this.m_GameTipsNode.stopAllActions()
		this.m_GameTipsNode.active =true
		this.m_GameTipsNode.runAction(cc.sequence(cc.show(),cc.delayTime(_time),cc.hide()))
	}
}