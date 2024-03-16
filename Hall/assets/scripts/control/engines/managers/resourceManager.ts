/**
 * 资源加载
 */

import superManager from "./superManager";

const { ccclass, property } = cc._decorator;

@ccclass("resourceManager")
export class resourceManager extends superManager {
  
	protected className: string = "资源管理";

	constructor() {
		super();
	}

	/**
	 * 动态资源
	 */

	loadImage(url,node){
		cc.loader.loadRes(url, cc.SpriteFrame, (err,spriteFrame) => {
			node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
		});
	}


	//加载PList
	loadPlistImage(node,imgPath:string,sImgName:string,Callbcak=null){

		if (!node) {
			console.log("PlistImage err node=null")
		}
		cc.resources.load(imgPath, cc.SpriteAtlas, (err:any, atlas) => {
			if (err) {
				return console.error("SpriteAtlas load failed, err:" + err.message);;
			}
			let spriteFrame: cc.SpriteFrame = atlas.getSpriteFrame(sImgName);
			node.getComponent(cc.Sprite).spriteFrame = spriteFrame;

			if (Callbcak) {
				Callbcak()
			}
		});
	}

	loadSpriteAtlas(imgPath:string, jsonPath:string, sImgName: string, sprFrame: cc.SpriteFrame) {
		cc.resources.load(imgPath, cc.Texture2D, (err, texture) =>{
			if (err) {
				console.error('Failed to load the image file');
				return;
			}

			cc.resources.load(jsonPath, cc.JsonAsset, (err, jsonAsset) => {
				if (err) {
					console.error('Failed to load the JSON file');
					return;
				}

				const jsonData = jsonAsset.json;
				// 使用这些来显示图片
				const frameData = jsonData.frames[sImgName]; // 替换成实际的图片名

				// 获取图片在大图中的位置信息
				const rect = new cc.Rect(frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h);
				// 创建一个新的 SpriteFrame
				const spriteFrame = new cc.SpriteFrame();
				spriteFrame.setTexture(texture, rect);
		
				sprFrame = spriteFrame;
			});
		});
	}

  
}
