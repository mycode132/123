import gameConfig from "../../../control/Game/configs/gameConfig";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import GameInfo from "../ControlScript/GameInfoAuiator";



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


	@property({type: cc.Node, displayName: '游戏节点'})
	gameRoot: cc.Node = null;


	@property({type: cc.Node, displayName: '下根节点'})
	downRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '游戏动画控制'})
	AnimtionNode: cc.Node = null;

	@property({type: cc.Label, displayName: '游戏局数'})
    m_GamePlayLab: cc.Label = null;

	@property({type:cc.Node,displayName:"游戏提示节点"})
	m_GameTipsNode :cc.Node = null

	
	m_GameSetNode :cc.Node = null
	@property({type:cc.Prefab,displayName:"设置"})
	m_settingprefab :cc.Prefab = null


	@property({type:cc.Prefab,displayName:"弹窗"})
	m_Editboxprefab :cc.Prefab = null


	//动画控制
	m_AnimationComponent = null
	

	m_GameStatus = {
		//局数
		inningCount: 20235555,
		//是否投注
		isBet: true,
		//投注金额
		betGold: 0,
		//总投注
		betAllGold:0,

		TouziPonits:0,
		//游戏当前状态
		gamestatus : 1, //  1：投注   2：结束
		//下注操作倒计时
		gameDownChipTime : 60,
		//是否显示筹码
		gamechipshow:true,
		//是否结算
		gameisfinish:false,
		//所有筹码是否已分发完成
		gameisMoveAllChip:false,
		//自己携带金币
		mUserGold:10000,
		//游戏id
		mlottery_code:127
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
		//SoundMgr.PlayBgMusic()

		this.initChangeImage()

		if (!cc.sys.isNative) {
			//this.fucServerMessige()
		}

		//let  self = this
		// Http.request("lotteryopen",{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"},function(dtat){

		// 	console.log("lotteryopen--------",JSON.parse(dtat))
		// 	let JSonData = JSON.parse(dtat)

		// 	self.m_RecordsComponent.fucWiterData(JSonData.Data.item)
		// },IHttpMethod.POST,false)
	}

	fucCoCosgetMsg(e){
		let self = this

		
		if (!e.data.data) {
			return
		}

		console.log("接收到:", e)
		if (e.data.type == "userbalance") {
			//这是获取用户余额
			self.m_GameStatus.mUserGold = Number(e.data.data.Data.BackData)/100
			let winAction = self.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
			

			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				winAction.getComponent(cc.Label).string = self.m_GameStatus.mUserGold  +"tr"
			}else{
				winAction.getComponent(cc.Label).string = GameInstInfo.getinstance().toDecimal(self.m_GameStatus.mUserGold)  +"tr"
			}
		}
		else if(e.data.type =="addbetting"){
			if (e.data.data.status == "1") {
				self.fucShowTips(e.data.data.msg,1.5)
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
			
			
		}
			//这是获取开奖记录  只能调用一次
		else if(e.data.type == "lotteryopen1"){
			//开局获取 设置时间
			let n_Servertime  = e.data.data.Data.Servertime
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			self.m_GameStatus.inningCount = Number(pair) +1 
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
		}
		else if(e.data.type == "lotteryopen5"){
			let Item_data = e.data.data.Data.item
			self.node.getChildByName("nRecordRank").active = true
			//刷新投注数据
		}else if(e.data.type == "lotteryopen6"){
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			self.m_GameStatus.inningCount = Number(pair) +1 

			//获取开奖结果
			this.m_GameStatus.TouziPonits= Number(Item_data.LotteryOpen)
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



		let LightEffect = this.gameRoot.getChildByName("AnimtionNode").getChildByName("LightEffect")
		LightEffect.runAction(cc.repeatForever(cc.rotateBy(1.0,30)))
	}


	initUpRoot() {
		let  self = this
		let but_version = this.upRoot.getChildByName("btnInning")
		but_version.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			if (!cc.sys.isNative) {
				window.parent.postMessage({type: "lotteryopen5", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } }, '*');
			}
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
				//刷新筹码界面
				this.fucShowChip()
			}

			else if (index == 3) {
				this.node.getChildByName("nGameExplain").active = true
				this.m_GameExplainComponent.fucUpView()
			}

			else if (index == 4) {

				if (!cc.sys.isNative) {
					window.parent.postMessage({type: "getbetrecord", param: { method: "post", url: 'getbetrecord' ,data:{lottery_code:this.m_GameStatus.mlottery_code,LotteryType: "cd"} } }, '*');
				}
			}

			//
			else if (index == 5) {

				if (!cc.sys.isNative) {
					
				}
			}
			//
			else if (index == 6) {

				if (!cc.sys.isNative) {
					
				}
			}
		}.bind(this))

		let btnBack = this.upRoot.getChildByName('btnBack');
		btnBack.on(cc.Node.EventType.TOUCH_END,function() {
			window.parent.history.back()

			cc.game.end()

		},this)

		//游戏局数
		this.m_GamePlayLab.getComponent(cc.Label).string = ""+this.m_GameStatus.inningCount
	}

	//下注界面
	initDownRoot() {
		
	} 

	fucBetClick(){
		
	}

	//绑定多功能按钮  
	fucBindBut(node,lab,Type){
	
	}

	intTemplate(node:cc.Node,startNum:number,endNum:number){
		
	}

	//初始化脚本
	initComponent(){
		let self = this
		

		this.m_AnimationComponent  = this.gameRoot.getChildByName("AnimtionNode").getComponent("AnimationControl_Auiator")
		this.m_AnimationComponent.fucInit()
		this.m_AnimationComponent.fucSetCallBack(function(){
			//
			self.m_AnimationComponent.fucPlayStart()
			self.fucGameEnd()

		})

		this.m_AnimationComponent.fucSetCallback(function(){


			self.m_AnimationComponent.fucPlayAction()
			//开始游戏
			self.fucCountdown()
		})

		this.m_AnimationComponent.fucStopDeskScore(function(){
			self.fucStopDeskScore()
		})
		self.m_AnimationComponent.fucPlayStart()
	}

	fucStopDeskScore(){
		this.m_DeskScore.stopAllActions()
		//写入顶部记录
		//this.m_RecordsComponent.fucWritedata(GameInfo.getinstance().m_Currentmultiple/100)
	}

	//开始游戏游戏
	fucCountdown(){
		let count = 0
		//桌面数字从1开始
		count = 100
		this.m_DeskScore.active = true
		this.m_DeskScore.runAction(cc.repeatForever(cc.sequence(cc.delayTime(6/60),cc.callFunc(()=>{
			count+=1 
			GameInfo.getinstance().m_Currentmultiple  = count
			this.m_DeskScore.getComponent(cc.Label).string = (count/100).toFixed(2) +"X"
		})) ))
	}

	//游戏结束
	fucGameEnd(){
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
		this.m_GameStatus.betGold = 0
		this.m_GameStatus.isBet = true
		this.m_GameStatus.gameisfinish = false
		this.m_GameStatus.gameisMoveAllChip = false
		this.m_GameStatus.betAllGold = 0

	}

	fucCheckMenoy(){
		if (!cc.sys.isNative) {
			window.parent.postMessage({type: "lotteryopen6", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } }, '*');
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