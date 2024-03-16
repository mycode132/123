window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;
    
    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
    function setLoadingDisplay () {
      
		let preload = document.getElementById('preload');
        let left = document.getElementById('left');
        let right = document.getElementById('right');
        onProgress = function(completedCount, totalCount, item) {
            if (totalCount == 1) {
                return;
            }
            let percent = 100 * completedCount / totalCount;
            let progress = percent * 3.6;
            if (progress <= 180) {
                right.style.transform = "rotate(" + progress + "deg)";
            } else {
                document.getElementById("con").style.display = "none";
                right.style.transform = "rotate(180deg)";
                left.style.transform = "rotate(" + (progress - 180) + "deg)";
            }
        };

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
			preload.style.display = 'none';
        });
    }

    var onStart = function () {
		
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            cc.view.enableAutoFullScreen([
                cc.sys.BROWSER_TYPE_BAIDU,
                cc.sys.BROWSER_TYPE_BAIDU_APP,
                cc.sys.BROWSER_TYPE_WECHAT,
                cc.sys.BROWSER_TYPE_MOBILE_QQ,
                cc.sys.BROWSER_TYPE_MIUI,
                cc.sys.BROWSER_TYPE_HUAWEI,
                cc.sys.BROWSER_TYPE_UC,
            ].indexOf(cc.sys.browserType) < 0);
        }

        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });
        
        bundle.loadScene(launchScene, null, onProgress,
            function (err, scene) {
                if (!err) {
                    cc.director.runSceneImmediate(scene);
                    if (cc.sys.isBrowser) {
                        // show canvas
                        var canvas = document.getElementById('GameCanvas');
                        canvas.style.visibility = '';
                        var div = document.getElementById('GameDiv');
                        if (div) {
                            div.style.backgroundImage = '';
                        }
                        console.log('Success to load scene: ' + launchScene);
                    }
                }
            }
        );
    };

    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({ 
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });
    
    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);
	
	var count = 0;
	var remote_url = "https://gamestatic.178t.com/assets/"; // 打包后的assets文件放入CDN服务器的地址
	function cb (err) {
		if (err) return console.error(err.message, err.stack);
		count++;
		if (count === bundleRoot.length + 1) { // 加载到最后一项资源后，cc.game.run启动游戏进程
			cc.assetManager.loadBundle(  remote_url + MAIN, function (err) { //remote_url + MAIN
				if (!err) cc.game.run(option, onStart);
			});
		}
	}

	cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x;}), cb);
	for (var i = 0; i < bundleRoot.length; i++) {  // 如果编辑器上只有assets一个文件夹，bundleRoot[i]就是assets
		cc.assetManager.loadBundle( remote_url +  bundleRoot[i], cb); //remote_url + bundleRoot[i]
	}

};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}