
import GameEngine from "../../../control/engines/GameEngine";
import Http, { IHttpMethod } from "../../../control/engines/services/Core/Http";
import gameConfig from "../../../control/Game/configs/gameConfig";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ChipControl from "../../../Public/ControlScript/ChipControl";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import PHWL from "../../../control/engines/GameEngine";


const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("百家乐/大厅")
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



	m_DownCount:Number = 3  //3个下注节点
	
	m_jetton = []   //自己下注筹码数据
	m_wheeljetton = []   //自己下注筹码数据

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
		
		//开牌结果
		TouziPonits:[1,2,3,4,5,0],
		//开牌花色
		m_CardsColor:[],
		//区间
		betsectionGold:[],
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
		mUserGold:1000000000000,
		//游戏id
		mlottery_code:2134,
		//win 
		m_WinGold:0,
		//下注区域定义Player
		m_betnumber: ["Player","Tie","Banker"]  //下注区域定义    //修改修改的值
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
		}

		if (!cc.sys.isNative) {
			this.fucServerMessige()
		}

		this.fucClear()

		this.mInit  =true
		
		//测试接口
		// let  self = this
		// Http.request("lotteryopen",{LotteryCode: this.m_GameStatus.mlottery_code,Resource: "500"},function(dtat){
		// 	let JSonData = JSON.parse(dtat)
		// },IHttpMethod.POST,false)

		//加载公共资源
		let  set_path =`Public/setting/${GameInstInfo.getinstance().fucgepath()}`;
		cc.resources.loadDir(set_path, cc.Asset, (completedCount, totalCount, item)=>{
		
		},(err, asset: cc.Asset[])=>{});
	}

	

	//加载消息接口
	fucPostMessage(data){
		if (!cc.sys.isNative) {
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
		//这是断线重连
		else if(e.data.type == "NetworkException"){
			//继续开当期奖
			let Item_data = e.data.data.Data.item[0]

			let bGetdata = false
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				Item_data = e.data.data.Data.item[index]
				let pair = Item_data.IssueNo.slice(4)
				if (self.m_GameStatus.inningCount == Number(pair)) {
					bGetdata = true
					//获取开奖结果
					let cardsColorStart = 0
					let result =  Item_data.LotteryOpen.split(",");

					let nxian   = false
					let nzhuang = false
					if (Number(result[0]) == 3 ) {
						
						self.m_GameStatus.TouziPonits[0] = Number(result[2])
						self.m_GameStatus.TouziPonits[1] = Number(result[3])
						self.m_GameStatus.TouziPonits[2] = Number(result[4])

						self.m_GameStatus.TouziPonits[3] = Number(result[5])
						self.m_GameStatus.TouziPonits[4] = Number(result[6])
						self.m_GameStatus.TouziPonits[5] = 0
						cardsColorStart = 7
						nzhuang = true
						//闲 3  庄 3
						if (Number(result[1]) == 3) {
							self.m_GameStatus.TouziPonits[5] = Number(result[7])
							cardsColorStart = 8
							nzhuang = false
						}
					}else{
						nxian = true
						self.m_GameStatus.TouziPonits[0] = Number(result[2])
						self.m_GameStatus.TouziPonits[1] = Number(result[3])
						self.m_GameStatus.TouziPonits[2] = 0
						self.m_GameStatus.TouziPonits[3] = Number(result[4])
						self.m_GameStatus.TouziPonits[4] = Number(result[5])
						self.m_GameStatus.TouziPonits[5] = 0
						nzhuang = true
						cardsColorStart = 6
						if (Number(result[1]) == 3) {
							self.m_GameStatus.TouziPonits[5] = Number(result[6])
							cardsColorStart = 7
							nzhuang = false
						}
					}


					self.m_GameStatus.m_CardsColor = []
					for (let index = cardsColorStart; index < result.length; index++) {
						self.m_GameStatus.m_CardsColor.push(result[index])
					}

					if (nxian) {
						self.m_GameStatus.m_CardsColor.splice(2,0,0)
					}

					if (nzhuang) {
						self.m_GameStatus.m_CardsColor.push(0)
					}
				}
			}

			if (bGetdata) {
				GameInstInfo.getinstance().m_GameSettlement = true
				self.m_GameStatus.gameDownChipTime +=1  

				GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
				self.m_RecordsComponent.initData(e.data.data.Data.item)
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

			// 加入断线重连效果
			if (self.m_GameStatus.gamestatus == 1) {
				let  a = [0,   1,  2];
				let  b = [0.6,0.1,0.6];
				let count =20 + Math.floor( Math.random()*20)
				let ChipNumber = [1,10,50,100,500,1000,5000,10000]
				for (let index = 0; index < count; index++) {	
					self.fucReconnectBet(self.funcRandom(a,b),ChipNumber[Math.floor(Math.random()*(ChipNumber.length-4))])
				}
			}
			
			GameInstInfo.getinstance().fucschedule(self,self.fucCountdown)
			self.m_RecordsComponent.initData(e.data.data.Data.item)
		}else if(e.data.type == "lotteryopen2"){   //确认下注时调用
			let Item_data = e.data.data.Data.item[0]
		
			let bettData = {betting_number:[],betting_money:[]}
			for (let index = 0; index < self.m_wheeljetton.length; index++) {
				if (self.m_wheeljetton[index] > 0) {
					bettData.betting_money.push(self.m_wheeljetton[index])
					bettData.betting_number.push(self.m_GameStatus.m_betnumber[index])
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
			let pair = null
			for (let index = 0; index < e.data.data.Data.item.length; index++) {
				pair = e.data.data.Data.item[index].IssueNo.slice(4)
				if (max < Number(pair) ) {
					max = Number(pair)
					Item_data = e.data.data.Data.item[index]
				}
			}
			self.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDownTime(n_Servertime,Item_data.UTC_TIME)  //获取倒计时
			//游戏局数
			pair = Item_data.IssueNo.slice(4)
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
				self.m_RecordsComponent.fucWiterData(Item_data)
			}
		}
		else if(e.data.type == "lotteryopen5"){
			let Item_data = e.data.data.Data.item
			self.m_RecordVerComponent.fucUpView(Item_data)
		}else if(e.data.type == "lotteryopen6"){

			GameInstInfo.getinstance().m_GameSettlement = true   //获取到了游戏数据
			
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
				let n_Servertime  = e.data.data.Data.Servertime
			}

			//获取开奖结果   //前两为张数   后面牌值   牌色
			let cardsColorStart = 0
			let result =  Item_data.LotteryOpen.split(",");
			let nxian   = false
			let nzhuang = false
			if (Number(result[0]) == 3 ) {
				
				self.m_GameStatus.TouziPonits[0] = Number(result[2])
				self.m_GameStatus.TouziPonits[1] = Number(result[3])
				self.m_GameStatus.TouziPonits[2] = Number(result[4])

				self.m_GameStatus.TouziPonits[3] = Number(result[5])
				self.m_GameStatus.TouziPonits[4] = Number(result[6])
				self.m_GameStatus.TouziPonits[5] = 0
				cardsColorStart = 7
				nzhuang = true
				//闲 3  庄 3
				if (Number(result[1]) == 3) {
					self.m_GameStatus.TouziPonits[5] = Number(result[7])
					cardsColorStart = 8
					nzhuang = false
				}
			}else{
				nxian = true
				self.m_GameStatus.TouziPonits[0] = Number(result[2])
				self.m_GameStatus.TouziPonits[1] = Number(result[3])
				self.m_GameStatus.TouziPonits[2] = 0
				self.m_GameStatus.TouziPonits[3] = Number(result[4])
				self.m_GameStatus.TouziPonits[4] = Number(result[5])
				self.m_GameStatus.TouziPonits[5] = 0
				nzhuang = true
				cardsColorStart = 6
				if (Number(result[1]) == 3) {
					self.m_GameStatus.TouziPonits[5] = Number(result[6])
					cardsColorStart = 7
					nzhuang = false
				}
			}


			self.m_GameStatus.m_CardsColor = []
			for (let index = cardsColorStart; index < result.length; index++) {
				self.m_GameStatus.m_CardsColor.push(result[index])
			}

			if (nxian) {
				self.m_GameStatus.m_CardsColor.splice(2,0,0)
			}

			if (nzhuang) {
				self.m_GameStatus.m_CardsColor.push(0)
			}
			//如：2,2,8,12,3,9,2,3  闲牌2张牌,庄牌2张牌,,闲点数8,12,庄点数3,9,闲牌花色2,庄牌花色3
		}
	}

	
	//游戏消息处理   初始化消息
	fucServerMessige(){
		//get_cancel_order  //获取订单详情
		this.fucPostMessage({type:"getrebate",param:{method:"post",url:'getrebate',data:{LotteryType:this.m_LotteryType} } }) 
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

		let zhuang = this.node.getChildByName("betRoot").getChildByName("mb_zhuang")
		GameInstInfo.getinstance().fucChangeImage(zhuang)

		let xian = this.node.getChildByName("betRoot").getChildByName("mb_xian")
		GameInstInfo.getinstance().fucChangeImage(xian)

		//动画替换
		GameInstInfo.getinstance().fucChangeStartAnimation(this.m_AnimationComponent.Startspine)
		//点数动画
		let ShowAnimaName = ["ani_show-a8b958bec","ani_show-baa50dd1e","ani_show-a86810091","ani_show-2ac5ba158","ani_show-dce6179b8","ani_show-da46b678d"]
		GameInstInfo.getinstance().fucChangeGameAnimation(this.m_AnimationComponent.ShowAnimation,ShowAnimaName)
		GameInstInfo.getinstance().fucChangeGameAnimation(this.m_AnimationComponent.ShowAnimation2,ShowAnimaName)
	

		//动画替换
		ShowAnimaName = ["ani_win-fa33a39ff","ani_win-88773db2a","ani_win-a0c06332c","ani_win-a932ef1ea","ani_win-47ed84848","ani_win-112b002c8"]
		GameInstInfo.getinstance().fucChangeGameAnimation(this.m_AnimationComponent.WinAnimation,ShowAnimaName)

		for (let index = 0; index < 3; index++) {
			let down_but = this.middleRoot.getChildByName('sp_Exp_node').getChildByName('Down_'+(index+1)).getChildByName("sp_Exp")
			GameInstInfo.getinstance().fucChangeImage(down_but)
		}

		//走势图 闲平庄  ybt
		for (let index = 0; index < 3; index++) {
			let SpriteNode = this.node.getChildByName("nRecordLayout").getChildByName('card00'+(index+1))
			GameInstInfo.getinstance().fucChangeImage(SpriteNode)
		}
	}

	initGame() {
		//设置mlottery_code
		GameInstInfo.getinstance().m_GameData.findIndex((elem: any) => {
			if (elem[0] == "code") this.m_GameStatus.mlottery_code = Number(elem[1])
		});

		//if (!cc.sys.isNative) {
			//this.schedule(this.fucCountdown, 1.0, cc.macro.REPEAT_FOREVER, 1)  //测试单机启动接口
			//启动游戏接口
		this.fucPostMessage({type:"lotteryopen1",param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
		// }else{
		// 	this.schedule(this.fucCountdown, 1.0, cc.macro.REPEAT_FOREVER, 1)
		// }

		this.fucCheckMenoy()
		this.fucUpMyAmount()


		//记录原始位置
		this.m_CardPkPos = []
		for (let index = 0; index < 6; index++) {
			this.m_CardsPk1[index] = this.node.getChildByName("betRoot").getChildByName("CardsMode"+(index+1))
			let  element = this.m_CardsPk1[index];
			this.m_CardPkPos[index] = element.getPosition()
		}
	
		if (GameInstInfo.getinstance().m_Disconnect) {
			this.fucDisconne(false)
		}
	}

	//动画控制器
	initAction(){
		this.m_AnimationComponent  = this.node.getChildByName("AnimtionNode").getComponent("AnimationControl_Baccarat")

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
						self.m_GameExplainComponent =  instance.getComponent("GameExplain_Baccarat")
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
				this.m_AllChipNode.push(this.m_DeskChip[index])
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
		this.m_DownCount = 3
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
		this.m_RecordsComponent =  this.node.getChildByName("nRecordLayout").getComponent("RecordLayout_Baccarat")
		//初始化历史记录
		this.m_RecordVerComponent=  this.node.getChildByName("nRecordRank").getComponent("RecordRank_Baccarat")
		this.m_RecordVerComponent.m_parent = this

		this.m_BettingRecordComponent =  this.node.getChildByName("nBettingRecord").getComponent("BettingRecord_Baccarat")
		//this.m_GameExplainComponent =  this.node.getChildByName("nGameExplain").getComponent("GameExplain_Baccarat")
	}


	//点牌移动
	fucDisconne(_type,index = 0){
		if (index >= this.m_GameStatus.TouziPonits.length) {
			return
		}
		let self = this
		let n_Tim = 0.5
		if (!_type) {
			n_Tim = 0
		}
		// 0 1 2
		// 3 4 5
		let sort = [0,3,1,4,2,5]  //发牌顺序
		sort = [0,1,2,3,4,5]  //发牌顺序  

		let element = this.m_CardsPk1[sort[index]];
		element.setPosition(cc.v2(150,-30))
		element.setScale(0)
		element.active = true
		element.stopAllActions()
		let n_CardsPk1Component =element.getComponent("CardsMode_Baccarat")
		n_CardsPk1Component.fucShowBlack()
		if (sort[index] == 2 || sort[index] == 5 ) {
			element.setPosition(this.m_CardPkPos[sort[index]])
			self.fucDisconne(_type,index+1)
			return
		}

		SoundMgr.palySendCards()  //发牌
		element.runAction(cc.sequence(cc.show(),cc.spawn(cc.scaleTo(n_Tim,0.5,0.5),cc.moveTo(n_Tim,cc.v2(this.m_CardPkPos[sort[index]].x,this.m_CardPkPos[sort[index]].y))),cc.callFunc(()=>{
			self.fucDisconne(_type,index+1)
		}),cc.scaleTo(0.2,0.6,0.6)))	
	}

	//pk放大动作
	fucCardsscaleTo(){
		// 0 1 2
		// 3 4 5
		let n_cards = [0,1,3,4]  //需要放大的扑克牌
		for (let index = 0; index < n_cards.length; index++) {
			const element = this.m_CardsPk1[n_cards[index]];
			if (index == n_cards.length-1) {
				element.runAction(cc.sequence(cc.scaleTo(0.5,0.8,0.8),cc.callFunc(()=>{
					//开牌
					this.fucCardsOpen(0)
				})))
			}else{
				element.runAction(cc.scaleTo(0.5,0.8,0.8)) 
			}
		}
	}

	//翻牌动作
	fucCardsOpen(index){
		if (index > this.m_GameStatus.TouziPonits.length) {
			return
		}
		let self = this
		//翻牌完成判断补牌操作
		if (index == this.m_CardsPk1.length-1) {
			let fucMoveCards = function(index){
				if (this.m_GameStatus.TouziPonits[index] != 0) {
					let elet = this.m_CardsPk1[index];
					elet.setPosition(cc.v2(150,-30))
					elet.active = true
					elet.runAction(cc.sequence(cc.show(),cc.rotateTo(0,90)))
					let n_CardsPk1Component =elet.getComponent("CardsMode_Baccarat")
					elet.runAction(cc.sequence(cc.show(),cc.spawn(cc.scaleTo(0.2,0.5,0.5),cc.moveTo(0.2,cc.v2(this.m_CardPkPos[index].x,this.m_CardPkPos[index].y))),cc.rotateTo(0.2,180), cc.callFunc(()=>{
						n_CardsPk1Component.showPoker(self.m_GameStatus.TouziPonits[index],this.m_GameStatus.m_CardsColor[index],function(){
							self.unschedule(self.fucUpMoveCardsEND)
							self.scheduleOnce(self.fucUpMoveCardsEND,5.0)
						})
					}),cc.scaleTo(0.2,0.8,0.8)))	
				}
			}.bind(this)
			fucMoveCards(2)  //补牌
			fucMoveCards(5)

			if (this.m_GameStatus.TouziPonits[5] == 0  && this.m_GameStatus.TouziPonits[2]==0) {
				self.unschedule(self.fucUpMoveCardsEND)
				self.scheduleOnce(self.fucUpMoveCardsEND,5.0)
			}

			this.scheduleOnce(function(){
				this.m_AnimationComponent.fucZhuangPk(this.fucPipcount()[1])
			 	this.m_AnimationComponent.fucPlayPk(this.fucPipcount()[0])

				 this.fucPlayerSound()
			},2.0)
			return
		}

		let element = this.m_CardsPk1[index];
		if (index==2 || index == 5) {
			self.fucCardsOpen(index + 1)
			return
		}
		element.stopAllActions()
		let n_CardsPk1Component =element.getComponent("CardsMode_Baccarat")
		n_CardsPk1Component.showPoker(this.m_GameStatus.TouziPonits[index],this.m_GameStatus.m_CardsColor[index] ,function(){
			self.fucCardsOpen(index + 1)
		})
	}

	//播放游戏结束音效
	fucPlayerSound(){
		let nameStr = ["banker_","player_","bwin","pwin","tie"]
		this.node.stopAllActions()
		this.node.runAction(cc.sequence(cc.callFunc(()=>{
				SoundMgr.palyFishCrabsSound(nameStr[1]+ this.fucPipcount()[0])
			}),cc.delayTime(1.0),cc.callFunc(()=>{
				SoundMgr.palyFishCrabsSound(nameStr[0]+ this.fucPipcount()[1])
			}),cc.delayTime(1.5),cc.callFunc(()=>{
				if (this.fucPipcount()[0] == this.fucPipcount()[1]) {
					SoundMgr.palyFishCrabsSound(nameStr[4])
				}else if (this.fucPipcount()[1] > this.fucPipcount()[0]) {
					SoundMgr.palyFishCrabsSound(nameStr[2])
				}else{
					SoundMgr.palyFishCrabsSound(nameStr[3])
				}
			})
		))
	}

	//计算点数
	fucPipcount(){
		let result = [0,0]
		let element = this.m_GameStatus.TouziPonits[0];
		for (let index = 0; index < this.m_GameStatus.TouziPonits.length-3; index++) {
			 element = this.m_GameStatus.TouziPonits[index];
			if (element>=10 ) {
				result[0] +=0
			}else{
				result[0] +=element
			}
			if (result[0]>=10) {
				result[0] = result[0]-10
			}
		}

		for (let index = 3; index < this.m_GameStatus.TouziPonits.length; index++) {
			element = this.m_GameStatus.TouziPonits[index];
			if (element>=10 ) {
				result[1] +=0
			}else{
				result[1] +=element
			}
			if (result[1]>=10) {
				result[1] = result[1]-10
			}
		}
		return result
	}

	fucUpMoveCardsEND(dt){
		let  n_EndPos = cc.v2(-170,-30)
		let n_Tim = 0.3
		let element = this.m_CardsPk1[0];
		for (let index = 0; index < this.m_CardsPk1.length; index++) {
			element = this.m_CardsPk1[index];
			element.runAction(cc.sequence(cc.spawn(cc.scaleTo(n_Tim,0.1,0.1),cc.moveTo(n_Tim,n_EndPos)),cc.hide(), cc.callFunc(()=>{

			})) )
		}
		this.scheduleOnce(function(){
			SoundMgr.palyXiCards()
		},3.0)
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
		let n_Time = 0.4 + GameInstInfo.getinstance().fucDistance(nchip.getPosition(),new cc.Vec2(posx,posy))/1500
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

		let n_Time = 0.4 + GameInstInfo.getinstance().fucDistance(this.middleRoot.getChildByName('Palyer_but').getPosition(),new cc.Vec2(posx,posy))/1500
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
	fucShowChip(){
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			let  nchip = this.m_AllChipNode[index];
			nchip.opacity = this.m_GameStatus.gamechipshow ? 255 :0
		}
		for (let index = 0; index < this.m_DeskChip.length; index++) {
			let  nchip = this.m_DeskChip[index];
			nchip.opacity = this.m_GameStatus.gamechipshow ? 255 :0
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
			}

			if (this.m_GameStatus.gameDownChipTime == 3) {
				SoundMgr.palystopSound()
				this.m_AnimationComponent.fucPlayStart(1)
			}

			//模拟玩家下注
			if (this.m_GameStatus.gameDownChipTime > 3 && this.m_GameStatus.gamestatus == 1) {
				let  a = [0, 1, 2];
				let  b = [0.6,0.1,0.6];
				let count =GameInstInfo.getinstance().fucPlayerPlaceBetSpeed()/3 + Math.floor( Math.random() * 5 )
				let ChipNumber = [1,10,50,100,500,1000,5000,10000]
				let n_DeleyTiame= 0
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
		}
		//开奖 8秒状态   翻牌   等2秒   播放龙虎动画   移动筹码到庄  移动筹码到赢属性   移动筹码到玩家   结束
		else if (this.m_GameStatus.gamestatus == 2) {
			if (this.m_GameStatus.gameDownChipTime >=  12  && !GameInstInfo.getinstance().m_GameSettlement ) {
				this.fucPostMessage({type:"lotteryopen6",param:{ method:"post",url:'lotteryopen',data:{LotteryCode: this.m_GameStatus.mlottery_code,Resource:"500"} } },)
			}
			//新游戏
			if (this.m_GameStatus.gameDownChipTime <= 0 ) {
				this.m_GameStatus.gamestatus = 1
				this.m_GameStatus.gameDownChipTime = GameInstInfo.getinstance().getDTime()-gameConfig.Bet_Reward_Time //默认时间秒
				this.fucClear()
				this.m_GameStatusLab.getComponent(cc.Sprite).spriteFrame = this.m_SpriteFrame[0]
				GameInstInfo.getinstance().fucPublicImage(this.m_GameStatusLab.node)
				this.m_ChipViewComponent.fucUpChipType(true)  
				//局数
				this.fucPostMessage({type:"lotteryopen3", param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
			}
			if (this.m_GameStatus.gameDownChipTime == 11) {
				//未获取到了游戏数据  进行重连
				if (!GameInstInfo.getinstance().m_GameSettlement) {
					this.unschedule(this.fucCountdown)
					this.fucGameDisconnect()  
					return
				}
				//进行PK放大
				this.fucCardsscaleTo()
			}

			if (this.m_GameStatus.gameDownChipTime == 7) {
				//动画播放完成
				this.fucGameEnd()
				this.fucGameEndAction()

				this.fucPostMessage({type:"EndWritedata", param:{method:"post",url:'lotteryopen',data:{LotteryCode:this.m_GameStatus.mlottery_code,Resource:"500"} } })
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

	//设置倍率   3个赔率
	fucSetRate(){
		for (let index = 0; index < 3; index++) {
			let str_Rate_lab = this.middleRoot.getChildByName('lossperNode').getChildByName("str_"+(index+1))
			GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {
				if (elem.PlayCode == "dtp1"){
					str_Rate_lab.getComponent(cc.Label).string = `1:${Number(elem.Bonus[index])/2 }`
				}
			});
		}
	}
	//  6张扑克比大小
	fucGetWinTarget(){
		return (this.fucPipcount()[1] > this.fucPipcount()[0] ) ? 2 : ( this.fucPipcount()[1] < this.fucPipcount()[0] ) ? 0 : 1
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
		let n_result = this.fucGetWinTarget()
		
		for (let index = 0; index < this.m_AllChipNode.length; index++) {
			let  nchip = this.m_AllChipNode[index];
			//需要移动的筹码
			let nchipComponent = nchip.getComponent('ChipNode')
			if (nchipComponent.m_district != n_result) {
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
		let n_parent:cc.Node = this.m_AllDonwButNode[n_result];
		for (let index = 0; index < n_needMovechip.length; index++) {
			let  nchip = n_needMovechip[index];
			
			let posSize = n_parent.getContentSize()
			let posx = n_parent.x  - posSize.width/2  + Math.random()*(posSize.width)
			let posy = n_parent.y  - posSize.height/2 + nchip.getContentSize().height/2 + Math.random()*(posSize.height-nchip.getContentSize().height/2)

			let pos = this.fucPolygonCollider(n_parent,nchip)
			posx = pos.x
			posy = pos.y
			//pos.y 越大  缩放就越小   300   /  150
			let n_scaleX = this.m_scaleX   -  Math.abs(150  + posy) /3000
			let n_scaleY = this.m_scaleY   -  Math.abs(150  + posy) /3000

			nchip.runAction(cc.sequence(cc.delayTime(0.5),cc.show(),cc.callFunc(()=>{
				//播放音效  只播放一次
				if (!b_MoveStart1) {
					SoundMgr.palyMoveChipSound()
					b_MoveStart1 = true
				}
			}),cc.spawn(cc.scaleTo(0.5,n_scaleX,n_scaleY),cc.moveTo(0.5,cc.v2(posx,posy))),cc.delayTime(0.3),cc.callFunc(()=>{
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
			label.fontSize  = 40
			let color=new cc.Color(255,255,255);
			winLab.position=pos;
			winLab.color=color;
			Target.addChild(winLab)
			winLab.angle = angle;
			winLab.runAction(cc.sequence(cc.moveBy(1.5,TargetPos),cc.removeSelf()))
		}
		//玩家自己   //dtp  需要修改
		let myWin = this.m_jetton[this.fucGetWinTarget()]
		GameInstInfo.getinstance().m_GameRate.findIndex((elem: any) => {if (elem.PlayCode == "dtp1"){
			myWin = this.m_jetton[this.fucGetWinTarget()] * Number(elem.Bonus[this.fucGetWinTarget()])
		}});

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
		this.m_AnimationComponent.fucPlayOpen(this.m_GameStatus.TouziPonits,function(index){
			//动画播放完成
		
		}.bind(this),false)
		let n_result = this.fucGetWinTarget()
		let element = n_result ? n_result : 1;
		let WinNum = this.m_jetton[element]* 1  //需要计算比列
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
		const n_parent =this.m_AllDonwButNode[n_result]
		//显示亮底
		let desk_Hight = n_parent.getChildByName('desk_Hight')
		desk_Hight.active = true
		desk_Hight.runAction(cc.blink(3,10))
		//播放赢动画
		this.m_AnimationComponent.fucPlayWin(n_result)
	}

	//游戏结束清理桌面
	fucClear(){
		for (let index = this.m_AllChipNode.length-1; index >= 0; index--) {
			let  element = this.m_AllChipNode[index];
			element.runAction(cc.show())
			this.onEnemyKilled(element)
		}

		this.m_AllChipNode= []
		//隐藏亮底
		function ClearStatus(n_parent) {
			let desk_Hight = n_parent.getChildByName('desk_Hight')
			desk_Hight.stopAllActions()
			desk_Hight.active = false
			let str_AllLab = n_parent.getChildByName("allchipbg").getChildByName("str_AllLab")
			str_AllLab.getComponent(cc.Label).string ="0"
			str_AllLab.parent.active = false
		}

		for (let index = 0; index < this.m_AllDonwButNode.length; index++) {
			const element = this.m_AllDonwButNode[index];
			ClearStatus(element)
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
		this.m_GameStatus.betAllGold = 0


		GameInstInfo.getinstance().m_GameSettlement = false  //没局结束重置是否获取到游戏数据

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