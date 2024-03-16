import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SubgameConfig from "../../../Public/ControlScript/SubgameConfig";



/*  服务器数据
gameID  :  服务器ID  对应时间
gameLotteryType：
gameArea：
*/

let subgame_1 = new SubgameConfig();
subgame_1.gameID = 2146;
subgame_1.gameTime = 30;
subgame_1.gameName = "NiuNiu";  //文件夹名字
subgame_1.sceneName = "Hall";
subgame_1.pathOfGamePrefab = "Game/NiuNiu/prefab/hall";
subgame_1.pathOfGameExplainPrefab = "Game/NiuNiu/prefab/nGameExplain";
subgame_1.classNameOfGamePrefab = "hall_NiuNiu";
subgame_1.gameLotteryType = "bull";    
subgame_1.gameArea = ["Banker1", "Player1", "Banker2", "Player2", "Banker3", "Player3"]   //下注区域  左到右  上到下


let subgame_2 = new SubgameConfig();
subgame_2.gameID = 2147;
subgame_2.gameTime = 60;
subgame_2.gameName = subgame_1.gameName; 
subgame_2.sceneName = subgame_1.sceneName;
subgame_2.pathOfGamePrefab = subgame_1.pathOfGamePrefab;
subgame_2.pathOfGameExplainPrefab = subgame_1.pathOfGameExplainPrefab;
subgame_2.classNameOfGamePrefab = subgame_1.classNameOfGamePrefab;
subgame_2.gameLotteryType = subgame_1.gameLotteryType
subgame_2.gameArea = subgame_1.gameArea

let subgame_3 = new SubgameConfig();
subgame_3.gameID = 2148;
subgame_3.gameTime = 180;
subgame_3.gameName = subgame_1.gameName;  
subgame_3.sceneName = subgame_1.sceneName;
subgame_3.pathOfGamePrefab = subgame_1.pathOfGamePrefab;
subgame_3.pathOfGameExplainPrefab = subgame_1.pathOfGameExplainPrefab;
subgame_3.classNameOfGamePrefab = subgame_1.classNameOfGamePrefab;
subgame_3.gameLotteryType = subgame_1.gameLotteryType
subgame_3.gameArea = subgame_1.gameArea


GameInstInfo.getinstance().registerSubgame(subgame_1);
GameInstInfo.getinstance().registerSubgame(subgame_2);
GameInstInfo.getinstance().registerSubgame(subgame_3);