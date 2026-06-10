/**
 * 游戏配置和关卡数据
 */
export interface LevelData {
    id: number;
    name: string;
    gridWidth: number;
    gridHeight: number;
    speed: number;        // 移动间隔(ms)
    obstacles: { x: number; y: number }[];
    targetScore: number;  // 过关目标分数
    unlocked: boolean;
}

const LevelConfig: LevelData[] = [
    {
        id: 1, name: '第1关', gridWidth: 10, gridHeight: 10,
        speed: 250, obstacles: [], targetScore: 3, unlocked: true
    },
    {
        id: 2, name: '第2关', gridWidth: 12, gridHeight: 12,
        speed: 220, obstacles: [{ x: 3, y: 3 }, { x: 8, y: 8 }], targetScore: 5, unlocked: false
    },
    {
        id: 3, name: '第3关', gridWidth: 15, gridHeight: 15,
        speed: 200, obstacles: [
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 10, y: 10 }, { x: 11, y: 10 },
            { x: 7, y: 7 }, { x: 7, y: 8 }
        ], targetScore: 8, unlocked: false
    },
    {
        id: 4, name: '第4关', gridWidth: 15, gridHeight: 15,
        speed: 170, obstacles: [
            { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
            { x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 },
            { x: 7, y: 7 }, { x: 12, y: 3 }
        ], targetScore: 10, unlocked: false
    },
    {
        id: 5, name: '第5关', gridWidth: 20, gridHeight: 20,
        speed: 150, obstacles: [
            { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
            { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 },
            { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 },
            { x: 5, y: 15 }, { x: 6, y: 15 }, { x: 7, y: 15 },
            { x: 14, y: 16 }, { x: 14, y: 17 },
            { x: 8, y: 8 }, { x: 13, y: 13 }
        ], targetScore: 15, unlocked: false
    }
];

export default LevelConfig;

export const CELL_SIZE = 32;        // 每格像素
export const GAME_AREA_X = 0;       // 游戏区域起始X
export const GAME_AREA_Y = 0;       // 游戏区域起始Y
export const UI_WIDTH = 320;        // UI区域宽度