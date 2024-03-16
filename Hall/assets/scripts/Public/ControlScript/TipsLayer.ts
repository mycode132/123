export default {
	//文本提示
	showTips(time = 3.0){
		let scene = cc.director.getScene();
		if (scene) {
			cc.resources.load('Public/prefab/layer/Disconnect',cc.Prefab ,(err,res)=> {
				var script = (cc.instantiate(res) as cc.Node)
				if (scene.getChildByName("Disconnect")) {
					scene.getChildByName("Disconnect").removeFromParent(true)
				}
				scene.addChild(script);

				script.runAction(cc.sequence(cc.delayTime(time) ,cc.removeSelf()))
			})
		}
	},

	showCloseTips(){
        let scene = cc.director.getScene();
        if (scene.getChildByName("Disconnect")) {
            scene.getChildByName("Disconnect").removeFromParent(true)
        }
    }
}