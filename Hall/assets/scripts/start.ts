
import PHWL from "./control/engines/GameEngine";
import GameEngine, { modules } from "./control/engines/GameEngine";
import { setCookie } from "./control/engines/services/Core/Cookie";
import GameInstInfo from "./Public/ControlScript/GameInstInfo";

const { ccclass, property, menu } = cc._decorator;

function beforeGameRun() {
	// 抗锯齿 要在cc.game.run前调用 webgl 才生效
    cc.macro.ENABLE_WEBGL_ANTIALIAS = true;
    // 是否开启多点触摸
    cc.macro.ENABLE_MULTI_TOUCH = true;
    //
    console.log('引擎配置初始化');
}

beforeGameRun();

@ccclass
@menu('场景/开始')
export default class start extends cc.Component {
	@property({type: cc.ProgressBar, displayName: '进度条'})
    pmLoadBar: cc.ProgressBar = null;

	@property({type: cc.Label, displayName: '进度文字'})
    pmLoadLabel: cc.Label = null;

	@property({type: cc.Sprite, displayName: '进度光标'})
    pmLoadSprite: cc.Sprite = null;

	@property({type: cc.Sprite, displayName: '背景'})
    pmBg: cc.Sprite = null;

	@property({type: cc.Sprite, displayName: 'LOGO'})
    pmLOGO: cc.Sprite = null;

	private loadLabelStr: string[] = ["", ""];

    onLoad() {
		let uiRoot : cc.Node = this.node.parent.getChildByName("UIRoot");
		cc.game.addPersistRootNode(uiRoot);
        modules().uiControlModule.SetUIRoot(uiRoot);
    }

	start() {
		let fps = (cc.sys.os == cc.sys.OS_IOS)? 45 : 45  //设置游戏帧率 15  30  60
		cc.game.setFrameRate(fps);

		this.pmLoadBar.progress = 0;
        this.pmLoadLabel.string = `正在初始化`;
		let self = this
		PHWL.loadAll().then(function(){
			self.loadLabelStr[0] = GameEngine.m_services.i18nSrv.getI18nString("游戏加载中")
			self.loadLabelStr[1] = GameEngine.m_services.i18nSrv.getI18nString("游戏资源载入完成")
		});
		//初始化cocos引擎配置
        this.initEngineConfig();
        //打印cocos引擎配置
        this.printEngineConfig();

		GameEngine.m_services.i18nSrv.setI18nSetting("en")  //设置默认语言

		GameInstInfo.getinstance().m_GameData = this.getBrowserValue()
		GameInstInfo.getinstance().fucSetGameName()

		this.GameSwitch()
		this.loadPackages()

		this.fucAddWindEvent()

		this.initChangeImage()  
	}

	//动态修改游戏加载背景与logo
	initChangeImage(){
		let path = `Game/${GameInstInfo.getinstance().GameName}/resources/loading/bg`;
		GameInstInfo.getinstance().fucChangeImagePathName(this.pmBg.node,path)  //背景

		path = `Game/${GameInstInfo.getinstance().GameName}/resources/loading/img_decorate`;
		GameInstInfo.getinstance().fucChangeImagePathName(this.pmLoadSprite.node,path)  //光标

		path = `Game/${GameInstInfo.getinstance().GameName}/resources/loading/phoneBet/${GameInstInfo.getinstance().fucgepath()}/img_logo`;
		GameInstInfo.getinstance().fucChangeImagePathName(this.pmLOGO.node,path)  //LOGO  默认
	}

	/**
     * 获取浏览器链接上拼接的数据 例如www.baidu.com?data=123&data2=321, getBrowserValue()返回123。
     * @param value 数据名 
     * @returns 返回数据
     */
	 private getBrowserValue() {
		if (!cc.sys.isNative) {
            let query = window.location.search.substring(1);
			let vars = query.split("&");
			let data = []
			for (let i = 0; i < vars.length; i++) {
				let pair = vars[i].split("=");
				data.push(pair)
			}
			
			data.findIndex((elem: any) => {
				if (elem[0] == "ylo"){
					setCookie("ylo",elem[1])
				}else if(elem[0] == "mid"){
					setCookie("mid",elem[1])
				}else if(elem[0] == "passkey"){
					setCookie("passkey",elem[1])
				}else if(elem[0] == "curr"){
					GameInstInfo.getinstance().m_curr = elem[1]
				}else if(elem[0] == "lang"){
					GameEngine.m_services.i18nSrv.setI18nSetting(elem[1])
				}
			});
        	return data;
        } else {
			return []
        }
    }

	private initEngineConfig() {
        cc.debug.setDisplayStats(false);
        cc.macro.ENABLE_MULTI_TOUCH=false
		//动态合图
		cc.macro.CLEANUP_IMAGE_CACHE = false;
		cc.dynamicAtlasManager.enabled = true;
    }

    //
    private printEngineConfig() {
        console.group('cocos引擎配置');
        console.log('是否开启抗锯齿', cc.view.isAntiAliasEnabled(), cc.macro.ENABLE_WEBGL_ANTIALIAS);
        console.log('是否开启多点触摸', cc.macro.ENABLE_MULTI_TOUCH);
        console.log('是否显示左下角调试信息', cc.debug.isDisplayStats());
        console.log('是否开启瓦片地图的自动裁减功能', cc.macro.ENABLE_TILEDMAP_CULLING);
        console.log('单次批处理渲染的顶点数量', cc.macro.BATCH_VERTEX_COUNT);
        console.log('Canvas背景是否支持 alpha 通道', cc.macro.ENABLE_TRANSPARENT_CANVAS);
        console.log('引擎支持的图片格式', ...cc.macro.SUPPORT_TEXTURE_FORMATS);
        console.groupEnd();
    }

	//加载游戏
	loadPackages() {
		//扫雷不添加公共资源
		if (!GameInstInfo.getinstance().getSubgameByGameID(GameInstInfo.getinstance().m_SelectGameID).AddPublicSrc) {
			this.goLoading();
		}else{
			//快速加载进游戏大厅
			this.loadSubpackages().then(() => {
				//this.goLoading();
			});
			this.goLoading();
		}
    }

	async loadSubpackages() {
        await this.loadAllPreloadResources();
        return Promise.resolve();
    }

	async loadAllPreloadResources(): Promise<void> {
        await this.startPreloadResources();
        return Promise.resolve();
    }

    //开始加载数据
    async startPreloadResources(): Promise<void> {
		//游戏资源
		let path = `Game/${GameInstInfo.getinstance().GameName}/resources/loading`;
		return await new Promise<void>((resolve, reject) => {
			cc.resources.loadDir(path, cc.Asset, (completedCount, totalCount, item)=>{
				let progress = completedCount / totalCount;
				this.setLoadProgress(progress, this.loadLabelStr[0]);
			}, (err, asset: cc.Asset[])=>{
				if (err) {
					console.log('资源加载失败' + err);
					return reject();
				}
				return resolve();
			});
		});
    }
   
	private setLoadProgress(progress: number, text?: string) {
        this.pmLoadBar.progress = progress;
		let ndDecorate = this.node.getChildByName('pbArray').getChildByName('l_decorate');
		ndDecorate.x = -370 + (600 * progress);
        if (text) {
			text = progress == 1 ? this.loadLabelStr[1] : this.loadLabelStr[0];
            this.pmLoadLabel.string = `(${(progress * 100).toFixed(1)}%)${text}`;
        }
    }

	//切换监听
	GameSwitch(){
		let  self = this
		cc.game.on(cc.game.EVENT_HIDE, function(){
			if(self.m_HallPrefab && self.m_Init){
				self.m_HallPrefab.destroy()
			}
		},this);
		cc.game.on(cc.game.EVENT_SHOW, function(){
			// 页面切换到前台
			if(self.m_Init){
				//加载大厅
				self.goLoading()
			}
		},this);
	}

	//子级大厅变量
	m_HallPrefab = null
	m_Init = false
	m_HallnodeComponent = null
	goLoading() {
		let self = this
		//加载大厅
		console.log("加载游戏：",GameInstInfo.getinstance().getSubgameByGameID(GameInstInfo.getinstance().m_SelectGameID).gameName)
		let GamePrefab = GameInstInfo.getinstance().getSubgameByGameID(GameInstInfo.getinstance().m_SelectGameID).pathOfGamePrefab
		PHWL.loadLayer(GamePrefab,function(node){
			self.m_Init = true
			self.m_HallPrefab = node
			self.m_HallnodeComponent =self.m_HallPrefab.getComponent(GameInstInfo.getinstance().getSubgameByGameID(GameInstInfo.getinstance().m_SelectGameID).classNameOfGamePrefab) 
			self.m_HallnodeComponent.m_LotteryType = GameInstInfo.getinstance().getSubgameByGameID(GameInstInfo.getinstance().m_SelectGameID).gameLotteryType
		});
    }

	//上层消息监听并转发hall
	fucAddWindEvent(){
		let  self = this
		let cocosgetMsg = (e)=>{
			if (self.m_HallnodeComponent) {
				self.m_HallnodeComponent.fucCoCosgetMsg(e)
			}
		}
		window.addEventListener("message",  cocosgetMsg,true);
	}
}