/**
 * 游戏基本引擎
 */

import { LINE_SPLIT_END_LEFT, LINE_SPLIT_END_RIGHT, LINE_SPLIT_START_LEFT, LINE_SPLIT_START_RIGHT } from "./configs/logConfig";
import { resourceManager } from "./managers/resourceManager";
import soundManager from "./managers/soundManager";
import superManager from "./managers/superManager";
import uiModule from "./modules/uiModule";
import i18nService from "./services/i18nService";
import { localStorageService } from "./services/localStorageService";
import superService from "./services/superService";

export interface Managers {
	soundMgr: soundManager;
	resourceMgr: resourceManager,
}

export interface Modules {
	uiControlModule: uiModule,
}

export interface Services {
	localStorageSrv: localStorageService,
	i18nSrv: i18nService,
}

export function manager() {
	return PHWL.getManagers();
}

export function modules() {
	return PHWL.getModules();
}

export function services() {
  	return PHWL.getServices();
}


class GameEngine {
	public m_managers: Managers;
	public m_modules: Modules;
	public m_services: Services;


	constructor() {
		//管理
		this.m_managers = {
			soundMgr: new soundManager(),
			resourceMgr: new resourceManager(),
		};
		//模块
		this.m_modules = {
			uiControlModule: new uiModule(),
		};
		//服務
		this.m_services = {
			localStorageSrv: new localStorageService(),
			i18nSrv: new i18nService(),
		};

		console.log("<游戏主框架>");
	}

	getModules(): Modules {
		return this.m_modules;
	}

	getManagers() {
		return this.m_managers;
	}

	getServices() {
		return this.m_services;
	}

	async loadAll(): Promise<void> {
        //加载
        const startTime = Date.now();
        let t = startTime;
        console.log('★★★★★框架载入★★★★★');

        //模块
        console.log(`${LINE_SPLIT_START_LEFT}加载所有模块${LINE_SPLIT_START_RIGHT}`);
        await this.loadAllModules();
        console.log(`${LINE_SPLIT_END_LEFT}所有模块已载${LINE_SPLIT_END_RIGHT}`, Date.now() - t, 'ms');
        t = Date.now();

        //服务
        console.log(`${LINE_SPLIT_START_LEFT}加载所有服务${LINE_SPLIT_START_RIGHT}`);
        await this.loadServices();
        console.log(`${LINE_SPLIT_END_LEFT}所有服务已载${LINE_SPLIT_END_RIGHT}`, Date.now() - t, 'ms');
        t = Date.now();

        //管理
        console.log(`${LINE_SPLIT_START_LEFT}加载所有管理${LINE_SPLIT_START_RIGHT}`);
        await this.loadManagers();
        console.log(`${LINE_SPLIT_END_LEFT}所有管理已载${LINE_SPLIT_END_RIGHT}`, Date.now() - t, 'ms');
        t = Date.now();

        console.log('★★★★★框架完毕★★★★★', Date.now() - startTime, 'ms (总耗时)');

        return Promise.resolve();
    }

	/**
	 *
	 * @param event 事件名
	 * @param args 参数，最多传递5个
	 */
	emit(event: string, ...args) {
		this.Canvas().emit(event, ...args);
	}

	on(event: string, callback: (...args: any[]) => void, caller: any) {
		this.Canvas().on(event, callback, caller);
	}

	off(event: string, callBack?: () => void, caller?: any) {
		this.Canvas().off(event, callBack, caller);
	}

	once(event: string, callback: () => void, caller: any) {
		this.Canvas().once(event, callback, caller);
	}

	targetOff(caller: any) {
		this.Canvas().targetOff(caller);
	}

	/**
	 * return {cc.Component} 当前场景画布挂载的脚本
	 * */
	Component(): cc.Component {
		return this.Canvas().getComponent(cc.Component);
	}

	/**
	 * @return {cc.Node} 当前场景的画布节点
	 * */
	Canvas(): cc.Node {
		return cc.find("Canvas");
	}

	/**
	 * 释放没使用资源
	 */
	releaseUnusedAssets() {
		try {
			//@ts-ignore
			resources.releaseUnusedAssets();
		} catch (e) {
			console.warn("#498 警告 res unused release", e);
		}
	}

	//切换场景
	changeScene(sceneName: string, successCallback?: () => void) {
		this.loadScene(sceneName, successCallback);
	}

	//加载并切换场景
	loadScene(sceneName: string, successCallback?: () => void) {
		cc.director.loadScene(sceneName, () => {
			successCallback && successCallback();
		});
	}

	//加载并切换场景
	loadLayer(LayerName:string, successCallback?: (node) => void) {
		cc.loader.loadRes(LayerName, cc.Prefab, function (err, prefab) {
			if (err) {
				console.error('加载预制体失败:', err);
				return;
			}
			if( !( prefab instanceof cc.Prefab ) ) { cc.log( 'Prefab error' ); return; } 
			let instance = cc.instantiate(prefab);
			cc.director.getScene().addChild(instance);
			successCallback && successCallback(instance);
		});
	}


	//加载并切换场景
	PrefabloadLayer(node:cc.Node,LayerName:string, Name:string,successCallback?: (node) => void) {
		cc.loader.loadRes(LayerName, cc.Prefab, (err, prefab) => {
			if (err) {
				console.error('加载预制体失败:', err);
				return;
			}
			if( !( prefab instanceof cc.Prefab ) ) { cc.log( 'Prefab error' ); return; } 
			let instance = cc.instantiate(prefab);
			if (!node.getChildByName("GIF")) 
				node.addChild(instance);
			instance.name = Name
			successCallback && successCallback(instance);
		});   
	}

	private async loadAllModules() {
		//先预加载
		for (let key in this.m_modules) {
			await this.m_modules[key].preLoadModules();
		}
		//再加载
		for (let key in this.m_modules) {
			await this.m_modules[key].loadModule();
			await this.m_modules[key].onLoadedModule();
		}
		return Promise.resolve();
	}

	private async loadManagers() {
		for (let k in this.m_managers) {
			let mgr: superManager = this.m_managers[k];
			let res = await mgr.loadManager();
			if (res) {
				await mgr.onLoadedManager();
			} else {
				break;
			}
		}
	}

	private async loadServices() {
		for (let k in this.m_services) {
			let srv: superService = this.m_services[k];
			if (!srv.isLoaded()) {
				await srv.loadService();
				await srv.onLoadedService();
			}
		}
	}
}

//引擎主入口
function mian(): GameEngine {
  try {
    window["PHWL"] = new GameEngine();
    return window["PHWL"];
  } catch (error) {
    console.log("引擎初始化失败" + error);
  }
}

let PHWL = mian();

export default PHWL;