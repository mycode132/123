
import GameEngine from "../../../control/engines/GameEngine";
import PHWL from "../../../control/engines/GameEngine";
import Http, { IHttpMethod } from "../../../control/engines/services/Core/Http";
import gameConfig from "../../../control/Game/configs/gameConfig";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ChipControl from "../../../Public/ControlScript/ChipControl";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import { DETIndex } from "../configs/gameEnum";



const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("龙虎/大厅")
export default class hall extends cc.Component {
	@property({type: cc.Node, displayName: '背景节点'})
	ndBG: cc.Node = null;
	@property({type: cc.Node, displayName: '上根节点'})
	upRoot: cc.Node = null;
	@property({type: cc.Node, displayName: '下根节点'})
	downRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '下注节点'})
	middleRoot: cc.Node = null;
	@property({type: cc.Node, displayName: '筹码节点'})
	nChipMode: cc.Node = null;

	@property({type: cc.RichText, displayName: '总下注'})
	nAllChipLab: cc.RichText = null;

	@property({type: cc.Sprite, displayName: '游戏状态'})
    m_GameStatusLab: cc.Sprite = null;

	@property({type: cc.Label, displayName: '游戏局数'})
    m_GamePlayLab: cc.Label = null;

	@property({type: cc.Button, displayName: '在线玩家'})
	but_bank: cc.Node = null;

	@property({type:cc.Node,displayName:"筹码列表"})
	m_ChipView : cc.Node = null
	m_ChipViewComponent:ChipControl = null

	@property({type:cc.Node,displayName:"PK1"})
	m_CardsPk1 : cc.Node = null
	m_CardsPk1Component = null

	@property({type:cc.Node,displayName:"PK2"})
	m_CardsPk2 : cc.Node = null
	m_CardsPk2Component = null

	m_GameSetNode :cc.Node = null

	@property({type:cc.Node,displayName:"游戏提示节点"})
	m_GameTipsNode :cc.Node = null

	@property({type:[cc.SpriteFrame],displayName:"投注"})
	m_SpriteFrame:cc.SpriteFrame[] = []

	@property({type:cc.Prefab,displayName:"设置"})
	m_settingprefab :cc.Prefab = null

	@property({type:cc.Prefab,displayName:"在线玩家"})
	m_OnlinePlayerprefab :cc.Prefab = null

	//动画控制
	m_AnimationComponent = null
	//历史记录
	m_RecordsComponent = null
	//投注历史
	m_RecordVerComponent = null
	//在线排行
	m_OnlinePlayerRankComponent= null
	//投注记录
	m_BettingRecordComponent= null
	//游戏说明
	m_GameExplainComponent =null

	//游戏场景数据
	m_DeskChip = []  //自己桌面上已下注筹码
	m_AllChipNode = [] //所有玩家下注的筹码

	m_jetton = [0,0,0]   //自己下注筹码数据
	m_wheeljetton = [0,0,0]   //自己一轮下注筹码数据

	m_GameStatus = {
		//局数
		inningCount: 20235555,
		//龙牌点数
		dragonCard: -1,
		//虎牌点数
		tigerCard: -1,
		//是否投注
		isBet: true,
		//投注金额
		betGold: 0,
		//总投注
		betAllGold:0,
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
		mUserGold:100000000,
		//游戏id
		mlottery_code:2109,

		isFenPan:false
	}

	mInit:boolean = false

	m_UserChipCount = [0,0,0]


	m_enemyPool = null
	
	m_LotteryType = ""
	protected onLoad(): void {
		this.m_enemyPool = new cc.NodePool();
		let initCount = 1000;
		this.m_enemyPool.clear()
		for (let i = 0; i < initCount; ++i) {
			this.m_enemyPool.put(cc.instantiate(this.nChipMode)); // 通过 putInPool 接口放入对象池
		}

		//设置mlottery_code
		GameInstInfo.getinstance().m_GameData.findIndex((elem: any) => {
			if (elem[0] == "code") this.m_GameStatus.mlottery_code = Number(elem[1])
		});

		this.initGame();
	}
	createEnemy() {
		let enemy = null;
		if (this.m_enemyPool.size() > 0) { 
			enemy = this.m_enemyPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.nChipMode);
		}
		enemy.active = true
		enemy.stopAllActions()
		return enemy
	}

	onEnemyKilled (enemy) {
		this.m_enemyPool.put(enemy);
	}

	protected start(): void {
		this.initDownRoot()
		this.initMiddleRoot()
		this.initAction()
		this.initUpRoot()
		this.initCards()
		//播放背景音效
		SoundMgr.PlayBgMusic()
		this.initChangeImage()

		this.mInit = true
		GameInstInfo.getinstance().m_Disconnect = true
		if (GameInstInfo.getinstance().m_Disconnect) {
			this.node.getChildByName("Disconnect").active = true
		}

		//测试单机启动接口
		if(GameInstInfo.getinstance().publishingservice){
			GameInstInfo.getinstance().fucschedule(this,this.fucCountdown) 
			GameInstInfo.getinstance().m_Disconnect = false
			this.node.getChildByName("Disconnect").active = false
		}

		if (!cc.sys.isNative) {
			this.fucServerMessige()
		}

		//加载公共资源
		let  set_path =`Public/setting/${GameInstInfo.getinstance().fucgepath()}`;
		cc.resources.loadDir(set_path, cc.Asset, (completedCount, totalCount, item)=>{
		
		},(err, asset: cc.Asset[])=>{});
	}

	onDisable(){
		this.node.removeFromParent()
	}

	fucPostMessage(data){
		if (!cc.sys.isNative) {
			window.parent.postMessage(data, '*');
		}
	}

	fucServerMessige(){
		let self = this
		// getBalance: { label: '获取余额', url: "userbalance" },
        // downBet: { label: '下注', url: "addbetting" },
        // getRate: { label: '获取赔率', url: "getrebate" },
        // getBet: { label: '下注记录', url: "getbetrecord" }
		//获取赔率
		this.fucPostMessage({type: "getrebate", param: { method: "post", url: 'getrebate' ,data:{LotteryType: "dt"} } })
		this.fucPostMessage({type: "userbalance", param: { method: "post", url: 'userbalance' ,data:{} } })

		this.node.runAction(cc.sequence(cc.delayTime(1.0),cc.callFunc(()=>{
			this.fucPostMessage({type: "lotteryopen7", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
		})))
	}

	//游戏主动断线重连
	fucGameDisconnect(){
		let self =this
		//self.unschedule(self.fucCountdown)  //停止计时器
		GameInstInfo.getinstance().fucstopschedule(self)
		//self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("网络异常"),3.0)
		GameInstInfo.getinstance().m_Disconnect =  true
		self.node.getChildByName("Disconnect").active = true
		GameInstInfo.getinstance().m_GameIsReconnection = true
		let  fucCheckNet = function(){
			if (!GameInstInfo.getinstance().m_GameSettlement) {
				//self.fucPostMessage({type:"lotteryopen1",param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
				self.fucPostMessage({type:"NetworkException",param:{method:"post",url:'lotteryopen',data:{LotteryCode:self.m_GameStatus.mlottery_code,Resource:"500"} } })
				//self.scheduleOnce(fucCheckNet,10)  //10秒检测一次
				setTimeout(fucCheckNet, 1000*3)
			}
		}.bind(this)
		fucCheckNet()
	}

	fucCoCosgetMsg(e){
		if (!e.data.data) {
			return
		}
	
		let self = this
		if (this.node.getChildByName("Disconnect")) {
			GameInstInfo.getinstance().m_Disconnect = false
			self.node.getChildByName("Disconnect").active = false
		}

		if (e.data.type == "userbalance") {
			//这是获取用户余额
			let winAction = self.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
			self.m_GameStatus.mUserGold = (Number(e.data.data.Data.BackData))
			//统一显示元单位
			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				winAction.getComponent(cc.Label).string = (self.m_GameStatus.mUserGold/100).toFixed(0)
			}else{
				winAction.getComponent(cc.Label).string = (self.m_GameStatus.mUserGold/100).toFixed(2)
			}
			self.m_ChipViewComponent.fucUpButStatus(self.m_GameStatus.mUserGold/100)
			//这个地方要转最低起投
			self.m_ChipViewComponent.fucUpButStatus(GameInstInfo.getinstance().fucGameChipTransition(self.m_GameStatus.mUserGold))
		}
		else if(e.data.type =="addbetting"){
			self.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
			if (e.data.data.status == "1") {  //表示下注成功
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("下注成功"),1.5)
				//这个地方请求自己金币变化
				self.fucPostMessage({type: "userbalance", param: { method: "post", url: 'userbalance' ,data:{} } });
				//这个地方加入到总列表
				self.fucUserMoneyAddPlayer()
			}
			if (e.data.data.status == "0") {
				self.fucRevocation()
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("下注失败"),1.5)
			}
			self.m_wheeljetton = [0,0,0]
		}
		else if(e.data.type =="getrebate"){
			//这是获取赔率
			GameInstInfo.getinstance().m_GameRate = e.data.data.Data.item
			self.fucSetRate()
		}
		else if(e.data.type =="getbetrecord"){
			//这是获取投注记录
			self.node.getChildByName("nBettingRecord").active = true
			self.m_BettingRecordComponent.fucUpdata(e.data.data.Data1.item)
		}

		//这是断线重连
		else if(e.data.type == "NetworkException"){
			//继续开当期奖
			let bGetdata = false
			let Item_data = e.data.data.Data.item[0]
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				Item_data = e.data.data.Data.item[index]
				let pair = Item_data.IssueNo.slice(4)
				if (self.m_GameStatus.inningCount == Number(pair)) {
					//获取开奖结果
					let  aa  = Item_data.LotteryOpen.split(",");
					self.m_GameStatus.dragonCard= Number(aa[0])
					self.m_GameStatus.tigerCard= Number(aa[1])

					bGetdata = true
				}
			}
			if (bGetdata) {
				GameInstInfo.getinstance().m_GameSettlement = true
				self.m_GameStatus.gameDownChipTime +=1 
				//启动定时器   
				GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
				self.m_RecordsComponent.initData(e.data.data.Data.item)
			}else{
				GameInstInfo.getinstance().m_Disconnect =  true
				self.node.getChildByName("Disconnect").active = true
				GameInstInfo.getinstance().m_GameIsReconnection = true
			}
		}

		//这是获取开奖记录
		else if(e.data.type == "lotteryopen4" ) {
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
				if ( self.m_GameStatus.gamestatus == 1) {	
					let  a = [0, 2, 1];
					let  b = [0.4, 0.2,0.4];
					let count = Math.round(65+ Math.random()*15)
					let ChipNumber = [1,10,50,100,500,1000,5000,10000]
					for (let index = 0; index < count; index++) {
						self.fucReconnectBet(self.funcRandom(a,b),ChipNumber[Math.round(Math.random()*(ChipNumber.length-1))])
					}
				}	
			}
			//启动定时器
			GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
			self.m_RecordsComponent.initData(e.data.data.Data.item)
		}else if(e.data.type == "lotteryopen3"){
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let  max =  0
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				let pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			//self.m_GameStatus.inningCount = max +1 
			let betnumber= ["龙","虎","和"]
			let bettData = {betting_number:[],betting_money:[]}
			for (let index = 0; index < self.m_wheeljetton.length; index++) {
				if (self.m_wheeljetton[index] > 0) {
					bettData.betting_money.push(self.m_wheeljetton[index])
					bettData.betting_number.push(betnumber[index])
				}
			}
			let n_Data={
				lottery_code: self.m_GameStatus.mlottery_code,
				betting_number:bettData.betting_number,
				betting_money: bettData.betting_money,
				betting_count: 1,
				play_detail_code: 1,
				betting_issuseNo:Number(Item_data.IssueNo)+1,
				type:"game"
			}
			self.fucPostMessage({type: "addbetting", param: { method: "post", url: 'addbetting' ,data:n_Data } });
		}else if(e.data.type == "lotteryopen0"){
			let n_Servertime  = e.data.data.Data.Servertime
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let  max =  0
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				let pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			self.m_GameStatus.inningCount = max +1 
			self.m_GamePlayLab.getComponent(cc.Label).string = ""+self.m_GameStatus.inningCount
			self.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDownTime(n_Servertime,Item_data.UTC_TIME)  //获取倒计时

			//如果时间少于10秒   加入断线重连效果
			if (self.m_GameStatus.gameDownChipTime < 5) {
				//模拟玩家下注
				if ( self.m_GameStatus.gamestatus == 1) {	
					let  a = [0, 2, 1];
					let  b = [0.4, 0.2,0.4];
					let count =10+ Math.round(65+ Math.random()*15)
					let ChipNumber = [1,10,50,100,500,1000,5000,10000]
					for (let index = 0; index < count; index++) {
						self.fucReconnectBet( self.funcRandom(a,b),ChipNumber[Math.round(Math.random()*(ChipNumber.length-1))])
					}
				}	
			}
			//这个地方请求自己金币变化
			self.fucPostMessage({type: "userbalance", param: { method: "post", url: 'userbalance' ,data:{} } });
		}
		else if(e.data.type == "lotteryopen2"){
			GameInstInfo.getinstance().m_GameSettlement = true
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let  max =  0
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				let pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			let  aa  = Item_data.LotteryOpen.split(",");
			self.m_GameStatus.dragonCard = Number(aa[0])
			self.m_GameStatus.tigerCard = Number(aa[1])

			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			//获取到了上一局的牌
			if (self.m_GameStatus.inningCount - 1 == Number(pair)) {
				GameInstInfo.getinstance().m_GameSettlement = false  
			}
		}

		else if(e.data.type == "EndWritedata"){
			let Item_data = e.data.data.Data.item[0]
			let  max =  0
			let pair = null
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			//追加开奖结果  //断线重连不要再追加结果
			if (GameInstInfo.getinstance().m_GameIsReconnection ) {
				GameInstInfo.getinstance().m_GameIsReconnection = false
			}else{
				let  aa  = Item_data.LotteryOpen.split(",");
				self.m_RecordsComponent.fucWiterData(Number(aa[0]),Number(aa[1]))
			}
		}

		else if(e.data.type == "lotteryopen5"){
			let Item_data = e.data.data.Data.item
			self.m_RecordVerComponent.fucUpView(Item_data)
		}
		else if(e.data.type == "lotteryopen7"){
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let  max =  0
			let pair = null
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			self.m_GameStatus.inningCount = max +1 
			self.m_GamePlayLab.getComponent(cc.Label).string = ""+self.m_GameStatus.inningCount
			self.m_RecordsComponent.initData(e.data.data.Data.item)
		}
	}

	//多国语言适配Image
	initChangeImage(){
		let btnInning = this.upRoot.getChildByName('btnInning');  //左上角局数图片
		GameInstInfo.getinstance().fucPublicImage(btnInning)

		let table = this.upRoot.getChildByName('table');  //庄
		GameInstInfo.getinstance().fucPublicImage(table)

		let donwzhu = this.node.getChildByName('betRoot').getChildByName("AllchipNum").getChildByName("desk_11");  //总下注
		GameInstInfo.getinstance().fucPublicImage(donwzhu)

		let but_Cancel = this.downRoot.getChildByName('ndBet').getChildByName('btnCancel').getChildByName('Background')
		GameInstInfo.getinstance().fucPublicImage(but_Cancel)

		let but_Sure = this.downRoot.getChildByName('ndBet').getChildByName('btnSure').getChildByName('Background')
		GameInstInfo.getinstance().fucPublicImage(but_Sure)
		//6个龙虎  下注节点龙虎和 desk_name
		let n_dragon = this.middleRoot.getChildByName('dragon').getChildByName("desk_name")
		GameInstInfo.getinstance().fucChangeImage(n_dragon)
	
		let n_equality = this.middleRoot.getChildByName('equality').getChildByName("desk_name")
		GameInstInfo.getinstance().fucChangeImage(n_equality)
		
		let n_tiger = this.middleRoot.getChildByName('tiger').getChildByName("desk_name")
		GameInstInfo.getinstance().fucChangeImage(n_tiger)
		//底部记录龙虎和
		let n_Recordst =  this.node.getChildByName("nRecordLayout").getChildByName("card001").getChildByName("desk_name")
		GameInstInfo.getinstance().fucChangeImage(n_Recordst)

		n_Recordst =  this.node.getChildByName("nRecordLayout").getChildByName("card002").getChildByName("desk_name")
		GameInstInfo.getinstance().fucChangeImage(n_Recordst)

		n_Recordst =  this.node.getChildByName("nRecordLayout").getChildByName("card003").getChildByName("desk_name")
		GameInstInfo.getinstance().fucChangeImage(n_Recordst)
		//在线玩家
		GameInstInfo.getinstance().fucPublicImage(this.node.getChildByName("middleRoot").getChildByName("Palyer_but").getChildByName("Background"))
		//替换  开始  与  和动画
		GameInstInfo.getinstance().fucChangeStartAnimation(this.m_AnimationComponent.Startspine)
		GameInstInfo.getinstance().fucChangeAnimation(this.m_AnimationComponent.WinTiespine)
		//游戏状态修改
		this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[0]
		GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
	}

	initGame() {
		let btnBack = this.upRoot.getChildByName('btnBack');
		btnBack.on(cc.Node.EventType.TOUCH_END,function() {
			//cc.game.end()
			window.parent.history.back()
		},this)
	}

	//动画控制器
	initAction(){
		this.m_AnimationComponent  = this.node.getChildByName("AnimtionNode").getComponent("AnimationControl_Boxer")
		this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[0]
		GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
	}

	initUpRoot() {
		let but_version = this.upRoot.getChildByName("btnInning")
		but_version.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.m_RecordVerComponent.fucShowNode()
			this.fucPostMessage({type: "lotteryopen5", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
		}.bind(this),this)

		let but_gameset = this.upRoot.getChildByName("btnSet")
		but_gameset.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.m_GameSetNode.active = true 
		}.bind(this),this)

		this.m_GameSetNode =  cc.instantiate(this.m_settingprefab)
		this.m_GameSetNode.active = false
		this.node.getChildByName("tempNode").addChild(this.m_GameSetNode)

		this.m_GameSetNode.getComponent("gameSet").fucSetParent(this)
		this.m_GameSetNode.getComponent("gameSet").fucSteCallback(function(index){
			if (index == 2) {
				this.m_GameStatus.gamechipshow = !this.m_GameStatus.gamechipshow
				//刷新筹码界面
				this.fucShowChip()
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
						self.m_GameExplainComponent =  instance.getComponent("GameExplain_Boxer")
						self.m_GameExplainComponent.fucUpView()
						
					});   
				}else{
					this.node.getChildByName("nGameExplain").active = true
					this.m_GameExplainComponent.fucUpView()
				}
			}
			else if (index == 4) {
				this.m_BettingRecordComponent.fucUpView()
				this.fucPostMessage({type: "getbetrecord", param: { method: "post", url: 'getbetrecord' ,data:{lottery_code:this.m_GameStatus.mlottery_code} } });
			}
		}.bind(this))
	}

	initDownRoot() {
		this.m_ChipViewComponent = this.m_ChipView.getComponent('ChipControl')
		//撤销
		let but_Cancel = this.downRoot.getChildByName('ndBet').getChildByName('btnCancel')
		but_Cancel.off(cc.Node.EventType.TOUCH_END)
		but_Cancel.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			if (this.m_GameStatus.isBet) {
				this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
				this.fucRevocation()
			}
		}.bind(this),this)

		//确认下注
		let but_Sure = this.downRoot.getChildByName('ndBet').getChildByName('btnSure')
		but_Sure.off(cc.Node.EventType.TOUCH_END)
		but_Sure.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			for (let index = 0; index < this.m_DeskChip.length; index++) {
				this.m_AllChipNode.push(this.m_DeskChip[index])
			}
			this.m_DeskChip = []
			//发送下注消息
			this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
			this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false
			//不能在进行下注
			this.m_GameStatus.betAllGold += this.m_GameStatus.betGold

			this.fucPostMessage({type: "lotteryopen3", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
		}.bind(this),this)
	} 

	initMiddleRoot(){
		let n_dragon = this.middleRoot.getChildByName('dragon').getChildByName("but")
		n_dragon.on(cc.Node.EventType.TOUCH_END,function(){
			this.fucPlaceBet(DETIndex.DragonID)
		}.bind(this),this)

		let n_equality = this.middleRoot.getChildByName('equality').getChildByName("but")
		n_equality.on(cc.Node.EventType.TOUCH_END,function(){
			this.fucPlaceBet(DETIndex.EqualityID)
		}.bind(this),this)

		let n_tiger = this.middleRoot.getChildByName('tiger').getChildByName("but")
		n_tiger.on(cc.Node.EventType.TOUCH_END,function(){
			this.fucPlaceBet(DETIndex.TigerID)
		}.bind(this),this)

		let Palyer_but = this.middleRoot.getChildByName('Palyer_but')
		Palyer_but.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()

			if (!this.m_OnlinePlayerRankComponent) {
				let m_OnlinePlayerprefab = cc.instantiate(this.m_OnlinePlayerprefab)
				this.node.addChild(m_OnlinePlayerprefab)
				this.m_OnlinePlayerRankComponent =  m_OnlinePlayerprefab.getComponent("OnlinePlayerRank")
			}
			this.node.getChildByName("nOnlinePlayerRank").active = true
			this.m_OnlinePlayerRankComponent.fucUpView()
		}.bind(this),this)

		this.fucUpOnlinePlayer()
	}

	fucUpOnlinePlayer(){
		this.middleRoot.getChildByName('Palyer_but').runAction(cc.repeatForever(cc.sequence(cc.delayTime(1.0),cc.callFunc(()=>{
			let n_Count = GameInstInfo.getinstance().fucgetOnLinePlayer()
			this.middleRoot.getChildByName('Palyer_but').getChildByName('count_Label').getComponent(cc.Label).string = `(${n_Count})`
		}))))
	}

	fucSetRate(){
		//设置倍率
		let str_Rate_lab = this.middleRoot.getChildByName('dragon').getChildByName("str_Rate_lab")
		GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {if (elem.PlayCode == "dtp1"){
			str_Rate_lab.getComponent(cc.Label).string = `1:${Number(elem.Bonus)/2 }`
		}});
		str_Rate_lab = this.middleRoot.getChildByName('tiger').getChildByName("str_Rate_lab")
		GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {if (elem.PlayCode == "dtp2"){
			str_Rate_lab.getComponent(cc.Label).string = `1:${Number(elem.Bonus) /2}`
		}});

		str_Rate_lab = this.middleRoot.getChildByName('equality').getChildByName("str_Rate_lab")
		GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {if (elem.PlayCode == "dtp3"){
			str_Rate_lab.getComponent(cc.Label).string = `1:${Number(elem.Bonus)/2 }`
		}});
	}

	//初始化点牌
	initCards(){
		//龙牌 
		this.m_CardsPk1Component  = this.m_CardsPk1.getComponent('CardsMode_Boxer')
		//虎牌
		this.m_CardsPk2Component  = this.m_CardsPk2.getComponent('CardsMode_Boxer')

		this.m_CardsPk1.setScale(0)
		this.m_CardsPk1.setPosition(cc.v2(-22,85))
		this.m_CardsPk2.setScale(0)
		this.m_CardsPk2.setPosition(cc.v2(22,85))

		if (GameInstInfo.getinstance().m_Disconnect) {
			this.fucDisconne()
		}else{
			this.fucCardsaction(true)

			this.m_AnimationComponent.fucPlayStart(0)
		}
		//初始化开将记录
		this.m_RecordsComponent =  this.node.getChildByName("nRecordLayout").getComponent("RecordLayout_Boxer")
		//初始化历史记录
		this.m_RecordVerComponent=  this.node.getChildByName("nRecordRank").getComponent("RecordRank_Boxer")
		this.m_RecordVerComponent.m_parent = this

		this.m_BettingRecordComponent =  this.node.getChildByName("nBettingRecord").getComponent("BettingRecord_Boxer")
		//this.m_GameExplainComponent =  this.node.getChildByName("nGameExplain").getComponent("GameExplain_Boxer")

		this.fucPostMessage({type: "lotteryopen4", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
	}

	fucDisconne(){
		let self= this
		this.m_CardsPk1.runAction(cc.sequence (cc.spawn(cc.scaleTo(0.0,2.0,2.0),cc.moveTo(0.0,cc.v2(-114,-90))),cc.callFunc(()=>{
			self.m_CardsPk1Component.fucPlayFlame()
			SoundMgr.palyMoveCardSound()
			self.m_CardsPk2.runAction(cc.sequence (cc.spawn(cc.scaleTo(0.0,2.0,2.0),cc.moveTo(0.0,cc.v2(114,-90))),cc.callFunc(()=>{
				self.m_CardsPk2Component.fucPlayFlame()
				SoundMgr.palyMoveCardSound()
			})) )
		})) )
	}

	//点牌的移动动画
	fucCardsaction(_type){
		//开
		let self= this
		if (_type) {
			self.m_CardsPk1.stopAllActions()
			self.m_CardsPk1.runAction(cc.sequence (cc.spawn(cc.scaleTo(0.5,2.0,2.0),cc.moveTo(0.5,cc.v2(-114,-90))),cc.callFunc(()=>{
				self.m_CardsPk1Component.fucPlayFlame()
				SoundMgr.palyMoveCardSound()

				self.m_CardsPk2.stopAllActions()
				self.m_CardsPk2.runAction(cc.sequence (cc.spawn(cc.scaleTo(0.5,2.0,2.0),cc.moveTo(0.5,cc.v2(114,-90))),cc.callFunc(()=>{
					self.m_CardsPk2Component.fucPlayFlame()
					SoundMgr.palyMoveCardSound()
				})) )
			})) )
		}else{
			self.m_CardsPk1Component.fucClear()
			self.m_CardsPk2Component.fucClear()

			self.m_CardsPk1.stopAllActions()
			self.m_CardsPk1.runAction(cc.sequence (cc.spawn(cc.scaleTo(0.3,0.0,0.0),cc.moveTo(0.3,cc.v2(-22,85))),cc.callFunc(()=>{
				self.m_CardsPk1Component.fucShowBlack()

				self.m_CardsPk2.stopAllActions()
				self.m_CardsPk2.runAction(cc.sequence (cc.spawn(cc.scaleTo(0.3,0.0,0.0),cc.moveTo(0.3,cc.v2(22,85))),cc.callFunc(()=>{
					self.m_CardsPk2Component.fucShowBlack()
				})) )
			})) )
		}
	}

	//进行下注
	fucPlaceBet(index){
		if (this.m_GameStatus.gamestatus == 2  ||  this.m_GameStatus.isBet == false) {
			this.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("客官莫急"))
			return
		}
		if (this.m_GameStatus.gamestatus == 1  &&  this.m_GameStatus.isFenPan) {
			this.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("封盘时间"))
			return
		}

		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = true
		this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = true
		//下注大小
		let nChipNumber = this.m_ChipViewComponent.n_ChipNumber[this.m_ChipViewComponent.m_SelectIndex]
		//判断是否可以下注  自己的
		let n_count = GameInstInfo.getinstance().fucGameTouzhuTransition(nChipNumber,true) //元
		if (n_count  >  this.m_GameStatus.mUserGold || this.m_GameStatus.mUserGold <=0) {
			this.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("余额不足"))
			return
		}
		//计算下注
		n_count = GameInstInfo.getinstance().fucGameTouzhuTransition(nChipNumber,false) //分
		this.m_GameStatus.mUserGold -= n_count *100 //分转元
		this.m_jetton[index]  += n_count
		this.m_wheeljetton[index] += n_count

		//这个地方要转最低起投
		this.m_ChipViewComponent.fucUpButStatus(GameInstInfo.getinstance().fucGameChipTransition(this.m_GameStatus.mUserGold))
		//金币做相应扣除
		this.m_GameStatus.betGold += nChipNumber
		let nchip = this.createEnemy()
		let nchipComponent = nchip.getComponent('ChipNode')
		nchipComponent.fucSetNumber(nChipNumber)

		let n_parent:cc.Node = null
		if (index == DETIndex.DragonID) {
			n_parent = this.middleRoot.getChildByName('dragon')
		}else if (index == DETIndex.EqualityID) {
			n_parent = this.middleRoot.getChildByName('equality')
		}else{
			n_parent = this.middleRoot.getChildByName('tiger')
		}

		nchip.active = true

		nchip.setPosition(this.middleRoot.getChildByName('ChipStartPos').getPosition())
		this.middleRoot.addChild(nchip)
		//随机位置 
		let posSize = n_parent.getContentSize()
		let posx = n_parent.x  - posSize.width/2 + Math.random()*(posSize.width)
		let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)
		let n_Time =0.3+ GameInstInfo.getinstance().fucDistance(nchip.getPosition(),new cc.Vec2(posx,posy))/1500
		nchip.runAction(cc.sequence(cc.show(),cc.moveTo(n_Time,cc.v2(posx,posy)).easing(cc.easeCubicActionOut()),cc.callFunc(()=>{
			SoundMgr.palyChipSound()
		})))
		//保存自己下注
		this.m_DeskChip.push(nchip)

		this.fucUpMyAmount()
		this.fucShowChip()

		let winAction = this.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")

		winAction.getComponent(cc.Label).string =  (this.m_GameStatus.mUserGold/100).toFixed(0)
		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			winAction.getComponent(cc.Label).string =  (this.m_GameStatus.mUserGold/100).toFixed(0)
		}
	}

	//撤销
	fucRevocation(){
		//金币做相应增加
		for (let index = 0; index < this.m_DeskChip.length; index++) {
			let chipNode = this.m_DeskChip[index];
			chipNode.runAction(cc.sequence(cc.moveTo(0.5,cc.v2(this.middleRoot.getChildByName('ChipStartPos').getPosition())),cc.callFunc(()=>{
				//chipNode.removeFromParent(true)
				this.onEnemyKilled(chipNode)
				if (index == this.m_DeskChip.length-1) {
					this.m_DeskChip = []
				}
			})))
		}

		let n_count= 0
		for (let index = 0; index < this.m_wheeljetton.length; index++) {
			n_count += this.m_wheeljetton[index];
		}
		if (n_count)SoundMgr.palyMoveChipSound()
		
		for (let index = 0; index < this.m_wheeljetton.length; index++) {
			//分单位转换
			this.m_jetton[index] -= this.m_wheeljetton[index]
		}
		this.m_wheeljetton= [0,0,0]
		this.fucUpMyAmount()
		this.m_GameStatus.betGold = 0
		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
		this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false
		let winAction = this.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
		winAction.getComponent(cc.Label).string =  (this.m_GameStatus.mUserGold/100).toFixed(0)
	}

	fucUpMyAmount(){
		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}

		let dragon_lab = this.middleRoot.getChildByName('dragon').getChildByName('str_Label')
		dragon_lab.getComponent(cc.Label).string = ""+ (this.m_jetton[DETIndex.DragonID] > 0 ? this.m_jetton[DETIndex.DragonID] : "")
		if (this.m_jetton[DETIndex.DragonID] > 1000) {
			dragon_lab.getComponent(cc.Label).string = toThousands(this.m_jetton[DETIndex.DragonID]/1000) + "k"
		}
	
		let equality_lab = this.middleRoot.getChildByName('equality').getChildByName('str_Label')
		equality_lab.getComponent(cc.Label).string = ""+ (this.m_jetton[DETIndex.EqualityID] > 0 ? this.m_jetton[DETIndex.EqualityID] : "")
		if (this.m_jetton[DETIndex.EqualityID] > 1000) {
			equality_lab.getComponent(cc.Label).string = toThousands(this.m_jetton[DETIndex.EqualityID]/1000) + "k"
		}

		let tiger_lab = this.middleRoot.getChildByName('tiger').getChildByName('str_Label')
		tiger_lab.getComponent(cc.Label).string = ""+ (this.m_jetton[DETIndex.TigerID] > 0 ? this.m_jetton[DETIndex.TigerID] : "")
		if (this.m_jetton[DETIndex.TigerID] > 1000) {
			tiger_lab.getComponent(cc.Label).string = toThousands(this.m_jetton[DETIndex.TigerID]/1000) + "k"
		}
	}

	fucUserMoneyAddPlayer(){
		let self = this
		let n_parent:cc.Node = null
		for (let index = 0; index < self.m_wheeljetton.length; index++) {
			if (index == DETIndex.DragonID) {
				n_parent = self.middleRoot.getChildByName('dragon')
			}else if (index ==  DETIndex.EqualityID) {
				n_parent = self.middleRoot.getChildByName('equality')
			}else{
				n_parent = self.middleRoot.getChildByName('tiger')
			}
			self.m_UserChipCount[index] += self.m_wheeljetton[index]
			self.m_GameStatus.betAllGold += self.m_wheeljetton[index]
			//这里统计下注额度
			self.fucUpArerMoney(n_parent,self.m_UserChipCount[index])
		}
		self.fucUpDeskChipCount()
	}

	//模拟断线重连玩家下注
	fucReconnectBet(index,_number){
		let nchip = this.createEnemy()// cc.instantiate(this.nChipMode)
		//下注大小
		let nchipComponent = nchip.getComponent('ChipNode')
		nchipComponent.fucSetNumber(_number)

		let n_parent:cc.Node = null
		if (index == DETIndex.DragonID) {
			n_parent = this.middleRoot.getChildByName('dragon')
		}else if (index ==  DETIndex.EqualityID) {
			n_parent = this.middleRoot.getChildByName('equality')
		}else{
			n_parent = this.middleRoot.getChildByName('tiger')
		}

		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			this.m_GameStatus.betAllGold += _number*1000  
			this.m_UserChipCount[index]  += _number*1000
		}else{
			this.m_GameStatus.betAllGold += _number
			this.m_UserChipCount[index]  += _number
		}
	
		this.fucUpDeskChipCount()

		nchip.active = true
		nchip.setPosition(this.middleRoot.getChildByName('Palyer_but').getPosition())
		this.middleRoot.addChild(nchip)
		//随机位置 
		let posSize = n_parent.getContentSize()
		let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width)
		let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)
		let  self = this
		nchip.runAction(cc.sequence(cc.show(),cc.moveTo(0,cc.v2(posx,posy)),cc.callFunc(()=>{
			//这里统计下注额度
			self.fucUpArerMoney(n_parent,self.m_UserChipCount[index])
		})))

		//保存其他玩家下注筹码
		this.m_AllChipNode.push(nchip)
		this.fucShowChip()
	}

	funcRandom(arr1, arr2) {
		let sum = 0,
		  factor = 0,
		  random = Math.random();
		for(let i = arr2.length - 1; i >= 0; i--) {
		  sum += arr2[i]; // 统计概率总和
		};
		random *= sum; // 生成概率随机数
		for(let i = arr2.length - 1; i >= 0; i--) {
		  factor += arr2[i];
		  if(random <= factor) 
		   return arr1[i];
		};
		return null;
	}
	  
	//玩家下注
	fucUserPlaceBet(index,_number){


		let nchip = this.createEnemy()// cc.instantiate(this.nChipMode)
		//下注大小
		let nchipComponent = nchip.getComponent('ChipNode')
		nchipComponent.fucSetNumber(_number)

		let n_parent:cc.Node = null
		if (index == DETIndex.DragonID) {
			n_parent = this.middleRoot.getChildByName('dragon')
		}else if (index ==  DETIndex.EqualityID) {
			n_parent = this.middleRoot.getChildByName('equality')
		}else{
			n_parent = this.middleRoot.getChildByName('tiger')
		}

		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			this.m_GameStatus.betAllGold += _number*1000
			this.m_UserChipCount[index]  += _number*1000
		}else{
			this.m_GameStatus.betAllGold += _number
			this.m_UserChipCount[index]  += _number
		}

		this.fucUpDeskChipCount()

		nchip.active = true
		nchip.setPosition(this.middleRoot.getChildByName('Palyer_but').getPosition())
		this.middleRoot.addChild(nchip)
		//随机位置 
		let posSize = n_parent.getContentSize()
		let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width)
		let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)
		let  self = this
		let n_Time =0.4+ GameInstInfo.getinstance().fucDistance(this.middleRoot.getChildByName('Palyer_but').getPosition(),new cc.Vec2(posx,posy))/1500
		nchip.runAction(cc.sequence(cc.show(),cc.moveTo(n_Time,cc.v2(posx,posy)).easing(cc.easeCubicActionOut()),cc.callFunc(()=>{
			SoundMgr.palyChipSound()
			//这里统计下注额度
			self.fucUpArerMoney(n_parent,self.m_UserChipCount[index])
		})))

		//保存其他玩家下注筹码
		this.m_AllChipNode.push(nchip)
		this.fucShowChip()
	}

	//是否显示筹码
	fucShowChip(){
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			this.m_AllChipNode[index].opacity = this.m_GameStatus.gamechipshow ? 255 :0
		}
		for (let index = 0; index < this.m_DeskChip.length; index++) {
			this.m_DeskChip[index].opacity = this.m_GameStatus.gamechipshow ? 255 :0
		}
	}

	//自己下注后 加入总额
	fucUpArerMoney(node:cc.Node,money:any){
		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		let str_AllLab = node.getChildByName("str_AllLab")
		str_AllLab.getComponent(cc.Label).string =""+toThousands(money)
		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			str_AllLab.getComponent(cc.Label).string = ""+toThousands(money/1000) +"K"
		}
	}

	//刷新总下注额度
	fucUpDeskChipCount(){
		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		
		if ( GameInstInfo.getinstance().m_curr == "VND") {
			this.nAllChipLab.string = `<color=#B4E5B0>${toThousands(this.m_GameStatus.betAllGold/1000)}K</color>`
		}else{
			this.nAllChipLab.string = `<color=#B4E5B0>${toThousands(this.m_GameStatus.betAllGold)}</color>`
		}
	}

	//游戏倒计时检测
	fucCountdown(){
		this.m_GameStatus.gameDownChipTime -= 1
		if (this.m_GameStatus.gamestatus == 1) {
			
			if (this.m_GameStatus.gameDownChipTime ==  4) {
				this.m_AnimationComponent.fucPlayStart(2)
				this.m_GameStatus.isFenPan = true
			}

	
			if (this.m_GameStatus.gameDownChipTime <= 0 ) {
				this.m_GameStatus.gamestatus = 2
				this.m_GameStatus.gameDownChipTime = 15
				//自己没有下注的退回
				if (this.m_GameStatus.isBet) {
					this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
					this.fucRevocation()
				}
				this.m_GameStatus.isBet = false  //不能再进行投注
				this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[1]
				GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
				this.m_ChipViewComponent.fucUpChipType(false)  
				this.fucPostMessage({type: "lotteryopen2", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
			}

			if (this.m_GameStatus.gameDownChipTime == 3) {
				SoundMgr.palystopSound()
				this.m_AnimationComponent.fucPlayStart(1)
			}

			//模拟玩家下注
			if (this.m_GameStatus.gameDownChipTime > 3 && this.m_GameStatus.gamestatus == 1) {
				let  a = [0, 2, 1];
				let  b = [0.4, 0.2,0.4];
				let count =2 + Math.round( Math.random()*10)
				let ChipNumber = [1,10,50,100,500,1000,5000,10000]
				let n_DeleyTiame= 0
				for (let index = 0; index < count; index++) {
					n_DeleyTiame=  Math.random()*1
					this.node.runAction(cc.sequence(cc.delayTime(n_DeleyTiame),cc.callFunc(()=>{
						this.fucUserPlaceBet(this.funcRandom(a,b),ChipNumber[Math.round(Math.random()*(ChipNumber.length-1))])
					})))
				}
			}
			
			if (this.m_GameStatus.gameDownChipTime <= 4 && this.m_GameStatus.gameDownChipTime >1){
				SoundMgr.palycountdownSound()
			}
		}
		//开奖 8秒状态   翻牌   等2秒   播放龙虎动画   移动筹码到庄  移动筹码到赢属性   移动筹码到玩家   结束
		else if (this.m_GameStatus.gamestatus == 2) {

			//每秒一次改
			if (this.m_GameStatus.gameDownChipTime > 12 && !GameInstInfo.getinstance().m_GameSettlement) {
				this.fucPostMessage({type: "lotteryopen2", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
			}
			//新游戏
			if (this.m_GameStatus.gameDownChipTime <= 1 ) {
				this.m_GameStatus.gameDownChipTime = 60

				this.m_GameStatus.gamestatus = 1
				this.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDTime()  - gameConfig.Bet_Reward_Time
				this.fucClear()
				this.m_AnimationComponent.fucPlayVS()
				this.fucCardsaction(true)
				this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[0]
				GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)

				this.m_ChipViewComponent.fucUpChipType(true)  

				this.m_GamePlayLab.getComponent(cc.Label).string = ""+this.m_GameStatus.inningCount

				this.fucPostMessage({type: "lotteryopen0", param: { method: "post", url: 'lotteryopen' ,data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"} } });
			}

			//翻牌动画  翻牌完成播放龙虎
			if (this.m_GameStatus.gameDownChipTime == 12) {
				//未获取到了游戏数据
				if (!GameInstInfo.getinstance().m_GameSettlement) {
					this.fucGameDisconnect()
					return
				}
				//开牌
				this.fucCardsOpen()
			}

			if (this.m_GameStatus.gameDownChipTime == 7) {
				this.fucGameEnd(this.m_GameStatus.dragonCard,this.m_GameStatus.tigerCard,1)
				//this.m_RecordsComponent.fucWiterData(this.m_GameStatus.dragonCard,this.m_GameStatus.tigerCard)
				this.fucPostMessage({type:"EndWritedata", param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
			}

			if (this.m_GameStatus.gameDownChipTime == 2) {
				this.fucCardsaction(false)
			}
			if (this.m_GameStatus.gameDownChipTime == 1) {
				this.m_AnimationComponent.fucPlayStart(0)
				SoundMgr.palystartSound()

				//这个地方请求自己金币变化
				this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
			}
		}

		//刷新倒计时
		let nBettStatus = this.upRoot.getChildByName('ndTime')
		let n_Labtime = nBettStatus.getChildByName('lbTime')
		n_Labtime.getComponent(cc.Label).string = "" + this.m_GameStatus.gameDownChipTime
	}

	//翻牌动作
	fucCardsOpen(){
		let self = this 
		this.m_CardsPk1Component.showPoker(self.m_GameStatus.dragonCard,1,function(){
			self.m_CardsPk2Component.showPoker(self.m_GameStatus.tigerCard,2,function(){
				//根据大小 延时2秒播放
				self.node.runAction(cc.sequence(cc.delayTime(1.5),cc.callFunc(()=>{
					if (self.m_GameStatus.tigerCard > self.m_GameStatus.dragonCard) {
						self.m_CardsPk2Component.fucPlayBrim()
					}else if(self.m_GameStatus.tigerCard < self.m_GameStatus.dragonCard){
						self.m_CardsPk1Component.fucPlayBrim()
					}else{
						self.m_CardsPk2Component.fucPlayBrim()
						self.m_CardsPk1Component.fucPlayBrim()
					}
				}),cc.delayTime(0.5),cc.callFunc(()=>{
					//播放
					self.fucGameEndAction(self.m_GameStatus.dragonCard,self.m_GameStatus.tigerCard,1)
				})))
			})
		})
	}

	fucGetWinTarget(){
		if (this.m_GameStatus.dragonCard >this.m_GameStatus.tigerCard) {
			return DETIndex.DragonID
		}else if (this.m_GameStatus.dragonCard < this.m_GameStatus.tigerCard) {
			return DETIndex.TigerID
		}
		return DETIndex.EqualityID
	}
	
	//游戏结束
	//@param  龙点数
	//@param  虎点数
	//@param  赢数目
	fucGameEnd(DragonNum,TigerspineNum,WinNum){
		let n_parent:cc.Node = null
		if (DragonNum  < TigerspineNum) {  //虎赢
			n_parent = this.middleRoot.getChildByName('tiger')
		}else if (DragonNum  > TigerspineNum) {   //龙赢
			n_parent = this.middleRoot.getChildByName('dragon')
		}else{  //和
			n_parent = this.middleRoot.getChildByName('equality')
		}

		let b_MoveStart  = false
		let b_MoveStart1  = false
		let n_ZhuangPosition  = this.upRoot.getPosition()
		let posSize = null
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			let nchip = this.m_AllChipNode[index];
			posSize = n_parent.getContentSize()
			if (nchip.x > n_parent.x  - posSize.width/2   && nchip.x < n_parent.x  + posSize.width/2  &&
				nchip.y > n_parent.y  - posSize.height/2  && nchip.y < n_parent.y  + posSize.height/2) {
				continue 
			}
			//随机位置 
			let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width)
			let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)

			//需要先到庄   显示 再到赢   再到玩家
			let delaytime  = 0.1 + Math.random()*0.2
			nchip.stopAllActions()
			nchip.runAction(cc.sequence(cc.delayTime(delaytime),cc.callFunc(()=>{
				//播放音效  只播放一次
				if (!b_MoveStart) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart = true
				}
			}),cc.moveTo(0.5,cc.v2(0,n_ZhuangPosition.y)),cc.hide(),cc.callFunc(()=>{
				//到庄后 扣部分  
				if (index < this.m_AllChipNode.length/2) {
					nchip.active = false
				}

			}), cc.delayTime(0.5),cc.show(),cc.callFunc(()=>{
				//播放音效  只播放一次
				if (!b_MoveStart1) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart1 = true
				}
			}), cc.moveTo(0.5,cc.v2(posx,posy)),cc.delayTime(0.3),cc.callFunc(()=>{
				let reparation = [1.198,16.83,1.198]
				this.fucMoveAllChip(this.m_GameStatus.betGold*this.m_jetton[this.fucGetWinTarget()]* reparation[this.fucGetWinTarget()])
			}),))
		}
	}

	fucPlayerWinNumber(){
		if (this.m_GameStatus.gameisfinish) {
			return
		}

		this.m_GameStatus.gameisfinish = true
		function fucMoveAction(Target:any,_count:number,angle:number,pos:cc.Vec3,TargetPos:cc.Vec2){
			let winLab =new cc.Node("winLab");
			let label=winLab.addComponent(cc.Label);
			label.string="+ "+_count

			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				label.string="+ "+_count/1000 + "k"
			}
			label.fontSize  = 40
			let color=new cc.Color(255,255,255);
			winLab.position=pos;
			winLab.color=color;
			Target.addChild(winLab)
			winLab.angle = angle;
			winLab.runAction(cc.sequence(cc.moveBy(1.5,TargetPos),cc.removeSelf()))
		}
		
		//在线玩家
		let myWin = 0
		GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {if (elem.PlayCode == "dtp"+(this.fucGetWinTarget()+1)){
			myWin = this.m_jetton[this.fucGetWinTarget()] * Number(elem.Bonus)
		}});
		//玩家自己
		let winAction = this.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
		fucMoveAction(winAction,myWin,0,new cc.Vec3(0,20,1),cc.v2(0,50))
	
		let win = Math.round(Math.random()*(this.m_GameStatus.betAllGold/3))
		let Palyer =this.middleRoot.getChildByName('Palyer_but')
		fucMoveAction(Palyer,win,0,new cc.Vec3(20,20,1),cc.v2(0,50))
	}

	//@param  赢数目
	fucMoveAllChip(WinNum){
		if (this.m_GameStatus.gameisMoveAllChip) {
			return
		}
		let b_MoveStart = false
		this.m_GameStatus.gameisMoveAllChip = true
		let  nchip = null
		let n_Tagposx = null
		let delaytime = 0
		for (let index = this.m_AllChipNode.length-1 ; index >=0; index--) {
			nchip = this.m_AllChipNode[index];
			n_Tagposx = this.middleRoot.getChildByName('Palyer_but').getPosition()
		
			delaytime  = 0.2 + Math.random()*0.4
			if (index > this.m_AllChipNode.length -10  && WinNum > 0 ) {
				n_Tagposx = this.middleRoot.getChildByName('ChipStartPos').getPosition()
				delaytime  = 0.1 + Math.random()*0.2
			}
			nchip.runAction(cc.sequence(cc.delayTime(delaytime),cc.moveTo(0.5,cc.v2(n_Tagposx.x,n_Tagposx.y)),cc.hide(),cc.callFunc(()=>{

				if (!b_MoveStart) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart = true
				}
				//
				this.fucPlayerWinNumber()
			}),cc.delayTime(0.2),cc.callFunc(()=>{
				if (index == 0) {
					this.fucClear()
				}
			})))
		}
	}

	//游戏结束  动画控制
	fucGameEndAction(DragonNum,TigerspineNum,WinNum){
		let n_parent:cc.Node = null
		let n_WinCard = 0
		if (DragonNum  < TigerspineNum) {  //虎赢
			n_parent = this.middleRoot.getChildByName('tiger')
			this.m_AnimationComponent.fucPlayWinTiger()
			n_WinCard = TigerspineNum
			
		}else if (DragonNum  > TigerspineNum) {   //龙赢
			n_parent = this.middleRoot.getChildByName('dragon')
			this.m_AnimationComponent.fucPlayWinDragon()
			n_WinCard = DragonNum
		}else{  //和
			n_parent = this.middleRoot.getChildByName('equality')
			this.m_AnimationComponent.fucPlayTie()
			n_WinCard = DragonNum
		}

		SoundMgr.palyCardsSound(n_WinCard)
		//显示亮底
		let desk_Hight = n_parent.getChildByName('desk_Hight')
		desk_Hight.active = true
		desk_Hight.runAction(cc.blink(4,8))
	}

	//游戏结束清理桌面
	fucClear(){
		let self  = this
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			this.onEnemyKilled(this.m_AllChipNode[index])
		}
		this.m_AllChipNode= []
		//隐藏亮底
		function ClearStatus(_str:string) {
			let n_parent = self.middleRoot.getChildByName(_str)
			let desk_Hight = n_parent.getChildByName('desk_Hight')
			desk_Hight.stopAllActions()
			desk_Hight.active = false
			let str_AllLab = n_parent.getChildByName("str_AllLab")
			str_AllLab.getComponent(cc.Label).string ="0"
		}
		ClearStatus("tiger")
		ClearStatus("dragon")
		ClearStatus("equality")
		this.m_GameStatus.betGold = 0
		this.fucUpDeskChipCount()

		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
		this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false

		this.m_GameStatus.isBet = true
		this.m_GameStatus.isFenPan = false
		this.m_GameStatus.gameisfinish = false
		this.m_GameStatus.gameisMoveAllChip = false
		this.m_GameStatus.betAllGold = 0

		this.m_jetton= [0,0,0]
		this.m_wheeljetton= [0,0,0]
		this.fucUpMyAmount()

		this.m_UserChipCount= [0,0,0]

		GameInstInfo.getinstance().m_GameSettlement = false
	}

	fucShowTips(_str,_time = 1.5){
		let str = this.m_GameTipsNode.getChildByName("strLabel")
		str.getComponent(cc.Label).string = _str
		this.m_GameTipsNode.stopAllActions()
		this.m_GameTipsNode.active =true
		this.m_GameTipsNode.runAction(cc.sequence(cc.show(),cc.delayTime(_time),cc.hide()))
	}
}