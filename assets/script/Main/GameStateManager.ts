import { _decorator, Component, Node, director, log } from 'cc';
import { GameState } from "./GameState";
import { GameBettingState } from "./GameBettingState";
import { GameCountDownState } from "./GameCountDownState";
import { GameResultState } from "./GameResultState";
import { GameMainContext } from "./GameMainContext";
import { GameplayState } from './GamePlayState';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameTimeManager } from '../Utils/GameTimeManager';
import { GameInitPacket } from '../Network/GamePacket';
import { UIHud } from '../UI/UIHud';
import { GameNetwork } from '../Network/GameNetwork';
import { UIPath } from '../UI/UIPath';
import { GameUserBetState } from '../UserBetState/GameUserBetState';
import { GameRandom } from '../Utils/GameRandom';
import { GameAudioManger } from './GameAudioManger';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;


@ccclass('GameStateManager')
export class GameStateManager extends DefaultComponent<GameStateManager> {

    public BETTING_TIME: number = 30;
    public COUNT_DOWN_TIME: number = 10;
    public PLAY_TIME: number = 10;
    public RESULT_TIME: number = 10;

    public STATE_BETTING: number = 0;
    public STATE_COUNT_DOWN: number = 1;
    public STATE_PLAY: number = 2;
    public STATE_RESULT: number = 3;
    public STATE_MAX_COUNT: number = 4;


    private _curState: number = -1;
    private _prevState: number = -1;
    private _remainTime: number = 0;
    private currentRound: number = 0;

    private _curTick: number = 0.0;
    private _targetTick: number = 0.0;

    private initState: number;
    private initRemainTime: number;

    public getCurrentGameNo(): number {
        return this.GetGameNumber(this.getCurrentRound());
    }

    public getCurrentRemainTime(): number {
        return this._curTick;
    }

    public onSetRoundEvent: ((amount: number) => void) | null = null;



    protected onLoad() {
        super.onLoad();
    }

    start() {

    }

    update(deltaTime: number) {

        if (GameMainContext.getDefault().isGameStop)
            return;

        if (this._gameState[this.getState()] != null)
            this._gameState[this.getState()].onUpdate(deltaTime);

        if (this._targetTick <= 0)
            return;

        this._curTick += deltaTime;
        if (this._curTick >= this._targetTick) {
            this.onFinishState();
        }
    }

    private getStatusString(state: number): string {
        switch (state) {
            case this.STATE_BETTING:
                return "BettingState";
            case this.STATE_COUNT_DOWN:
                return "CountDownState";
            case this.STATE_PLAY:
                return "playState";
            case this.STATE_RESULT:
                return "ResultState";
            default:
                return "";
        }
    }

    public totalPlayTime(): number {
        return this.BETTING_TIME + this.COUNT_DOWN_TIME + this.PLAY_TIME + this.RESULT_TIME;
    }

    public getState(): number {
        return this._curState;
    }

    public isBettingState(): boolean {
        return this.getState() == this.STATE_BETTING;
    }

    private setState(value: number) {
        this._prevState = this._curState;
        this._curState = value;
    }

    private _gameState: GameState[] = [
        new GameBettingState(),
        new GameCountDownState(),
        new GameplayState(),
        new GameResultState(),
    ];

    public setInit(packet: GameInitPacket, isInitialize: boolean = false) {
        GameTimeManager.getInstance().setServerTime(packet.server_t_stamp);


        if (isInitialize) {
            if (this._curState != -1) {
                this._gameState[this._curState].onCloseState();
            }
        }

        this._curState = -1;
        this._prevState = -1;
        this.BETTING_TIME = packet.bet_sec;
        this.COUNT_DOWN_TIME = packet.wait_sec;
        this.PLAY_TIME = packet.game_sec - 10;
        this.RESULT_TIME = 10;

        this.RefreshTimeState();

        Logger.log(
            `[STATE] GameStateManager.setInit - initState: ${this._curState}, initRemainTime: ${this._remainTime}, currentRound: ${this.currentRound}, `
        );
    }

    public RefreshTimeState() {
        const utcNow = GameTimeManager.getInstance().getNowDate();

        // Start time of the day (UTC standard).
        const startOfDay = new Date(Date.UTC(
            utcNow.getUTCFullYear(),
            utcNow.getUTCMonth(),
            utcNow.getUTCDate(),
            0, 0, 0, 0
        ));

        // Calculate the elapsed time in seconds since the start of the day
        const secondsSinceStartOfDay = (utcNow.getTime() - startOfDay.getTime()) / 1000;

        const currentRound = this.getCurrentRound();
        const curPlayTime = secondsSinceStartOfDay % this.totalPlayTime();

        if (curPlayTime < this.BETTING_TIME) {
            this.setState(this.STATE_BETTING);
            this._remainTime = this.BETTING_TIME - curPlayTime;
        } else if (curPlayTime < this.BETTING_TIME + this.COUNT_DOWN_TIME) {
            this.setState(this.STATE_COUNT_DOWN);
            this._remainTime = this.BETTING_TIME + this.COUNT_DOWN_TIME - curPlayTime;
        } else if (curPlayTime < this.BETTING_TIME + this.COUNT_DOWN_TIME + this.PLAY_TIME) {
            this.setState(this.STATE_PLAY);
            this._remainTime = this.BETTING_TIME + this.COUNT_DOWN_TIME + this.PLAY_TIME - curPlayTime;
        } else {
            this.setState(this.STATE_RESULT);
            this._remainTime = this.totalPlayTime() - curPlayTime;
        }

        this.onSetRoundEvent(currentRound);
        //this.getCurrentGameNo() = this.GetGameNumber(currentRound);
        this.currentRound = currentRound;
    }

    private GetGameNumber(currentRound: number): number {
        const utcNow = GameTimeManager.getInstance().getNowDate();
        const year = (utcNow.getUTCFullYear() % 100).toString();
        const month = (utcNow.getUTCMonth() + 1).toString();
        const day = utcNow.getUTCDate().toString();

        // Format numbers to 2 digits.
        const formattedDate =
            (year.length === 1 ? "0" + year : year) +
            (month.length === 1 ? "0" + month : month) +
            (day.length === 1 ? "0" + day : day);

        // Format currentRound to 4 digits
        const roundString = currentRound.toString();
        const formattedRound = roundString.length < 4 ? "0".repeat(4 - roundString.length) + roundString : roundString;

        return parseInt(`${formattedDate}${formattedRound}`);
    }

    public getCurrentRound(): number {
        const utcNow = GameTimeManager.getInstance().getNowDate();

        const startOfDay = new Date(Date.UTC(
            utcNow.getUTCFullYear(),
            utcNow.getUTCMonth(),
            utcNow.getUTCDate(),
            0, 0, 0, 0
        ));

        const secondsSinceStartOfDay = (utcNow.getTime() - startOfDay.getTime()) / 1000;

        return Math.trunc(secondsSinceStartOfDay / this.totalPlayTime()) + 1;
    }

    private getStateTime(state: number): number {
        switch (state) {
            case this.STATE_BETTING:
                return this.BETTING_TIME;
            case this.STATE_COUNT_DOWN:
                return this.COUNT_DOWN_TIME;
            case this.STATE_PLAY:
                return this.PLAY_TIME;
            case this.STATE_RESULT:
                return this.RESULT_TIME;
            default:
                Logger.error(`Undefined state: ${state}`);
                return 0;
        }
    }

    public playState(isForce: boolean = false): void {

        if(GameMainContext.getDefault().isInit == false)
        {
            return;
        }

        const formatter = new Intl.DateTimeFormat("ko-KR", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
        let utcTime = formatter.format(new Date()).replace(/[^0-9]/g, "");
        console.log(`[STATE] curState : ${this._curState}, prevState : ${this._prevState}, remainTime : ${this._remainTime}, utc : ${utcTime}`);

        if (!isForce && this._prevState == this._curState) {
            // Recalculate because it does not match the client time
            Logger.log("[STATE] Duplicate state playState - Remaining time: " + this._remainTime.toString() + ", State: " + this.getState().toString());
            this._curTick = 0.0;
            this._targetTick = this._remainTime + 0.1;
            UIHud.getDefaultInstance().setErrorMessageLabel(`${this._curState} Duplicate state`);
            return;
        }

        GameMainContext.getDefault().remainTime = this._remainTime;
        GameMainContext.getDefault().round = this.currentRound;

        if (this._prevState != -1) {
            const prevStateStr = this.getStatusString(this._prevState);
            Logger.log(`[STATE] ${prevStateStr}.onCloseState`);

            if (this._prevState != this._curState)
                this._gameState[this._prevState].onCloseState();
        }

        const stateStr = this.getStatusString(this.getState());
        Logger.log(`[STATE] ${stateStr}.onEnterState`);

        UIHud.getDefaultInstance().setErrorMessageLabel(`${stateStr} Start State`);
        this._gameState[this.getState()].onEnterState(this._remainTime);

        this._curTick = 0.0;
        this._targetTick = this._remainTime;// + 0.2;

        Logger.log("[STATE] playState - Remaining time : " + this._remainTime.toString() + ", State : " + this.getState().toString())
    }

    private onFinishState(): void {
        this.RefreshTimeState();
        this.playState();
        this.onCheckSendInitReq();
    }

    public onForceRefreshState() {
        this.RefreshTimeState();
        this.playState(true);
    }

    private sendInitTimeId: number = -1;

    public onCheckSendInitReq() {

        if (this._curState == this.STATE_BETTING ||
            this._curState == this.STATE_COUNT_DOWN) {

            if (this.getCurrentGameNo() != GameMainContext.getDefault().initPacket.cur_game_no) {
                if (this.sendInitTimeId != -1) {
                    clearTimeout(this.sendInitTimeId);
                    this.sendInitTimeId = -1;
                }

                const random = new GameRandom();
                // Send a packet between 1 and 2 seconds.
                const delay = random.nextInRange(100, 1200);
                this.sendInitTimeId = setTimeout(() => {

                    const formatter = new Intl.DateTimeFormat("ko-KR", {
                        timeZone: "UTC",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false
                    });
                    let utcTime = formatter.format(new Date()).replace(/[^0-9]/g, "");
                    console.log(`[STATE] sendInit - utc : ${utcTime}`);


                    GameNetwork.getDefaultInstance().SendInitReq();
                    this.sendInitTimeId = -1;
                }, delay);
            }
        }
    }

    public onCheckSendResultReq() {
        const mainContext = GameMainContext.getDefault();
        const curGameNo = this.getCurrentGameNo();

        if (mainContext.resultContext.gameNo == curGameNo)
            return;

        GameNetwork.getDefaultInstance().sendResultReq(curGameNo,
            (resultPacket) => {

                Logger.log("Received result response:", resultPacket);
                mainContext.setOnResultPacket(resultPacket);

                if (this.getState() == this.STATE_PLAY || this.getState() == this.STATE_RESULT) {
                    Logger.log("force onFinishState");
                    GameStateManager.getDefaultInstance().onForceRefreshState();
                }

            });
    }
}