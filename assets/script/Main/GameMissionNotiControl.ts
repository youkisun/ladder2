import { _decorator, Component, Node } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameMainContext } from './GameMainContext';
import { UIMissionAlarm } from '../UI/UIMissionAlarm';
import { CoinType, GameCoinMovingControl } from '../Common/GameCoinMovingControl';
import { UIHudRoulette } from '../UI/UIHudRoulette';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

@ccclass('GameMissionNotiControl')
export class GameMissionNotiControl extends DefaultComponent<GameMissionNotiControl> {

    @property([UIMissionAlarm])
    private uiMissionAlarms: UIMissionAlarm[] = [];

    @property(Node)
    private uiHudRouletteNode: Node;

    protected onLoad(): void {
        super.onLoad();
        this.uiMissionAlarms.forEach(element=>
            {
                element.node.active = false;
            });
    }

    public getWinRoulettePoints(): number
    {        
        let getRoulettePoint = 0;
        const isVictory = GameResultContext.getDefault().isWin;
        if (isVictory)
        {
            // Rewards based on betting points.  
            // {
            //     let betTonPoint = GameMainContext.getDefault().betTonPoint;
            //     if (betTonPoint >= 1 && betTonPoint < 4) {
            //         getRoulettePoint += 0.1;
            //     }
            //     else if (betTonPoint >= 4 && betTonPoint < 7) {
            //         getRoulettePoint += 0.3;
            //     }
            //     else if (betTonPoint >= 7 && betTonPoint < 10) {
            //         getRoulettePoint += 0.5;
            //     }
            //     else if (betTonPoint >= 10) {
            //         getRoulettePoint += 0.8;
            //     }

            //     Logger.log(`[WIN_ROULETTE_POINT] betTonPoint : ${betTonPoint}, getRoulettePoint : ${getRoulettePoint}`);
                
            // }

            // Consecutive win rewards.
            // 1 or 2 consecutive wins grant 0.1 roulette points.
            // From 3 consecutive wins, 1 roulette point is granted.
            {
                let continueWinCnt = GameMainContext.getDefault().initPacket.con_win_cnt + 1;

                getRoulettePoint = this.getContinueWinCnt(continueWinCnt);
                // if (continueWinCnt >= 3) {
                //     // 2^(n-3) / 10
                //     getRoulettePoint += Math.min(Math.pow(2, continueWinCnt - 3) / 10, 1.6);                    

                //     Logger.log(`[WIN_ROULETTE_POINT] - continueWinCnt : ${continueWinCnt}, getRoulettePoint : ${getRoulettePoint}`);
                // }
            }

            
        }

        return getRoulettePoint;
    }

    public getContinueWinCnt(continueWinCnt: number): number
    {
        if(continueWinCnt >= 3)
            return 1;
        else
            return 0.1;
    }


}
