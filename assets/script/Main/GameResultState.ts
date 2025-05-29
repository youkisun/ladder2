import { Component } from "cc";
import { ActorState, GameActorControl } from "../Actor/GameActorControl";
import { GameNetwork } from "../Network/GameNetwork";
import { AlaramType } from "../UI/UIAlaram";
import { UIHud } from "../UI/UIHud";
import { GameMainContext } from "./GameMainContext";
import { GameState } from "./GameState";
import { GameStateManager } from "./GameStateManager";
import { GameMissionNotiControl } from "./GameMissionNotiControl";
import { UIWinAlarmTab } from "../UI/UIWinAlarmTab";
import { GameAudioManger } from "./GameAudioManger";
import { PathMaker } from "../Path/PathMaker";
import { UIPath } from "../UI/UIPath";
import { GameResultContext } from "./GameResultContext";

export class GameResultState extends GameState {
    private continueCountTick: number = 0;

    private tonPointIncreaseAmount: number = 0;
    private tonPointCurrentIncrease: number = 0;
    private schedulerComponent: Component | null = null;

    private totalTonPoint: number = 0;

    public onEnterState(remainTime: number): void {
        const uiHud = UIHud.getDefaultInstance();
        const mainContext = GameMainContext.getDefault();
        this.continueCountTick = 0;

        const curGameNo = GameStateManager.getDefaultInstance().getCurrentGameNo();

        this.totalTonPoint = 0;

        if (GameResultContext.getDefault().gameNo != curGameNo) {

            if (remainTime > 5) {
                //UIHud.getDefaultInstance().showLoading(true);
                //GameStateManager.getDefaultInstance().onCheckSendResultReq();
            }
            else {
                uiHud.uiAlaram.showStatusMessage(false);
                uiHud.setShowWaitPopup(true);
            }
        }
        else {


            let state = GameActorControl.getDefaultInstance().getState();
            if (state != ActorState.ACTOR_STATE_ARRIVE) {
                const uiPath = UIPath.getDefaultInstance();
                uiPath.showResultCoin(true, GameResultContext.getDefault().winResultPos, 1);
                GameResultContext.getDefault().isWin = GameMainContext.getDefault().betActor == GameResultContext.getDefault().winActor;
                PathMaker.getDefaultInstance().setPath(0, GameResultContext.getDefault().pathFlags[0]);
                PathMaker.getDefaultInstance().setPath(1, GameResultContext.getDefault().pathFlags[1]);
                PathMaker.getDefaultInstance().setPath(2, GameResultContext.getDefault().pathFlags[2]);
                GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_READY, 0);
                GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_READY, 1);
                GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_MOVE, 0, 100);
                GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_MOVE, 1, 100);
                GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_ARRIVE, 0);
                GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_ARRIVE, 1);
            }

            //UIHud.getDefaultInstance().showLoading(false);
            uiHud.setShowWaitPopup(false);
            if (GameMainContext.getDefault().betActor != 0) {
                const isVictory = GameResultContext.getDefault().isWin;
                uiHud.uiAlaram.showStatusMessage(true, isVictory ? 3 : 4);

                if (isVictory) {
                    //GameStateManager.getDefaultInstance().getCurrentGameNo
                    //UIWinAlarmTab.getDefaultInstance().

                }
                else {
                    if (GameAudioManger.getDefaultInstance() != null)
                        GameAudioManger.getDefaultInstance().playSound("lose");
                }
                // If consecutive wins exist, display the consecutive win message after 5 seconds.
                // this.continueCountTick = remainTime - 5;

                // If the player wins, update the total TON points.
                // if (isVictory) {
                //     this.totalTonPoint = mainContext.tonPoint + (mainContext.betTonPoint * 2);
                //     // If 9 seconds remain, apply the increase animation.
                //     if (remainTime >= 9)
                //         this.startTonPointIncrease(mainContext);
                //     else
                //         mainContext.setTonPoint(this.totalTonPoint);
                // }
            }
        }
    }

    private startTonPointIncrease(mainContext: GameMainContext) {
        this.tonPointIncreaseAmount = mainContext.betTonPoint * 2;
        this.tonPointCurrentIncrease = 0;

        // Since UIHud is a Component, scheduling is possible.
        this.schedulerComponent = UIHud.getDefaultInstance();

        if (this.schedulerComponent) {
            this.schedulerComponent.schedule(this.increaseTonPoint.bind(this, mainContext), 0.01);
        }
    }

    private increaseTonPoint(mainContext: GameMainContext) {
        if (this.tonPointCurrentIncrease < this.tonPointIncreaseAmount) {
            mainContext.setTonPoint(mainContext.tonPoint + 1, true);
            this.tonPointCurrentIncrease++;
        } else {
            if (this.schedulerComponent) {
                this.schedulerComponent.unschedule(this.increaseTonPoint.bind(this, mainContext));
            }
        }
    }

    public onUpdate(deltaTime: number) {
        // if(this.continueCountTick != 0)
        // {
        //     this.continueCountTick -= deltaTime;
        //     if( this.continueCountTick <= 0 )
        //     {
        //         this.continueCountTick = 0;
        //         const uiHud = UIHud.getDefaultInstance();
        //         uiHud.uiAlaram.showStatusMessage(true, AlaramType.STRAIGHT_WINS);

        //         GameMissionNotiControl.getDefaultInstance().doCheck();
        //     }
        // }
    }

    public onCloseState(): void {
        GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_FINISH);

        const mainContext = GameMainContext.getDefault();
        mainContext.clearGameRound();

        if (this.schedulerComponent) {
            this.tonPointCurrentIncrease = this.tonPointIncreaseAmount;
            GameMainContext.getDefault().setTonPoint(this.totalTonPoint);
            this.schedulerComponent.unschedule(this.increaseTonPoint.bind(this, GameMainContext.getDefault()));
        }

    }
}