// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine, { manager } from "../../control/engines/GameEngine";
import SubgameConfig from "./SubgameConfig";

//公用模块
export default class GameInstInfo  {
	protected className: string = "视图图片多国语言适配";

	private static m_instance: GameInstInfo = null;

	public m_GameData = []  //网页链接数据

	public m_GameRate = []  //游戏赔率

	public m_curr:string ="USD"  //curr==='VND' 越南盾 其他的就USD

	public m_long:string ="cn"  //语言

	public m_SelectGameID = 0
	public GameName:string = ""

	public m_Disconnect:boolean = false

	//是否获取到游戏数据
	public m_GameSettlement:boolean = false
	//当前局是否是断线重连   用于走势图追加结果
	public m_GameIsReconnection:boolean = false

	//是否单机测试   发布线上改false
	public publishingservice:boolean =false

	//子游戏注册流程
	private _subgameMap: Map<number, SubgameConfig> = new Map();
	public registerSubgame(subgame: SubgameConfig): boolean {
		if (!subgame) {
		  return false;
		}
		if (subgame.gameID <= 0) {
		  return false;
		}
		if (this._subgameMap.has(subgame.gameID)) {
		  return false;
		}
		this._subgameMap.set(subgame.gameID, subgame);
		return true;
	  }

	public getSubgameByGameID(gameID: number): SubgameConfig {
		return this._subgameMap.get(gameID);
	}
	//

	static getinstance(){
		if (!this.m_instance) {
			this.m_instance = new GameInstInfo()
		}
		return this.m_instance
	}

	//保留两位小数
	toDecimal(x) {
		var f = parseFloat(x);
		if (isNaN(f)) {
		  return;
		}
		f = Math.round(x*100)/100;
		return f;
	}

	//  添加游戏名字  文件夹名字
	fucSetGameName(){
		this.GameName = "ColorDish"
		this.m_GameData.findIndex((elem: any) => {
			if (elem[0] == "code") {
				this.m_SelectGameID = Number(elem[1])  //选择的游戏ID
			}
		});
		this.GameName = this.getSubgameByGameID(this.m_SelectGameID).gameName
		//设置基本声音路径
		GameEngine.m_managers.soundMgr.setSoundUrl(`Game/${this.getSubgameByGameID(this.m_SelectGameID).gameName}/resources/preload/sound/`)
	}

	//
	getDTime(){
		return this.getSubgameByGameID(this.m_SelectGameID).gameTime
	}

	fucDistance(pos1:cc.Vec2,pos2:cc.Vec2){
		let dx = pos2.x - pos1.x
		let dy = pos2.y = pos1.y
		return Math.floor( Math.sqrt(dx*dx + dy*dy))
	}

	//300 -20   30-60
	fucPlayerPlaceBetSpeed(){
		let count = 60
		switch (this.getDTime() ) {
			case 30: 
				count = 15
				break;
			case 60:
				count = 12
				break;
			case 120: 
				count = 10
				break;
			case 180: 
				count = 8
				break;
			case 300: 
				count = 6
				break;
			default:
				break;
		}
		return count
	}

	getDownTime(nServertime,opentime){
		let Interval =  this.getSubgameByGameID(this.m_SelectGameID).gameTime
		return Math.floor(opentime + Interval - nServertime/1000)+2 //服务器时间直接取  多加2秒
	}

	//矫正定时器
	m_callback = null
	fucschedule(self,callbcak) {
        let  then = Date.now();
        let interval = 1*1000;  //秒
		this.fucstopschedule(self)
		this.m_callback = function () {
			let now = Date.now();
            let delta = now - then;
            if(delta > interval){
                then = now - (delta % interval);
                callbcak.call(this);
            }
		}
		self.schedule(this.m_callback, 0.3);
	}
	
	fucstopschedule(self){
		if (this.m_callback) {
			self.unschedule(this.m_callback)
			this.m_callback = null
		}
	}

	//图片路径
	I18nLanguagePath=[
		//简体中文
		"ZH_CN" ,
		//英文
		"EN" ,
		//印度
		"ID",
		//泰
		"TH" ,
		//印尼
		"IN" ,
		//越南
		"VN",
		//日本
		"JP",
		//韩国
		"KR"
	]

	fucgepath(){
		return this.I18nLanguagePath[GameEngine.m_services.i18nSrv.getI18nSetting()]
	}


	//游戏内部图
	fucChangeImage(node:cc.Node){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let str_ImageName = node.getComponent(cc.Sprite).spriteFrame.name
		const path =`Game/${this.GameName}/resources/loadRes/img/phoneBet/${this.fucgepath()}/${str_ImageName}`
		manager().resourceMgr.loadImage(path, node);
	}

	//指定 路径name
	fucChangeImagePathName(node:cc.Node,name:string){
		manager().resourceMgr.loadImage(name, node);
	}

	fucChangeImageName(node:cc.Node,name:string){
		const path =`Game/${this.GameName}/resources/loadRes/img/phoneBet/${this.fucgepath()}/${name}`
		manager().resourceMgr.loadImage(path, node);
	}

	//公用图片
	async fucPublicImage(node:cc.Node){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let str_ImageName = node.getComponent(cc.Sprite).spriteFrame.name
		const path =`Public/phoneBet/`
		await manager().resourceMgr.loadImage(`${path}${this.fucgepath()}/${str_ImageName}`, node);
	}

	//更改设置界面图片
	async fucChangeSettingImage(node:cc.Node){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let str_ImageName = node.getComponent(cc.Sprite).spriteFrame.name
		const path =`Public/setting/`
		await manager().resourceMgr.loadImage(`${path}${this.fucgepath()}/${str_ImageName}`, node);
	}

	//更改子游戏动画
	async fucChangeAnimation(skeleton:sp.Skeleton){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let atlasText = skeleton.skeletonData.name
		const path =`Game/${this.GameName}/resources/loadRes/animation/`
		await cc.resources.load(`${path}${this.fucgepath()}/${atlasText}`, sp.SkeletonData, (err,skedata) => {
			skeleton.skeletonData = skedata;
			skeleton.node.active = false
		});
	}

	//更改开始动画 公用资源
	async fucChangeStartAnimation(skeleton:sp.Skeleton){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let atlasText = skeleton.skeletonData.name
		const path =`Public/resources/animation/startAnimation/`
		await cc.resources.load(`${path}${this.fucgepath()}/${atlasText}`, sp.SkeletonData, (err,skedata) => {
			skeleton.skeletonData = skedata;
			skeleton.node.active = false
		});
	}
	//更改子游戏内部动画 语言不一样 动画name不一样
	async fucChangeGameAnimation(skeleton:sp.Skeleton,name){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		const path =`Game/${this.GameName}/resources/loadRes/animation/`
		let atlasText = name[GameEngine.m_services.i18nSrv.getI18nSetting()]
		await cc.resources.load(`${path}${this.fucgepath()}/${atlasText}`, sp.SkeletonData, (err,skedata) => {
			skeleton.skeletonData = skedata;
			skeleton.node.active = false
		});
	}

	//修改子游戏内部图
	async fucChangeSpriteFrame(Sprite:cc.SpriteFrame){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let str_ImageName = Sprite.name
		const path =`Game/${this.GameName}/resources/loadRes/img/phoneBet/`
		await cc.loader.loadRes(`${path}${this.fucgepath()}/${str_ImageName}`, cc.SpriteFrame, (err,spriteFrame) => {
			const nspriteFrame = new cc.SpriteFrame();
			nspriteFrame.setTexture(spriteFrame,Sprite.getRect());
			Sprite = nspriteFrame;
		});
	}

	//修改公共图片
	async fucPublicSpriteFrame(Sprite:cc.SpriteFrame){
		if (GameEngine.m_services.i18nSrv.getI18nSetting() == 0) return
		let str_ImageName = Sprite.name
		const path =`Public/phoneBet/`
		await cc.loader.loadRes(`${path}${this.fucgepath()}/${str_ImageName}`, cc.SpriteFrame, (err,spriteFrame) => {
			const nspriteFrame = new cc.SpriteFrame();
			nspriteFrame.setTexture(spriteFrame,Sprite.getRect());
			Sprite = nspriteFrame;
		});
	}

	//替换Skeleton动画内部图片  texture不能有另外的使用  不能异步
	CreateRegion(texture:cc.Texture2D,bAuto = false) {
		try {
			let skeletonTexture = new sp.SkeletonTexture()//ts接口未开 
			skeletonTexture.setRealTexture(texture)
			let page = new sp.spine.TextureAtlasPage()
			page.name = texture.name
			page.uWrap = sp.spine.TextureWrap.ClampToEdge
			page.vWrap = sp.spine.TextureWrap.ClampToEdge
			page.texture = skeletonTexture
			page.texture.setWraps(page.uWrap, page.vWrap)
			page.width = texture.width
			page.height = texture.height

			let region = new sp.spine.TextureAtlasRegion()
			region.page = page
			region.width = texture.width
			region.height = texture.height
			region.originalWidth = texture.width
			region.originalHeight = texture.height

			region.rotate = false
			region.u = 0
			region.v = 0
			region.u2 = 1
			region.v2 = 1
			region.texture = skeletonTexture
			return region
		} catch (error) {
			console.log("-------CreateRegion error")
			return null
		}
	}

	// 第一个参数为你想生成的固定的文字开头比如: 微信用户xxxxx
	// 第二个为你想生成出固定开头文字外的随机长度
	randomName(prefix = undefined, randomLength = undefined ) {
		prefix === undefined ? prefix = "" : prefix;
		randomLength === undefined ? randomLength = 8 : randomLength;
		// 用户名随机词典数组
		let nameArr = [
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
			["a", "b", "c", "d", "e", "f", "g", "h", "i", "g", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
		]
		let name = prefix;
		for (var i = 0; i < randomLength; i++) {
			let index = this.next(2);
			let zm = nameArr[index][this.next(nameArr[index].length)];
			//字母
			if (index == 1) {
				//50%概率转换大小写
				if (this.next(2) == 1) {
					zm = zm.toString().toUpperCase()
				}
			}
			name += zm;
		}
		return name;
	}

	// 实例化一个随机数生成器，seed=随机数种子，默认当前时间分钟
	m_seed = 0;
	fucRandom(seed = null) {
		let date = new Date()
		let n_time = date.getDay()  + date.getHours() + date.getMinutes() * this.m_SelectGameID  //每个游戏不一样
		this.m_seed = (seed || n_time) % 999999999;
	  }
	
	// 取一个随机整数 max=最大值（0开始，不超过该值） 默认10
	next(max) {
		max = max || 10;
		this.m_seed = (this.m_seed * 9301 + 49297) % 233280;
		let val = this.m_seed / 233280.0;
		return Math.floor(val * max);
	}

	//模拟在线人数 尽量真实   20240122  减1/3
	fucgetOnLinePlayer(){
		let date = new Date()
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();  
		//伪随机
		GameInstInfo.getinstance().fucRandom(hours + minutes + seconds*this.m_SelectGameID)
		let randomcount = GameInstInfo.getinstance().next(30)
		if (randomcount %2 == 0 ) //有增有减
			randomcount = 0-randomcount
		
		let  n_min = 800
		let  n_max = 5000
		let n_Count = 0
		if (hours > 3  && hours < 13) {
			n_Count = (hours  - 3) *(n_max - n_min)/9  + n_min + minutes/2 * 10 + randomcount
		}else{
			let n_time = [13, 14 ,15 ,16 ,17,18, 19, 20 ,21 ,22, 23, 0, 1, 2, 3]
			let index = n_time.indexOf(hours)
			if (index > -1) {
				n_Count = n_max - (n_max/n_time.length) * index  + n_min - minutes * 10 - randomcount
			}
		}
		let power = [0,30,60,180,300]
		let multiply = [1,1,1.5,2.0,2.5,3,3.5]
		if(power.indexOf(this.getDTime()) != -1){
			return Math.floor(n_Count / 3  * multiply[power.indexOf(this.getDTime())] )  
		}
		return Math.floor(n_Count / 3   )  
	}

	// 复制文本
	copyContent (content) {
		let copyResult = true
		const text = content || '让我们一起快乐的敲代码吧~';
		if (!!window.navigator.clipboard) {
		  window.navigator.clipboard.writeText(text).then((res) => {
			console.log('复制成功');
			return copyResult;
		  }).catch((err) => {
			console.log('复制失败--采取第二种复制方案', err);
			this.copyContent2(text)
		  })
		} else {
		  this.copyContent2(text)
		}
	}
	
	// 复制文本
	copyContent2(text) {
		let copyResult = true
		let inputDom = document.createElement('textarea');
		inputDom.setAttribute('readonly', 'readonly');
		inputDom.value = text;
		document.body.appendChild(inputDom);
		inputDom.select();
		const result = document.execCommand('copy')
		if (result) {
		console.log('复制成功');
		} else {
		console.log('复制失败');
		copyResult = false
		}
		document.body.removeChild(inputDom);
		return copyResult;
	}

	//函数拷贝
    copyObj(obj){          
		let newobj = null;  
		//判断是否需要继续进行递归
		if (typeof (obj) == 'object' && obj !== null) {
			newobj = obj instanceof Array ? [] : {};               
			for (var i in obj) {
				newobj[i] = this.copyObj(obj[i])
			}  
		} else newobj = obj;            
		return newobj;    
    }


	//游戏投注记录币种转换  目前统一显示元
	fucScroeTransition(_number){
		let n_base = 1
		switch (this.m_curr) {
			case "USD":
				n_base = 100
				break;
			case "VND":
				n_base = 100
				break;
			default:
				break;
		}
		
		return _number/n_base
	}

	/*
	游戏接收单位：分
	游戏投注单位：元
	*/

	//VND 1000元起投

	//游戏显示元
	//投注为分    最终投注 = X*100  *  比列

	/*
	@param  金额
	@param  是否转元
	*/
	fucGameTouzhuTransition(_number,bYuan=false){
		let n_base = 1
		switch (this.m_curr) {
			case "USD":
				n_base = 1
				break;
			case "VND":
				n_base = 1000    //越南1K元起投
				break;
			default:
				break;
		}
		if (bYuan) {
			return _number*n_base *100//  分转元 再转最少投注单位  分
		}
		else
			return _number*n_base 
	}

	//投注按钮单位转换
	fucGameChipTransition(_number){
		let n_base = 1
		switch (this.m_curr) {
			case "USD":
				n_base = 1
				break;
			case "VND":
				n_base = 1000    //越南1K元起投
				break;
			default:
				break;
		}
		return _number/100 /n_base//  分转元 再转最少投注单位
	}
}