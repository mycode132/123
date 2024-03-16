import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SubgameConfig from "../../../Public/ControlScript/SubgameConfig";



let subgame_1 = new SubgameConfig();
subgame_1.gameID = 2131;
subgame_1.gameTime = 30;
subgame_1.gameName = "FishCrabs";  //文件夹名字
subgame_1.sceneName = "Hall";
subgame_1.pathOfGamePrefab = "Game/FishCrabs/prefab/hall";
subgame_1.pathOfGameExplainPrefab = "Game/FishCrabs/prefab/nGameExplain";
subgame_1.classNameOfGamePrefab = "hall_FishCrabs";
subgame_1.gameLotteryType = "fsc"

let subgame_2 = new SubgameConfig();
subgame_2.gameID = 2132;
subgame_2.gameTime = 60;
subgame_2.gameName = subgame_1.gameName;  //文件夹名字
subgame_2.sceneName = subgame_1.sceneName;
subgame_2.pathOfGamePrefab = subgame_1.pathOfGamePrefab;
subgame_2.pathOfGameExplainPrefab = subgame_1.pathOfGameExplainPrefab;
subgame_2.classNameOfGamePrefab = subgame_1.classNameOfGamePrefab;
subgame_2.gameLotteryType = subgame_1.gameLotteryType

let subgame_3 = new SubgameConfig();
subgame_3.gameID = 2133;
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