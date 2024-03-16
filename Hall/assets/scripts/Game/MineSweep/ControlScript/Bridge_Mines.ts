import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SubgameConfig from "../../../Public/ControlScript/SubgameConfig";

/*  服务器数据
gameID  :  服务器ID  对应时间
gameLotteryType：
gameArea：
*/

let subgame_1 = new SubgameConfig();
subgame_1.gameID = 2160;
subgame_1.gameName = "MineSweep";  //文件夹名字
subgame_1.sceneName = "Hall";
subgame_1.pathOfGamePrefab = "Game/MineSweep/prefab/hall";
subgame_1.pathOfGameExplainPrefab = "Game/MineSweep/prefab/nGameExplain";
subgame_1.classNameOfGamePrefab = "hall_Mines";
subgame_1.gameLotteryType = "MineSweep"
subgame_1.AddPublicSrc = false

GameInstInfo.getinstance().registerSubgame(subgame_1);
