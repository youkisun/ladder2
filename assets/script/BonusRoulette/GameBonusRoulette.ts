import { _decorator, Component, Node } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { UIBonusRoulette } from '../UI/UIBonusRoulette';
import { GameRandom } from '../Utils/GameRandom';
import { GameMainContext } from '../Main/GameMainContext';
import { GameNetwork } from '../Network/GameNetwork';
import { GameBonusPacket, GameRoulettePacket } from '../Network/GamePacket';
import { RouletteSpin } from './RouletteSpin';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { UIRouletteLights } from '../UI/UIRouletteLights';
import { Logger } from '../Common/GameCommon';
import { UITopMenu } from '../UI/UITopMenu';
import { UIShortAlarm } from '../UI/UIShortAlarm';
import { GameAddCoinControl } from '../Main/GameAddCoinControl';
import { UIWinGetPointsTab } from '../UI/UIWinGetPointsTab';
const { ccclass, property } = _decorator;

@ccclass('GameBonusRoulette')
export class GameBonusRoulette extends DefaultComponent<GameBonusRoulette> {

    @property(RouletteSpin)
    private rouletteSpin: RouletteSpin;

    private isPlay: boolean = false;
    private hideRemainTick: number;
    public resultRoulettePacket: GameRoulettePacket;

    private startAngles: number[];
    private endAngles: number[];
    private bonusValues: string[] = ["100", "300", "500", "1K", "2K", "10K", "100K"];
    private bonusValueIndexs: number[] = [6, 1, 5, 2, 3, 4, 0];

    public win_r_points: number;
    public total_r_points: number;

    public isShowValue: boolean = false;

    public isShow(): boolean {
        if (UIBonusRoulette.getDefaultInstance() == null)
            return false;

        return UIBonusRoulette.getDefaultInstance().isShow;
    }

    start() {
        UIBonusRoulette.getDefaultInstance().onClickSpinBtn = this.onClickSpinBtn.bind(this);
        this.rouletteSpin.onSpinFinishEvent = this.onSpinEndEvent.bind(this);

        const diveCnt = 7;

        this.startAngles = new Array(diveCnt);
        this.endAngles = new Array(diveCnt);

        let degree = 360 / diveCnt;
        let halfDegree = degree / 2;

        for (let i = 0; i < 7; i++) {
            this.startAngles[i] = i * degree + 2;
            this.endAngles[i] = (i * degree) + degree - 2;
        }
    }

    // update(deltaTime: number) {
    //     if(this.isPlay)
    //     {
    //         this.hideRemainTick -= deltaTime;

    //         if(this.hideRemainTick <= 0)
    //         {
    //             this.isPlay = false;
    //             UIBonusRoulette.getDefaultInstance().hide();
    //         }
    //     }
    // }



    private onSpinEndEvent() {
        UIBonusRoulette.getDefaultInstance().setActiveAllInteraction(true);
        UIBonusRoulette.getDefaultInstance().setGetAmountLabel(this.resultRoulettePacket.win_r_points, this.resultRoulettePacket.total_r_points);
        //let gameMainContext = GameMainContext.getDefault();
        //gameMainContext.setRunPoint(this.resultRoulettePacket.total_r_points);       

        UIRouletteLights.getDefaultInstance().blinkAlternately();
    }

    private onClickSpinBtn(): boolean {
        let gameMainContext = GameMainContext.getDefault();
        if (gameMainContext.roulettePoint < 1) {
            UIShortAlarm.getDefaultInstance().showShortAlarm("Not enough roulette points.", 1);
            return false;
        }

        UIBonusRoulette.getDefaultInstance().setGetAmountLabel(0, 0);

        UIRouletteLights.getDefaultInstance().blinkSequentially();

        GameNetwork.getDefaultInstance().sendRouletteReq(
            async (resultPacket) => {
                Logger.log("Received result onRouletteReq response:", resultPacket);

                if (resultPacket.suc) {
                    this.resultRoulettePacket = resultPacket;
                    this.win_r_points = this.resultRoulettePacket.win_r_points;
                    this.total_r_points = this.resultRoulettePacket.total_r_points;
                    let gameMainContext = GameMainContext.getDefault();
                    GameAddCoinControl.getDefault().startAddRun(gameMainContext.runPoint);
                    gameMainContext.addRunPoint(this.win_r_points);

                    gameMainContext.initPacket.roulette_points = resultPacket.left_roulette_points;
                    gameMainContext.setRoulettePoint(resultPacket.left_roulette_points);

                    let uiBonusRoulette = UIBonusRoulette.getDefaultInstance();
                    uiBonusRoulette.setHasAmountLabel(resultPacket.left_roulette_points);

                    GameBonusRoulette.getDefaultInstance().play(resultPacket.win_opt);

                    // const node = await GameUIManager.getDefaultInstance().load(UIType.ROULETTE);
                    //                 if (node) {
                    //                     const bonusRoulette = node.getComponent(GameBonusRoulette);
                    //                     bonusRoulette.show();
                    //                 }
                }
                else {
                    Logger.log("보너스 요청 실패");
                    UIBonusRoulette.getDefaultInstance().setActiveAllInteraction(true);
                    gameMainContext.setRoulettePoint(resultPacket.left_roulette_points);
                }

            });

        return true;
    }



    public play(amountIndex: number) {
        // let startAngle = 0;
        // let endAngle = 0;
        
        // let degree = 360 / 7;
        // let halfDegree = degree / 2;

        // for(let i=0;i<7;i++)
        // {
        //     if(i==0)
        //         startAngle = -halfDegree;
        //     else
        //         startAngle = ((i-1) * degree) + halfDegree;

        //     endAngle = (i*degree) + halfDegree - 1;
        // }

        // if(amountIndex == 1)
        // {
        //     startAngle = -halfDegree;
        //     endAngle = halfDegree - 1;
        // }
        // else if(amountIndex == 2)
        // {
        //     startAngle = 45;
        //     endAngle = 135 - 1;
        // }
        // else if(amountIndex == 3)
        // {
        //     startAngle = 135;
        //     endAngle = 225 - 1;
        // }
        // else if(amountIndex == 4)
        // {
        //     startAngle = 225;
        //     endAngle = 315;
        // }

        let index = this.bonusValueIndexs.indexOf(amountIndex - 1);//this.bonusValueIndexs[amountIndex-1];

        let startAngle = this.startAngles[index];
        let endAngle = this.endAngles[index];

        const random = new GameRandom();
        let angleValue = random.nextInRange(startAngle, endAngle);
        this.rouletteSpin.startSpin(angleValue);

        this.isPlay = true;
        this.hideRemainTick = 10;

        Logger.log(`[BONUS] play roulette - amountIndex:${amountIndex}, startAngle:${startAngle} endAngle:${endAngle}, targetAngle:${angleValue}`);

        UIBonusRoulette.getDefaultInstance().setActiveAllInteraction(false);
    }

    public show() {

        let uiBonusRoulette = UIBonusRoulette.getDefaultInstance();
        let gameContext = GameMainContext.getDefault();
        uiBonusRoulette.setHasAmountLabel(gameContext.roulettePoint);

        for (let i = 0; i < this.bonusValues.length; i++) {
            uiBonusRoulette.setAmountLabel(i, this.bonusValues[this.bonusValueIndexs[i]]);
        }

        // uiBonusRoulette.setAmountLabel(0, this.bonusValues[]);
        // uiBonusRoulette.setAmountLabel(1, 100);
        // uiBonusRoulette.setAmountLabel(2, 300);
        // uiBonusRoulette.setAmountLabel(3, 500);
        // uiBonusRoulette.setAmountLabel(4, 1000);
        // uiBonusRoulette.setAmountLabel(5, 10000);
        // uiBonusRoulette.setAmountLabel(6, 100000);

        if (UIWinGetPointsTab.getDefaultInstance() != null &&
            UIWinGetPointsTab.getDefaultInstance().node.active)
            UIWinGetPointsTab.getDefaultInstance().forceStopEffect();

        uiBonusRoulette.show();


    }


}


