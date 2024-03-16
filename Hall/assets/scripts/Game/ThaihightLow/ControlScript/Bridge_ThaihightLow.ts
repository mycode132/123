import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SubgameConfig from "../../../Public/ControlScript/SubgameConfig";

/*  服务器数据
gameID  :  服务器ID  对应时间
gameLotteryType：
gameArea：
*/


//泰式比高低
let subgame_1 = new SubgameConfig();
subgame_1.gameID = 2161;
subgame_1.gameTime = 30;
subgame_1.gameName = "ThaihightLow";  //文件夹名字
subgame_1.sceneName = "Hall";
subgame_1.pathOfGamePrefab = "Game/ThaihightLow/prefab/hall";
subgame_1.pathOfGameExplainPrefab = "Game/ThaihightLow/prefab/nGameExplain";
subgame_1.classNameOfGamePrefab = "hall_ThaihightLow";
subgame_1.gameLotteryType = "cd"

let subgame_2 = new SubgameConfig();
subgame_2.gameID = 2161;
subgame_2.gameTime = 60;
subgame_2.gameName = subgame_1.gameName;  //文件夹名字
subgame_2.sceneName = subgame_1.sceneName;
subgame_2.pathOfGamePrefab = subgame_1.pathOfGamePrefab;
subgame_2.pathOfGameExplainPrefab = subgame_1.pathOfGameExplainPrefab;
subgame_2.classNameOfGamePrefab = subgame_1.classNameOfGamePrefab;
subgame_2.gameLotteryType = subgame_1.gameLotteryType

let subgame_3 = new SubgameConfig();
subgame_3.gameID = 2163;
subgame_3.gameTime = 180;
subgame_3.gameName = subgame_1.gameName;  //文件夹名字
subgame_3.sceneName = subgame_1.sceneName;
subgame_3.pathOfGamePrefab = subgame_1.pathOfGamePrefab;
subgame_3.pathOfGameExplainPrefab = subgame_1.pathOfGameExplainPrefab;
subgame_3.classNameOfGamePrefab = subgame_1.classNameOfGamePrefab;
subgame_3.gameLotteryType = subgame_1.gameLotteryType


GameInstInfo.getinstance().registerSubgame(subgame_1);
GameInstInfo.getinstance().registerSubgame(subgame_2);
GameInstInfo.getinstance().registerSubgame(subgame_3);