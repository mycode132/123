
import PHWL from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import hall_Auiator from "./hall_Auiator";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu("场景/加载界面")
export class loading extends cc.Component {
	@property({type: cc.ProgressBar, displayName: '进度条'})
    pmLoadBar: cc.ProgressBar = null;

	@property({type: cc.Label, displayName: '进度文字'})
    pmLoadLabel: cc.Label = null;


	@property({type: cc.Prefab, displayName: '大厅'})
    pmPrefab: cc.Prefab = null;

	private loadLabelStr: string[] = ["游戏正在加载中，请稍后...", "游戏资源载入完成"];
	mInit = false

	hallnode = null
	hallnodeComponent:hall_Auiator = null

    onLoad() {
        this.pmLoadBar.progress = 0;
        this.pmLoadLabel.string = `正在初始化`;
		GameInstInfo.getinstance().fucChangeImage(this.node.getChildByName("bg").getChildByName("cn_logo"))

		this.loadPackages();

		this.fucCheckHide()

		this.fucAddWindEvent()
    }


	onEnable(){
		if (this.mInit ) {
			if (this.hallnode) {
				this.hallnode.destroy()
			}
			
			this.hallnode = cc.instantiate(this.pmPrefab)
			this.node.addChild(this.hallnode)
			this.hallnodeComponent = this.hallnode.getComponent("hall_Auiator")
		}
	}

	loadPackages() {
        this.loadSubpackages().then(() => {
			this.hallnode = cc.instantiate(this.pmPrefab)
			this.node.addChild(this.hallnode)
			this.hallnodeComponent = this.hallnode.getComponent("hall_Auiator")
			this.mInit =  true
        });
		
    }

	fucAddWindEvent(){
		let  self = this
		let cocosgetMsg = (e)=>{
			if (self.hallnodeComponent) {
				//self.hallnodeComponent.fucCoCosgetMsg(e)
			}
		}
		window.addEventListener("message",  cocosgetMsg,true);
	}

	fucCheckHide(){
		let self = this

		// 判断当前浏览器是否支持Page Visibility API
		if (typeof document.hidden !== "undefined") {
			// 添加事件监听器
			document.addEventListener("visibilitychange", handleVisibilityChange, false);
		} 
		// 处理页面可见性改变事件
		function handleVisibilityChange() {
			if (document.hidden ) {
			// 页面切换到后台
				if (self.hallnode) {
					self.hallnode.destroy()

					self.hallnodeComponent = null
				}
			} else {
				// 页面切换到前台
				if (self.mInit ) {
					if (self.hallnode) {
						self.hallnode.destroy()
						self.hallnodeComponent = null
					}
					self.hallnode = cc.instantiate(self.pmPrefab)
					self.node.addChild(self.hallnode)
					self.hallnodeComponent = self.hallnode.getComponent("hall_Auiator")
				}
			}
		}
	}

	async loadSubpackages() {
        //await PHWL.loadAll();
        await this.loadAllPreloadResources();
        return Promise.resolve();
    }

	async loadAllPreloadResources(): Promise<void> {
        await this.startPreloadResources();
        return Promise.resolve();
    }

    //开始加载数据
    async startPreloadResources(): Promise<void> {
		let path = `Game/Auiator/resources/loadRes/img/phoneBet/${GameInstInfo.getinstance().fucgepath()}`;
	
		return await new Promise<void>((resolve, reject) => {
			cc.resources.loadDir(path, cc.Asset, (completedCount, totalCount, item)=>{
				let progress = completedCount / totalCount;
				this.setLoadProgress(progress, this.loadLabelStr[0]);
			}, (err, asset: cc.Asset[])=>{
				if (err) {	
					return reject();
				}
				return resolve();
			});

			//加载公共资源
			cc.resources.loadDir("Public/resources", cc.Asset, (completedCount, totalCount, item)=>{
				let progress = completedCount / totalCount;
				this.setLoadProgress(progress, this.loadLabelStr[0]);
			},(err, asset: cc.Asset[])=>{});

		});
    }
	
	private setLoadProgress(progress: number, text?: string) {
        this.pmLoadBar.progress = progress;
		let ndDecorate = this.node.getChildByName('pbArray').getChildByName('l_decorate');
		ndDecorate.x = -320 + (600 * progress);
        if (text) {
			text = progress == 1 ? this.loadLabelStr[1] : this.loadLabelStr[0];
            this.pmLoadLabel.string = `(${(progress * 100).toFixed(1)}%)${text}`;
        }
    }
}