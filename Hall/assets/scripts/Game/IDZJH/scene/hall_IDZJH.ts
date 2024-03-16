
import GameEngine from "../../../control/engines/GameEngine";
import Http, { IHttpMethod } from "../../../control/engines/services/Core/Http";
import gameConfig from "../../../control/Game/configs/gameConfig";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ChipControl from "../../../Public/ControlScript/ChipControl";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import Compare from "../ControlScript/Compare_IDZJH";
import GameInfo from "../ControlScript/GameInfo_IDZJH";



const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("印度炸金花/大厅")
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


	@property({type:cc.Node,displayName:"游戏提示节点"})
	m_GameTipsNode :cc.Node = null

	@property({type:[cc.SpriteFrame],displayName:"投注"})
	m_SpriteFrame:cc.SpriteFrame[] = []

	m_GameSetNode :cc.Node = null
	@property({type:cc.Prefab,displayName:"设置"})
	m_settingprefab :cc.Prefab = null

	@property({type:cc.Prefab,displayName:"在线玩家"})
	m_OnlinePlayerprefab :cc.Prefab = null

	//所有下注节点
	m_AllDonwButNode = []

	//桌面6扑克
	m_CardPkPos = []
	m_CardsPk1 = []

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

	mInit = false

	m_scaleX = 0.35  //筹码原始缩放比列
	m_scaleY = 0.25  //筹码原始缩放比列

	//游戏场景数据
	m_DeskChip = []  //自己桌面上已下注筹码
	m_AllChipNode = [] //所有玩家下注的筹码

	m_DownCount = 6  //6个下注节点
	
	m_jetton = [0,0,0,0,0,0]   //自己下注筹码数据
	m_wheeljetton = [0,0,0,0,0,0]   //自己下注筹码数据

	//牌型算法
	m_Compare:Compare = new Compare();  

	m_GameStatus = {
		//局数
		inningCount: 20235555,
		//是否投注
		isBet: true,
		//是否封盘
		isFenPan:false,
		//投注金额
		betGold: 0,
		//总投注
		betAllGold:0,
		//游戏结果
		GameCardsData: [13, 7, 4, 10, 1, 9, 
						 4, 4, 4, 4, 3, 4],
		//区间
		betsectionGold:[],
		//游戏当前状态
		gamestatus : 1, //  1：投注   2：结束
		//下注操作倒计时
		gameDownChipTime : 15,
		//是否显示筹码
		gamechipshow:true,
		//是否结算
		gameisfinish:false,
		//所有筹码是否已分发完成
		gameisMoveAllChip:false,
		//自己携带金币
		mUserGold:1000000000000,
		//游戏id  37-39
		mlottery_code:2137,   
		//win 
		m_WinGold:0,
		//牌型结果
		Cardresult: [],
		//输赢比较
		m_nWinLose: [] 
	}

	m_LotteryType = ""

	m_enemyPool = null

	onLoad(): void {
		this.m_enemyPool = new cc.NodePool();
		let initCount = 1000;
		this.m_enemyPool.clear()
		for (let i = 0; i < initCount; ++i) {
			let enemy = cc.instantiate(this.nChipMode); 
			this.m_enemyPool.put(enemy); 
		}
	}

	createEnemy() {
		let enemy:cc.Node = null;
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

	onDisable(){
		this.node.removeFromParent()
	}

	protected start(): void {
		this.initDownRoot()
		this.initMiddleRoot()
		this.initGame()
		this.initAction()
		this.initUpRoot()
		this.initComponent()
		//播放背景音效
		SoundMgr.PlayBgMusic()
		this.initChangeImage()
		

		this.fucClear()
		this.mInit  =true

		//走断线重连
		GameInstInfo.getinstance().m_Disconnect = true
		if (GameInstInfo.getinstance().m_Disconnect) {
			this.node.getChildByName("Disconnect").active = true
		}

		//测试单机启动接口
		if(GameInstInfo.getinstance().publishingservice){
			GameInstInfo.getinstance().fucschedule(this,this.fucCountdown) 
			GameInstInfo.getinstance().m_Disconnect = false
			this.node.getChildByName("Disconnect").active = false
		}else{
			if (!cc.sys.isNative) {
				this.fucServerMessige()
			}
		}

		//测试接口
		// let  self = this
		// Http.request("lotteryopen",{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"},function(dtat){
		// 	console.log(" 红黑 lotteryopen--------",JSON.parse(dtat))
		// 	let JSonData = JSON.parse(dtat)
		// 	self.m_RecordsComponent.fucWiterData(JSonData.Data.item)

		// 	self.m_RecordVerComponent.fucShowNode()
		// 	self.m_RecordVerComponent.fucUpView(JSonData.Data.item)
		// },IHttpMethod.POST,false)

		//加载公共资源
		let  set_path =`Public/setting/${GameInstInfo.getinstance().fucgepath()}`;
		cc.resources.loadDir(set_path, cc.Asset, (completedCount, totalCount, item)=>{
		
		},(err, asset: cc.Asset[])=>{});
	}


	//加载消息接口
	fucPostMessage(data){
		if (!cc.sys.isNative &&  !GameInstInfo.getinstance().publishingservice) {
			window.parent.postMessage(data, '*');
		}
	}

	//游戏主动断线重连
	fucGameDisconnect(){
		let self =this
		GameInstInfo.getinstance().fucstopschedule(self)
		GameInstInfo.getinstance().m_Disconnect =  true
		self.node.getChildByName("Disconnect").active = true
		GameInstInfo.getinstance().m_GameIsReconnection = true
		let  fucCheckNet = function(){
			if (!GameInstInfo.getinstance().m_GameSettlement) {
				self.fucPostMessage({type:"NetworkException",param:{method:"post",url:'lotteryopen',data:{LotteryCode:self.m_GameStatus.mlottery_code,Resource:"500"} } })
				setTimeout(fucCheckNet, 1000*3)
			}
		}.bind(this)
		fucCheckNet()
	}

	fucCoCosgetMsg(e){
		if (!e.data.data) {
			return
		}
		let self =  this
		if (GameInstInfo.getinstance().m_Disconnect) {
			GameInstInfo.getinstance().m_Disconnect = false
			self.node.getChildByName("Disconnect").active = false
		}

		if (e.data.type == "userbalance") {
			//这是获取用户余额
			let lbCoin = self.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
			self.m_GameStatus.mUserGold = Math.floor(Number(e.data.data.Data.BackData))
			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				lbCoin.getComponent(cc.Label).string = (self.m_GameStatus.mUserGold/100).toFixed(0)
			}else{
				lbCoin.getComponent(cc.Label).string = (self.m_GameStatus.mUserGold/100).toFixed(0)
			}
			self.m_ChipViewComponent.fucUpButStatus(self.m_GameStatus.mUserGold/100)
			//这个地方要转最低起投
			self.m_ChipViewComponent.fucUpButStatus(GameInstInfo.getinstance().fucGameChipTransition(self.m_GameStatus.mUserGold))
		}
		else if(e.data.type =="addbetting"){
			self.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
			if (e.data.data && e.data.data.status == "1") {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("下注成功"),1.5)
				self.fucUserMoneyAddPlayer()
			}
			else{
				self.fucRevocation()
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("下注失败"),1.5)
			}
			for (let index = 0; index < self.m_DownCount; index++) {
				self.m_wheeljetton[index] = 0
			}
		}
		else if(e.data.type =="getrebate"){
			//这是获取赔率
			GameInstInfo.getinstance().m_GameRate = e.data.data.Data.item
			self.fucSetRate()
		}
		else if(e.data.type =="getbetrecord"){
			//这是获取投注记录
			self.m_BettingRecordComponent.fucUpdata(e.data.data.Data1.item)
		}
		else if(e.data.type =="getbetrecord1"){
			//这获取自己输赢  数据不及时  未启用
			self.m_GameStatus.m_WinGold = 0
			let inningCount = + (self.m_GameStatus.inningCount - 1)  
			let  max =  0
			for (let index = 0; index < e.data.data.Data1.item.length; index++) {
				let pair = e.data.data.Data1.item[index].betting_issuseNo.slice(4)
				if (inningCount == Number(pair) && e.data.data.Data1.item[index].Winning_amount) {
					max += Number(e.data.data.Data1.item[index].Winning_amount)
					
				}
			}
			self.m_GameStatus.m_WinGold = max
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
					bGetdata = true
					//获取开奖结果
					let result =  Item_data.LotteryOpen.split(",");
					let cardValue = []
					for (let index = 0; index < 10; index++) {
						let  element = Number(result[index])
						let  Color =  Number(result[ 10 + index])
						cardValue[index] =  element +  (Color -1)*13
					}
					self.m_GameStatus.GameCardsData = cardValue//cardValue.reverse()
					self.fucPuKersort()
				}
			}
			if (bGetdata) {
				GameInstInfo.getinstance().m_GameSettlement = true
				self.m_GameStatus.gameDownChipTime +=1  
				// self.unschedule(self.fucCountdown)
				// self.schedule(self.fucCountdown, 1.0, cc.macro.REPEAT_FOREVER, 1)
				//GameInstInfo.getinstance().fucstopschedule(self)
				GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
				self.m_RecordsComponent.fucWiterData(e.data.data.Data.item)
			}else{
				GameInstInfo.getinstance().m_Disconnect =  true
				self.node.getChildByName("Disconnect").active = true
				GameInstInfo.getinstance().m_GameIsReconnection = true
			}
			
		}
	   //这是获取开奖记录  只能调用一次
		else if(e.data.type == "lotteryopen1"){
			//清理桌面
			self.fucClear()  
			//开局获取 设置时间
			let n_Servertime  = e.data.data.Data.Servertime
			let Item_data = e.data.data.Data.item[0]
			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			self.m_GameStatus.inningCount = Number(pair) +1 
			self.m_GamePlayLab.getComponent(cc.Label).string = ""+self.m_GameStatus.inningCount
			self.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDownTime(n_Servertime,Item_data.UTC_TIME)  //获取倒计时
			
			if (self.m_GameStatus.gamestatus == 1) {
				let  a = [0, 1, 2,3,4,5]
				let  b = [0.4,0.1,0.4,0.5,0.2,0.5]
				let count =20 + Math.floor( Math.random()*20)
				let ChipNumber = [1,10,50,100,500,1000,5000,10000]
				for (let index = 0; index < count; index++) {
					self.fucReconnectBet(self.funcRandom(a,b),ChipNumber[Math.floor(Math.random()*(ChipNumber.length-4))])
				}
			}

			GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
			self.m_RecordsComponent.fucWiterData(e.data.data.Data.item)
		}else if(e.data.type == "lotteryopen2"){   //确认下注时调用
			let Item_data = e.data.data.Data.item[0]
		
			let betnumber= ["Red", "Black", "Hit"]
			let bettData = {betting_number:[],betting_money:[]}
			for (let index = 0; index < self.m_wheeljetton.length; index++) {
				if (self.m_wheeljetton[index] > 0) {
					bettData.betting_money.push(self.m_wheeljetton[index])
					bettData.betting_number.push(betnumber[index])
				}
			}
			if (bettData.betting_number.length <= 0 || bettData.betting_number.length <=0) {
				self.fucShowTips(GameEngine.m_services.i18nSrv.getI18nString("下注失败"),1.5)
				return
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
			self.fucPostMessage({type:"addbetting",param:{ method:"post",url:'addbetting',data:n_Data}})
		}else if(e.data.type == "lotteryopen3"){
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
				self.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDownTime(n_Servertime,Item_data.UTC_TIME)  //获取倒计时
				//游戏局数
				let pair = Item_data.IssueNo.slice(4)
				self.m_GameStatus.inningCount = Number(pair) +1 
				self.m_GamePlayLab.getComponent(cc.Label).string = ""+self.m_GameStatus.inningCount
		}
		else if(e.data.type == "EndWritedata"){
			let Item_data = e.data.data.Data.item[0]
			let  max =  0
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				let pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			//追加开奖结果  //断线重连不要再追加结果
			if (GameInstInfo.getinstance().m_GameIsReconnection ) {
				GameInstInfo.getinstance().m_GameIsReconnection = false
			}else{
				self.m_RecordsComponent.fucAddResult(Item_data)
			}
		}
		else if(e.data.type == "lotteryopen5"){
			let Item_data = e.data.data.Data.item
			self.m_RecordVerComponent.fucUpView(Item_data)
		}else if(e.data.type == "lotteryopen6"){
			GameInstInfo.getinstance().m_GameSettlement = true
			let Item_data = e.data.data.Data.item[0]
			let  max =  0
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				let pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			//游戏局数
			let pair = Item_data.IssueNo.slice(4)
			//获取到了上一局的牌
			if (self.m_GameStatus.inningCount - 1 == Number(pair)) {
				GameInstInfo.getinstance().m_GameSettlement = false   
			}
			//获取开奖结果
			//Item_data.LotteryOpen = '6,1,8,13,4,6,9,1,7,3,1,4,4,4,2,4,2,2,3,4'   //测试数据
			let result =  Item_data.LotteryOpen.split(",");
			
			let cardValue = []
			for (let index = 0; index < 6; index++) {
				let  element = Number(result[index])
				let  Color =  Number(result[ 6 + index])
				cardValue[index] =  element +  (Color -1)*13
			}
			self.m_GameStatus.GameCardsData = cardValue//cardValue.reverse()
			self.fucPuKersort()
		}
	}

	//游戏消息处理  自动请求
	fucServerMessige(){
		this.fucPostMessage({type:"getrebate",param:{method:"post",url:'getrebate',data:{LotteryType:this.m_LotteryType} } })  //fsc 修改
		this.fucPostMessage({type:"userbalance",param:{method:"post",url:'userbalance',data:{} } });
	}
	
	//多国语言适配Image
	initChangeImage(){

		let btnInning = this.upRoot.getChildByName('btnInning');  //左上角局数图片
		GameInstInfo.getinstance().fucPublicImage(btnInning)

		let table = this.upRoot.getChildByName('table');  //庄
		GameInstInfo.getinstance().fucPublicImage(table)

		table = this.node.getChildByName('middleRoot').getChildByName('Palyer_but').getChildByName('Background');  //在线玩家
		GameInstInfo.getinstance().fucPublicImage(table)

		let donwzhu = this.node.getChildByName('middleRoot').getChildByName("AllchipNum").getChildByName("desk_11");  //总下注
		GameInstInfo.getinstance().fucPublicImage(donwzhu)

		let but_Cancel = this.downRoot.getChildByName('ndBet').getChildByName('btnCancel').getChildByName('Background')
		GameInstInfo.getinstance().fucPublicImage(but_Cancel)

		let but_Sure = this.downRoot.getChildByName('ndBet').getChildByName('btnSure').getChildByName('Background')
		GameInstInfo.getinstance().fucPublicImage(but_Sure)
		//动画替换
		GameInstInfo.getinstance().fucChangeStartAnimation(this.m_AnimationComponent.Startspine)


		//赔率上6个图片需要动态更改 NNode
		let n_oddsNode = this.middleRoot.getChildByName('lossperNode')
		for (let index = 0; index < 6; index++) {
			const element = n_oddsNode.getChildByName(""+index)
			GameInstInfo.getinstance().fucChangeImage(element)	
		}

		//玩家A  玩家B
		let mb_img_board_player_b = this.ndBG.getChildByName('mb_img_board_player_b')
		GameInstInfo.getinstance().fucChangeImage(mb_img_board_player_b)
		let mb_img_board_player_a = this.ndBG.getChildByName('mb_img_board_player_a')
		GameInstInfo.getinstance().fucChangeImage(mb_img_board_player_a)
		let tx_player_a = this.ndBG.getChildByName('tx_player_a')
		GameInstInfo.getinstance().fucChangeImage(tx_player_a)
		let tx_player_b = this.ndBG.getChildByName('tx_player_b')
		GameInstInfo.getinstance().fucChangeImage(tx_player_b)
		
		

		//修改点数动画  
		let ShowAnimaName = ["ani_show-a9ac9989f","ani_show-a48e59337","ani_show-a48e59337","ani_show-4dd71841b","ani_show-fecfb5e4e","ani_show-c547a3826"]
		GameInstInfo.getinstance().fucChangeGameAnimation(this.m_AnimationComponent.ShowAnimation,ShowAnimaName)
		GameInstInfo.getinstance().fucChangeGameAnimation(this.m_AnimationComponent.ShowAnimation2,ShowAnimaName)
	}

	initGame() {
		//设置mlottery_code
		GameInstInfo.getinstance().m_GameData.findIndex((elem: any) => {
			if (elem[0] == "code") this.m_GameStatus.mlottery_code = Number(elem[1])
		});

		//启动游戏接口
		this.fucPostMessage({type:"lotteryopen1",param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
	

		this.fucCheckMenoy()
		this.fucUpMyAmount()

		//记录原始位置
		this.m_CardPkPos = []
		for (let index = 0; index < 6; index++) {
			this.m_CardsPk1[index] = this.node.getChildByName("betRoot").getChildByName("CardsMode"+(index+1))
			this.m_CardPkPos[index] = this.m_CardsPk1[index].getPosition()
		}
	
		if (GameInstInfo.getinstance().m_Disconnect) {
			this.fucDisconne(false)
		}
	}

	//动画控制器
	initAction(){
		this.m_AnimationComponent  = this.node.getChildByName("AnimtionNode").getComponent("AnimationControl_IDZJH")
		if (!GameInstInfo.getinstance().m_Disconnect) {
			this.m_AnimationComponent.fucPlayStart(0)
		}

		this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[0]
		GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
	}

	initUpRoot() {
		let but_version = this.upRoot.getChildByName("btnInning")
		but_version.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.m_RecordVerComponent.fucShowNode()
			this.fucPostMessage({type:"lotteryopen5",param:{ method:"post",url:'lotteryopen',data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource:"500"} } })
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
						self.m_GameExplainComponent =  instance.getComponent("GameExplain_IDZJH")
						self.m_GameExplainComponent.fucUpView()
						
					});   
				}else{
					this.node.getChildByName("nGameExplain").active = true
					this.m_GameExplainComponent.fucUpView()
				}
			}
			else if (index == 4) {
				this.m_BettingRecordComponent.fucUpView()
				this.fucPostMessage({type:"getbetrecord", param:{method:"post", url:'getbetrecord',data:{lottery_code:this.m_GameStatus.mlottery_code,LotteryType:this.m_LotteryType} } })
			}
		}.bind(this))

		let btnBack = this.upRoot.getChildByName('btnBack');
		btnBack.on(cc.Node.EventType.TOUCH_END,function() {
			//cc.game.end()
			window.parent.history.back()
		},this)
		//游戏局数
		this.m_GamePlayLab.getComponent(cc.Label).string = ""+this.m_GameStatus.inningCount
	}

	//初始化撤销 确认
	initDownRoot() {
		this.m_ChipViewComponent = this.m_ChipView.getComponent('ChipControl')
		//撤销
		let but_Cancel = this.downRoot.getChildByName('ndBet').getChildByName('btnCancel')
		but_Cancel.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			if (this.m_GameStatus.isBet) {
				//这个地方请求自己金币变化
				this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
				this.fucRevocation()
			}
		}.bind(this),this)

		//确认下注
		let but_Sure = this.downRoot.getChildByName('ndBet').getChildByName('btnSure')
		but_Sure.off(cc.Node.EventType.TOUCH_END)
		but_Sure.on(cc.Node.EventType.TOUCH_END,function(){
			if(!this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).enabled) return
			SoundMgr.palyButSound()
			for (let index = 0; index < this.m_DeskChip.length; index++) {
				let chipNode =  this.m_DeskChip[index];
				this.m_AllChipNode.push(chipNode)
			}
			this.m_DeskChip = []
			//发送下注消息
			this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
			this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).enabled = false
			this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false
			
			this.m_GameStatus.betAllGold += this.m_GameStatus.betGold
			this.fucPostMessage({type:"lotteryopen2", param: { method:"post", url:'lotteryopen',data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource:"500"} } })
		}.bind(this),this)
	} 

	//不规则区域点击
	checkBtnPolygonCollider(btn: cc.Node, e: cc.Event.EventTouch) {
        let collider = btn.getComponent(cc.PolygonCollider);
        let points = collider.points;
        let local = btn.convertToNodeSpaceAR(e.getLocation());
        let bHit = cc.Intersection.pointInPolygon(local, points);
        return bHit;
    }

	initMiddleRoot(){
		this.m_AllDonwButNode = []
		for (let index = 0; index < this.m_DownCount; index++) {
			let down_but = this.middleRoot.getChildByName('Down_node').getChildByName('Down_'+(index+1)) 
			down_but.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
				if (this.checkBtnPolygonCollider(down_but,e)) {
					this.fucPlaceBet(index)
				}
			}, this, true)
			this.m_AllDonwButNode.push(down_but)
		}

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

	//初始化脚本
	initComponent(){
		//初始化开将记录
		this.m_RecordsComponent =  this.node.getChildByName("nRecordLayout").getComponent("RecordLayout_IDZJH")
		//初始化历史记录
		this.m_RecordVerComponent=  this.node.getChildByName("nRecordRank").getComponent("RecordRank_IDZJH")
		this.m_RecordVerComponent.m_parent = this

		this.m_BettingRecordComponent =  this.node.getChildByName("nBettingRecord").getComponent("BettingRecord_IDZJH")
		//this.m_GameExplainComponent =  this.node.getChildByName("nGameExplain").getComponent("GameExplain_IDZJH")
	}

	//点牌移动   改成  0    5  1  6  2  7  3  8  4  9
	fucDisconne(_type,index = 0){
		if (index >= 6) {
			return
		}
		let self = this
		let n_Tim = 0.4  //0.2
		if (!_type) {
			n_Tim = 0
		}

		let sort = [0,5,1,2,3,4]  //发牌顺序
		sort = [0,1,2,3,4,5]
		
		let element = this.m_CardsPk1[sort[index]];
		element.setPosition(cc.v2(0,300))
		element.setScale(0)
		element.active = true
		let n_CardsPk1Component =element.getComponent("CardsMode_IDZJH")
		n_CardsPk1Component.fucShowBlack()
		
		SoundMgr.palySendCards()  //发牌
		element.stopAllActions()

		let n_posArray:cc.Vec2[] = []
		n_posArray[0] = cc.v2(0,300)
		n_posArray[1] = cc.v2(0,100)
		n_posArray[2] = cc.v2(this.m_CardPkPos[sort[index]].x,this.m_CardPkPos[sort[index]].y)

		element.runAction(cc.sequence(cc.show(),cc.delayTime(0.1),cc.callFunc(()=>{
			self.fucDisconne(_type,index+1)
		}),cc.spawn(cc.scaleTo(n_Tim,0.8,0.8),cc.bezierTo(n_Tim,n_posArray)),cc.scaleTo(0.2,1.0,1.0)))
	}
	//翻牌动作
	fucCardsOpen(start,end){
		if (start >= end) {
			return
		}
		let self = this
		if (start == end - 1) {
			self.unschedule(self.fucUpMoveCardsEND)
			self.scheduleOnce(self.fucUpMoveCardsEND,6.0)
			
			self.unschedule(self.fucPlayerSound)
			self.scheduleOnce(self.fucPlayerSound,1.0)
		}

		let element = this.m_CardsPk1[start];
		let n_CardsPk1Component =element.getComponent("CardsMode_IDZJH")
		n_CardsPk1Component.showPoker(this.m_GameStatus.GameCardsData[start],1,function(){
			
		})
		self.fucCardsOpen(start + 1,end)
	}

	//游戏结束时动画与音效
	fucPlayerSound(){

		//this.m_AnimationComponent.fucZhuangPk(this.m_GameStatus.Cardresult[1])
		//this.m_AnimationComponent.fucPlayPk(this.m_GameStatus.Cardresult[0])
		this.m_GameStatus.m_nWinLose = this.fucGetWinTarget()
		

		//牌型音效 对齐牌类型顺序 
		// let nameStr = ["hcard","pair","pair_2","kind_3","straight_2","flush","fullhouse","kind_4","straight","royal"]
		// this.node.stopAllActions()
		// this.node.runAction(cc.sequence(cc.callFunc(()=>{
		// 		SoundMgr.palyFishCrabsSound(nameStr[this.m_GameStatus.Cardresult[0]])
		// 	}),cc.delayTime(0.5),cc.callFunc(()=>{
		// 		SoundMgr.palyFishCrabsSound(nameStr[this.m_GameStatus.Cardresult[1]])
		// 	}),cc.delayTime(0.5),cc.callFunc(()=>{
			
		// 	})
		// ))
	}

	//扑克牌序
	fucPuKersort(){
		let sort = function(cards){
			cards.sort(function(a,b){
				a = a%13;b = b%13
				if (a == 1) a = 100
				if (b == 1) b = 100
				if (a == 0) a = 50
				if (b == 0) b = 50
				return ( a  - b );
			});
			return cards
		}
		
		let  cards = []
		for (let index = 0; index < 3; index++) {
			cards[index] = this.m_GameStatus.GameCardsData[index];	
		}
		let  cards1 = []
		for (let index = 3; index < 6; index++) {
			cards1[index-3] = this.m_GameStatus.GameCardsData[index];
		}
		cards = sort(cards)
		cards1 = sort(cards1)
		for (let index = 0; index < cards.length; index++) {
			this.m_GameStatus.GameCardsData[index] = cards[index];
		}
		for (let index = 3; index < 6; index++) {
			this.m_GameStatus.GameCardsData[index] = cards1[index-3];
		}
	}

	//计算牌型
	fucPipcount(){
		let  cards = []
		this.m_GameStatus.Cardresult = [0,0]
		for (let index = 0; index < 3; index++) {
			cards[index] = this.m_GameStatus.GameCardsData[index];	
		}
		this.m_GameStatus.Cardresult[0] = this.m_Compare.getHandsType(cards).handsType
		cards = []
		for (let index = 3; index < 6; index++) {
			cards[index-3] = this.m_GameStatus.GameCardsData[index];
		}
		this.m_GameStatus.Cardresult[1] = this.m_Compare.getHandsType(cards).handsType
		console.log("------牌型--------",this.m_GameStatus.Cardresult)
	}

	//扑克比大小   单独玩家的牌  两个玩家一起的牌  3条以上牌型  开6牌福利
	fucGetWinTarget(){

		//需要返回数组
		let CardRest = []
		//两手扑克合并取最大牌型   6福利
		if (this.m_Compare.getType(this.m_GameStatus.GameCardsData) >  this.m_Compare.PaiType.ST) {
			//压入2
			CardRest.push(1)
		}

		//玩家A对子 
		if (this.m_GameStatus.Cardresult[0] > this.m_Compare.JHPaiType.DUIZI) {
			CardRest.push(0)
		}

		//玩家B对子
		if (this.m_GameStatus.Cardresult[1] > this.m_Compare.JHPaiType.DUIZI) {
			CardRest.push(2)
		}

		//和 大 小
		let  cards_1 = []
		for (let index = 0; index < 3; index++) {
			cards_1[index] = this.m_GameStatus.GameCardsData[index];	
		}
		let  cards_2 = []
		for (let index = 3; index < 6; index++) {
			cards_2[index-3] = this.m_GameStatus.GameCardsData[index];
		}
		let n_reslt = this.m_Compare.compareCards(cards_1,cards_2)
		CardRest.push(n_reslt)

		return CardRest
	}

	fucUpMoveCardsEND(dt){
		let  n_EndPos = cc.v2(0,300)
		let n_Tim = 0.3
		for (let index = 0; index < this.m_CardsPk1.length; index++) {
			let element = this.m_CardsPk1[index];
			element.runAction(cc.sequence(cc.spawn(cc.scaleTo(n_Tim,0.1,0.1),cc.moveTo(n_Tim,n_EndPos)),cc.hide(), cc.callFunc(()=>{})) )
		}
		SoundMgr.palyXiCards()
		this.scheduleOnce(function(){
			this.fucDisconne(true)
		},5.0)
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
		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).enabled = true
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
	
		let nchip = this.createEnemy() //cc.instantiate(this.nChipMode) //
		//下注大小
		let nchipComponent = nchip.getComponent("ChipNode")
		nchip.active = true
		nchipComponent.fucSetNumber(nChipNumber)
		nchipComponent.fucBetArea(index)
		nchip.setPosition(cc.v2(0,-400))
		this.middleRoot.getChildByName("ChipNode").addChild(nchip)
		//随机位置 
		let n_parent = this.m_AllDonwButNode[index]
		let posSize = n_parent.getContentSize()
		let posx = n_parent.x  - posSize.width/2 + Math.random()*(posSize.width)
		let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)
		let pos = this.fucPolygonCollider(n_parent,nchip)
		posx = pos.x
		posy = pos.y

		//pos.y 越大  缩放就越小   300   /  150
		let n_scaleX = this.m_scaleX   -  Math.abs(150  + posy) /4000
		let n_scaleY = this.m_scaleY   -  Math.abs(150  + posy) /4000

		let n_Time = 0.4+GameInstInfo.getinstance().fucDistance(nchip.getPosition(),new cc.Vec2(posx,posy))/1500

		nchip.runAction(cc.sequence(cc.show(),cc.spawn(cc.scaleTo(n_Time,n_scaleX,n_scaleY),cc.moveTo(n_Time,cc.v2(posx,posy)).easing(cc.easeCubicActionOut())),cc.callFunc(()=>{
			SoundMgr.palyChipSound()
		})))
		//保存自己下注
		this.m_DeskChip.push(nchip)
		
		this.fucUpMyAmount()
		this.fucShowChip()

		let lbCoin = this.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
		lbCoin.getComponent(cc.Label).string = (this.m_GameStatus.mUserGold/100).toFixed(0)

		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			lbCoin.getComponent(cc.Label).string = (this.m_GameStatus.mUserGold/100).toFixed(0)
		}
	}

	//撤销
	fucRevocation(){
		for (let index = this.m_DeskChip.length-1; index >=0 ; index--) {
			let chipNode = this.m_DeskChip[index];
			chipNode.runAction(cc.sequence(cc.moveTo(0.5,cc.v2(this.middleRoot.getChildByName('TagerPos').getPosition())),cc.callFunc(()=>{
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
			let element = this.m_wheeljetton[index];
			//分单位转换
			this.m_jetton[index] -= element
		}
		
		for (let index = 0; index < this.m_DownCount; index++) {
			this.m_wheeljetton[index] = 0
		}

		this.fucUpMyAmount()
		this.m_GameStatus.betGold = 0
		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).enabled  = false
		this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false
	}

	fucUpMyAmount(){
		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		for (let index = 0; index < this.m_AllDonwButNode.length; index++) {
			let element = this.m_AllDonwButNode[index];
			let str_lab = element.getChildByName('userchipbg').getChildByName('str_Label')
			str_lab.getComponent(cc.Label).string = toThousands(this.m_jetton[index])

			if(this.m_jetton[index] > 1000){
				str_lab.getComponent(cc.Label).string = toThousands(this.m_jetton[index]/1000) + "k"
			}

			element.getChildByName('userchipbg').active = this.m_jetton[index] > 0 ? true : false
		}
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

	//不规则区域下注	
	fucPolygonCollider(btn: cc.Node,nchip: cc.Node) {
		let collider = btn.getComponent(cc.PolygonCollider);
		let points = collider.points;
		let posSize = btn.getContentSize()
		let posx =   nchip.getContentSize().width/2 + Math.random()*(posSize.width - nchip.getContentSize().width)  - posSize.width/2
		let posy =   nchip.getContentSize().height/2 + Math.random()*(posSize.height - nchip.getContentSize().height)  - posSize.height/2
		let bHit = cc.Intersection.pointInPolygon(cc.v2(posx,posy), points);
		while(!bHit){
			posx = nchip.getContentSize().width/2 + Math.random()*(posSize.width- nchip.getContentSize().width)  - posSize.width/2
			posy = nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height)  - posSize.height/2
		    bHit = cc.Intersection.pointInPolygon(cc.v2(posx,posy), points);
		}
		return  cc.v2(btn.x + posx, btn.y + posy);
	}
	
	//玩家下注
	fucUserPlaceBet(index,_number){
		let nchip = this.createEnemy()//cc.instantiate(this.nChipMode)
		//下注大小
		let nchipComponent = nchip.getComponent('ChipNode')
		nchip.active = true
		nchipComponent.fucSetNumber(_number)
		nchipComponent.fucBetArea(index)
		nchip.setPosition(this.middleRoot.getChildByName('Palyer_but').getPosition())
		this.middleRoot.getChildByName('ChipNode').addChild(nchip)
		this.fucUpDeskChipCount()
		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			this.m_GameStatus.betAllGold += _number*1000  
			this.m_GameStatus.betsectionGold[index]  += _number*1000
		}else{
			this.m_GameStatus.betAllGold += _number
			this.m_GameStatus.betsectionGold[index] += _number
		}

		//随机位置 
		let n_parent = this.m_AllDonwButNode[index]
		let posSize = n_parent.getContentSize()

		let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width)
		let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)

		let pos = this.fucPolygonCollider(n_parent,nchip)
		posx = pos.x
		posy = pos.y
		//pos.y 越大  缩放就越小   300   /  150
		let n_scaleX = this.m_scaleX   -  Math.abs(150  + posy) /4000
		let n_scaleY = this.m_scaleY   -  Math.abs(150  + posy) /4000

		let n_Time = 0.1 + GameInstInfo.getinstance().fucDistance(this.middleRoot.getChildByName('Palyer_but').getPosition(),new cc.Vec2(posx,posy))/1500
		let  self = this
		nchip.stopAllActions()
		nchip.runAction(cc.sequence(cc.show(),cc.spawn(cc.moveTo(n_Time,cc.v2(posx,posy)).easing(cc.easeCubicActionOut()),cc.scaleTo(n_Time,n_scaleX,n_scaleY)), cc.callFunc(()=>{
			SoundMgr.palyChipSound()
			//这里统计下注额度
			self.fucUpArerMoney(n_parent,self.m_GameStatus.betsectionGold[index])
		})))

		//保存其他玩家下注筹码
		this.m_AllChipNode.push(nchip)
		this.fucShowChip()
	}

	fucUserMoneyAddPlayer(){
		for (let index = 0; index < this.m_wheeljetton.length; index++) {
			const _number = this.m_wheeljetton[index];
			this.m_GameStatus.betAllGold += _number
			this.m_GameStatus.betsectionGold[index] +=  _number
			let n_parent = this.m_AllDonwButNode[index]
			//这里统计下注额度
			this.fucUpArerMoney(n_parent,this.m_GameStatus.betsectionGold[index])
		}
		this.fucUpDeskChipCount()
	}

	//模拟断线重连玩家下注
	fucReconnectBet(index,_number){
		let nchip =this.createEnemy()// cc.instantiate(this.nChipMode)
		//下注大小
		let nchipComponent = nchip.getComponent("ChipNode")
		nchipComponent.fucSetNumber(_number)
		nchipComponent.fucBetArea(index)
		
		this.m_GameStatus.betAllGold += _number

		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			this.m_GameStatus.betAllGold += _number*1000  
			this.m_GameStatus.betsectionGold[index]  += _number*1000
		}else{
			this.m_GameStatus.betAllGold += _number
			this.m_GameStatus.betsectionGold[index] += _number
		}

		this.fucUpDeskChipCount()

		nchip.active = true
		nchip.setPosition(this.middleRoot.getChildByName('Palyer_but').getPosition())
		//this.middleRoot.addChild(nchip)
		this.middleRoot.getChildByName('ChipNode').addChild(nchip)
		//随机位置 
		let n_parent = this.m_AllDonwButNode[index]
		let posSize = n_parent.getContentSize()
		let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width)
		let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)

		let pos = this.fucPolygonCollider(n_parent,nchip)
		posx = pos.x
		posy = pos.y
		//pos.y 越大  缩放就越小   300   /  150
		let n_scaleX = this.m_scaleX   -  Math.abs(150  + posy) /4000
		let n_scaleY = this.m_scaleY   -  Math.abs(150  + posy) /4000
		let  self = this
		nchip.stopAllActions()
		nchip.runAction(cc.sequence(cc.show(), cc.scaleTo(0,n_scaleX,n_scaleY),cc.moveTo(0,cc.v2(posx,posy)),cc.callFunc(()=>{
			//这里统计下注额度
			self.fucUpArerMoney(n_parent,self.m_GameStatus.betsectionGold[index])
		})))

		//保存其他玩家下注筹码
		this.m_AllChipNode.push(nchip)
		this.fucShowChip()
	}

	//是否显示筹码
	//是否显示筹码
	fucShowChip(){
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			this.m_AllChipNode[index].opacity = this.m_GameStatus.gamechipshow ? 255 :0
		}
		for (let index = 0; index < this.m_DeskChip.length; index++) {
			this.m_DeskChip[index].opacity = this.m_GameStatus.gamechipshow ? 255 :0
		}
	}

	//刷新总下注额度
	fucUpDeskChipCount(){
		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		
		if ( GameInstInfo.getinstance().m_curr == "VND") {
			this.nAllChipLab.string = `<color=#F0FF00>${toThousands(this.m_GameStatus.betAllGold/1000) }K</color>`
		}else{
			this.nAllChipLab.string = `<color=#F0FF00>${toThousands(this.m_GameStatus.betAllGold) }</color>`
		}
	}

	//自己下注后 加入总额
	fucUpArerMoney(node:cc.Node,money:any){
		function toThousands(num) {
			return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
		}
		let str_AllLab = node.getChildByName("allchipbg").getChildByName("str_AllLab") 
		str_AllLab.getComponent(cc.Label).string =""+toThousands(money)
		if (GameInstInfo.getinstance().m_curr == "VND" ) {
			str_AllLab.getComponent(cc.Label).string = ""+(money/1000) +"K"
		}
		node.getChildByName("allchipbg").active = money > 0 ? true:false
	}

	//游戏流程  前端自己跑
	fucCountdown(){
		this.m_GameStatus.gameDownChipTime -= 1
		if (this.m_GameStatus.gamestatus == 1) {
			if (this.m_GameStatus.gameDownChipTime == 5) {
				this.m_AnimationComponent.fucPlayStart(2)
				this.m_GameStatus.isFenPan = true
			}
			if(this.m_GameStatus.gameDownChipTime <= 1){
				this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
				this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).enabled = false
				this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false
			}
	
			if (this.m_GameStatus.gameDownChipTime <= 0 ) {
				this.m_GameStatus.gamestatus = 2
				SoundMgr.palyGamePublicSound("animation_vs")
			
				this.m_GameStatus.gameDownChipTime = gameConfig.Bet_Reward_Time
				//自己没有下注的退回
				if (this.m_GameStatus.isBet) {
					this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
					this.fucRevocation()
				}
				this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[1]
				GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
				this.m_ChipViewComponent.fucUpChipType(false)  
				this.m_GameStatus.isBet = false
				this.fucPostMessage({type:"lotteryopen6",param:{ method:"post",url:'lotteryopen',data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource:"500"} } },)

				this.m_AnimationComponent.fucPlayOpen(2,null,false)
			}

			//模拟玩家下注
			if (this.m_GameStatus.gameDownChipTime > 3 && this.m_GameStatus.gamestatus == 1) {
				let  a = [0, 1, 2,3,4,5]
				let  b = [0.4,0.1,0.4,0.5,0.2,0.5]
				let count = 2 + GameInstInfo.getinstance().fucPlayerPlaceBetSpeed()/3 + Math.floor( Math.random() * 5 )
				let ChipNumber = [1,10,50,100,500,1000,5000,10000]
				let n_DeleyTiame=  0
				for (let index = 0; index < count; index++) {
					n_DeleyTiame=  Math.random()*1
					this.node.runAction(cc.sequence(cc.delayTime(n_DeleyTiame),cc.callFunc(()=>{
						this.fucUserPlaceBet(this.funcRandom(a,b),ChipNumber[Math.floor(Math.random()*(ChipNumber.length-1))])
					})))
				}
			}
			if (this.m_GameStatus.gameDownChipTime <= 4 && this.m_GameStatus.gameDownChipTime >1){
				SoundMgr.palycountdownSound()
			}

			if (this.m_GameStatus.gameDownChipTime == 3) {
				SoundMgr.palystopSound()
				this.m_AnimationComponent.fucPlayStart(1)
			}
		}
		//开奖 8秒状态   翻牌   等2秒   播放龙虎动画   移动筹码到庄  移动筹码到赢属性   移动筹码到玩家   结束
		else if (this.m_GameStatus.gamestatus == 2) {
			if (this.m_GameStatus.gameDownChipTime >=  12 && !GameInstInfo.getinstance().m_GameSettlement) {
				//排序
				this.fucPostMessage({type:"lotteryopen6",param:{ method:"post",url:'lotteryopen',data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource:"500"} } },)
			}
			//新游戏
			if (this.m_GameStatus.gameDownChipTime <= 0 ) {
				this.m_GameStatus.gamestatus = 1
				this.m_GameStatus.gameDownChipTime = 8//GameInstInfo.getinstance().getDTime()-gameConfig.Bet_Reward_Time //默认时间秒
				this.fucClear()
				this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[0]
				GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
				this.m_ChipViewComponent.fucUpChipType(true)  
				//局数
				this.fucPostMessage({type:"lotteryopen3", param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
			}
			if (this.m_GameStatus.gameDownChipTime == 11) {
				//未获取到了游戏数据
				if (!GameInstInfo.getinstance().m_GameSettlement  && !GameInstInfo.getinstance().publishingservice) {
					this.fucGameDisconnect()
					return
				}
				//开牌

				//测试数据
				//获取开奖结果  12个  6张牌  
				let result = []
				for (let index = 0; index < 12; index++) {
					result[index] = Math.floor(Math.random()*13+1) 
					if (index>5) {
						result[index] = Math.floor(Math.random()*4+1)
					}
				}

				//result = [5, 5, 4, 4, 9, 4, 1, 2, 1, 3, 1, 4]
				console.log("测试数据:",result)
				let cardValue = []
				for (let index = 0; index < 6; index++) {
					let  element = Number(result[index])
					let  Color =  Number(result[ 6 + index])
					cardValue[index] =  element +  (Color -1)*13
				}
				this.m_GameStatus.GameCardsData = cardValue

				console.log("1",JSON.parse(JSON.stringify(this.m_GameStatus.GameCardsData)))
				GameInfo.getinstance().fucPkSort(this.m_GameStatus.GameCardsData)
				console.log("2",JSON.parse(JSON.stringify(this.m_GameStatus.GameCardsData)))

				//[8, 10, 9, 4, 4, 7, 3, 2, 1, 3, 4, 1]

				this.fucCardsOpen(0,3)
				this.fucCardsOpen(3,6)
				this.fucPipcount()
				//这个地方请求自己金币变化
				this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
			}
			if (this.m_GameStatus.gameDownChipTime == 6) {
				//动画播放完成
				this.fucGameEnd()
				this.fucGameEndAction()
				this.fucPostMessage({type:"EndWritedata", param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
			}
			if (this.m_GameStatus.gameDownChipTime == 1) {
				this.m_AnimationComponent.fucPlayStart(0)
				SoundMgr.palystartSound()

				this.m_AnimationComponent.fucPlayOpen(1,null,false)

				//这个地方请求自己金币变化
				this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
			}
		}
		//刷新倒计时
		let nBettStatus = this.upRoot.getChildByName('ndTime')
		let n_Labtime = nBettStatus.getChildByName('lbTime')
		n_Labtime.getComponent(cc.Label).string = "" + this.m_GameStatus.gameDownChipTime
	}

	

	//设置倍率   10个赔率
	fucSetRate(){
		for (let index = 0; index < 10; index++) {
			let str_Rate_lab = this.middleRoot.getChildByName('lossperNode').getChildByName("str_"+(index+1))
			GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {
				if (elem.PlayCode == "dtp1"){
					str_Rate_lab.getComponent(cc.Label).string = `1:${Number(elem.Bonus[index])/2 }`
				}
			});
		}
	}
	
	//游戏结束  组合中奖
	//@param  
	//@param  
	//@param  
	fucGameEnd(){
		let b_MoveStart  = false
		let n_ZhuangPosition  = this.upRoot.getPosition()
		let self = this
		let n_needMovechip = []
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			let  nchip = this.m_AllChipNode[index];
			//需要移动的筹码
			let nchipComponent = nchip.getComponent('ChipNode')
			if (nchipComponent.m_district != this.m_GameStatus.m_nWinLose) {
				n_needMovechip.push(nchip)
			}
		}

		for (let index = 0; index < n_needMovechip.length; index++) {
			let  nchip = n_needMovechip[index];
			//需要先到庄   显示 再到赢   再到玩家
			let delaytime  = 0.1 + Math.random()*0.2
			nchip.runAction(cc.sequence(cc.delayTime(delaytime),cc.callFunc(()=>{
				//播放音效  只播放一次
				if (!b_MoveStart) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart = true
				}
			}),cc.moveTo(0.5,cc.v2(0,n_ZhuangPosition.y)),cc.hide(),cc.callFunc(()=>{
				if (index == n_needMovechip.length-1) {
					let n_HiddenRatio  = 0.4  //庄家扣除率
					let needMovechi = []
					for (let index = 0; index < n_needMovechip.length *(1-n_HiddenRatio); index++) {
						const element = n_needMovechip[index];
						needMovechi.push(element)
					}
					self.fucMoveChipDesk(needMovechi)
				}
			})))
		}
	}

	//庄家扣除后均分
	fucMoveChipDesk(n_needMovechip){
		let b_MoveStart1  = false
		let n_result = this.fucGetWinTarget()
		let middleIndex = Math.ceil(n_needMovechip.length  / n_result.length); 
		let z_parentpos  = 0
		let n_parent:cc.Node = this.m_AllDonwButNode[n_result[z_parentpos]];
		for (let index = 0; index < n_needMovechip.length; index++) {
			let  nchip = n_needMovechip[index];
			//需要移动的筹码按结果均分 
			if (index  >= middleIndex) {
				middleIndex  += Math.ceil(n_needMovechip.length  / n_result.length)
				z_parentpos += 1
				n_parent = this.m_AllDonwButNode[n_result[z_parentpos]];
			}
			let posSize = n_parent.getContentSize()
			let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width-nchip.getContentSize().width/2)
			let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)

			let pos = this.fucPolygonCollider(n_parent,nchip)
			posx = pos.x
			posy = pos.y

			nchip.runAction(cc.sequence(cc.delayTime(0.5),cc.show(),cc.callFunc(()=>{
				//播放音效  只播放一次
				if (!b_MoveStart1) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart1 = true
				}
			}), cc.moveTo(0.5,cc.v2(posx,posy)),cc.delayTime(0.3),cc.callFunc(()=>{
				this.fucMoveAllChip()
			})))
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
				label.string="+ "+ (_count/1000) + "k"
			}
			label.fontSize  = 26
			let color=new cc.Color(255,255,255);
			winLab.position=pos;
			winLab.color=color;
			Target.addChild(winLab)
			winLab.angle = angle;
			winLab.runAction(cc.sequence(cc.moveBy(2.5,TargetPos),cc.removeSelf()))
		}
		//玩家自己
		let myWin = 0
		let dtp = ['cdp6','cdp4','cdp3','cdp5','cdp7','cdp2','cdp1','cdp8']
		let result = this.fucGetWinTarget()
		for (let index = 0; index < result.length; index++) {
			const element = result[index];
			GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {
				if (elem.PlayCode == dtp[element]){
					myWin += this.m_jetton[element] * (Number(elem.Bonus)/2)
				}
			});
		}

		let winAction = this.downRoot.getChildByName('ndBet').getChildByName("coin").getChildByName("lbCoin")
		fucMoveAction(winAction,myWin,0,new cc.Vec3(0,20,1),cc.v2(0,50))
		//在线玩家
		let win = Math.floor(Math.random()*(this.m_GameStatus.betAllGold/3))
		let Palyer =this.middleRoot.getChildByName('Palyer_but')
		fucMoveAction(Palyer,win,0,new cc.Vec3(0,20,1),cc.v2(0,50))
	}

	//@param  赢数目
	fucMoveAllChip(){
		if (this.m_GameStatus.gameisMoveAllChip) {
			return
		}
		let WinNum = 0
		let reparation = [15.84,1.98,1.98,15.84,15.84,1.98,1.98,15.84]
		let n_result = this.fucGetWinTarget()
		for (let index = 0; index < n_result.length; index++) {
			let element = n_result[index];
			WinNum += this.m_jetton[element]* reparation[element]
		}

		if (WinNum > 0) {
			this.m_AnimationComponent.fucPlayOpen(3,null,false)
		}

		let b_MoveStart = false
		this.m_GameStatus.gameisMoveAllChip = true
		for (let index = this.m_AllChipNode.length-1 ; index >=0; index--) {
			let  nchip = this.m_AllChipNode[index];
			let n_Tagposx = this.middleRoot.getChildByName('Palyer_but').getPosition()  
		
			let delaytime  = 0.2 + Math.random()*0.4
			if (index > this.m_AllChipNode.length -10  && WinNum > 0 ) {
				n_Tagposx = this.middleRoot.getChildByName('TagerPos').getPosition() 
				delaytime  = 0.1 + Math.random()*0.2
			}
			nchip.runAction(cc.sequence(cc.delayTime(delaytime),cc.moveTo(0.5,cc.v2(n_Tagposx.x,n_Tagposx.y)),cc.hide(),cc.callFunc(()=>{
				if (!b_MoveStart) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart = true
					this.fucPlayerWinNumber()
				}
			}),cc.delayTime(0.2),cc.callFunc(()=>{
				if (index == 0) {
					this.fucClear()
				}
			})))
		}
	}

	//游戏结束  动画控制
	fucGameEndAction(){
		let n_result = this.fucGetWinTarget()
		for (let index = 0; index < n_result.length; index++) {
			let n_parent = this.middleRoot.getChildByName('lossperNode').getChildByName('Down_'+(n_result[index]+1)) 
			//显示亮底
			let desk_Hight = n_parent.getChildByName('desk_Hight')
			desk_Hight.active = true
			desk_Hight.runAction(cc.blink(3,10))
		}
	}

	//游戏结束清理桌面
	fucClear(){
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			this.onEnemyKilled(this.m_AllChipNode[index])
		}
		this.m_AllChipNode= []
		//隐藏亮底
		function ClearStatus(n_parent) {
			
			let str_AllLab = n_parent.getChildByName("allchipbg").getChildByName("str_AllLab")
			str_AllLab.getComponent(cc.Label).string ="0"
			str_AllLab.parent.active = false
		}

		for (let index = 0; index < this.m_AllDonwButNode.length; index++) {
			const element = this.m_AllDonwButNode[index];
			ClearStatus(element)

			let n_parent = this.middleRoot.getChildByName('lossperNode').getChildByName('Down_'+(index+1))
			let desk_Hight = n_parent.getChildByName('desk_Hight')
			desk_Hight.stopAllActions()
			desk_Hight.active = false 
		}
	
		this.m_GameStatus.betGold = 0
		this.fucUpDeskChipCount()

		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).interactable = false
		this.downRoot.getChildByName('ndBet').getChildByName("btnSure").getComponent(cc.Button).enabled = false
		this.downRoot.getChildByName('ndBet').getChildByName("btnCancel").getComponent(cc.Button).interactable = false

		this.m_GameStatus.isBet = true
		this.m_GameStatus.isFenPan = false
		this.m_GameStatus.gameisfinish = false
		this.m_GameStatus.gameisMoveAllChip = false

		GameInstInfo.getinstance().m_GameSettlement = false
		
		this.m_GameStatus.betAllGold = 0

		this.fucUpMyAmount()
	
		for (let index = 0; index < this.m_DownCount; index++) {
			this.m_GameStatus.betsectionGold[index] = 0
			this.m_jetton[index] = 0
			this.m_wheeljetton[index] = 0
		}
	}

	fucCheckMenoy(){
		this.fucPostMessage({type:"userbalance",param:{ method:"post",url:'userbalance',data:{}}})
	}

	fucShowTips(_str,_time = 1.0){
		let str = this.m_GameTipsNode.getChildByName("strLabel")
		str.getComponent(cc.Label).string = _str
		this.m_GameTipsNode.stopAllActions()
		this.m_GameTipsNode.active =true
		this.m_GameTipsNode.runAction(cc.sequence(cc.show(),cc.delayTime(_time),cc.hide()))
	}
}