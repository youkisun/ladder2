import { GameActorControl } from "../Actor/GameActorControl";
import { GameBetPacket, GameInitPacket, GameResultPacket } from "../Network/GamePacket";
import { PathMaker } from "../Path/PathMaker";
import { UIHud } from "../UI/UIHud";
import { UIPath } from "../UI/UIPath";
import { GameTimeManager } from "../Utils/GameTimeManager";
import { Default, GameUtil } from "../Utils/GameUtils";
import { GameBonusRoulette } from "../BonusRoulette/GameBonusRoulette";
import { GameStateManager } from "./GameStateManager";
import { GameUIManager, UIType } from "./GameUIManager";
import { GameUserBetState } from "../UserBetState/GameUserBetState";
import { GameNetwork } from "../Network/GameNetwork";
import { GameTopMsgAlaram } from "../Common/GameTopMsgAlaram";
import { UITopMsgAlaram } from "../UI/UITopMsgAlaram";
import { UISelectActorAlarmTab } from "../UI/UISelectActorAlarmTab";
import { GameBettingControl } from "./GameBettingControl";
import { UIShortAlarm } from "../UI/UIShortAlarm";
import { UIAttendanceBonus } from "../UI/UIAttendanceBonus";
import { GameCommon, Logger } from "../Common/GameCommon";
import { GameRandom } from "../Utils/GameRandom";
import { random } from "cc";
import { GameMissionNotiControl } from "./GameMissionNotiControl";

export class LadderContext {
    public static TYPE_START_LEFT = 0;
    public static TYPE_START_RIGHT = 1;

    public static TYPE_EVEN = 0;
    public static TYPE_ODD = 1;

    public ladderResult: LadderResult = {
        result: 0,
        startPoint: 0,
        paths: [],
    };

    public evenData: LadderData[] = [
        new LadderData(LadderContext.TYPE_START_LEFT, LadderContext.TYPE_ODD),
        new LadderData(LadderContext.TYPE_START_RIGHT, LadderContext.TYPE_EVEN),
    ];

    public oddData: LadderData[] = [
        new LadderData(LadderContext.TYPE_START_LEFT, LadderContext.TYPE_EVEN),
        new LadderData(LadderContext.TYPE_START_RIGHT, LadderContext.TYPE_ODD),
    ];

    /**
     * Generates a random path.
     * @param evenOrOdd Indicates whether the path is even or odd.
     * @returns An array representing the path.
     */
    public GetRandomPath(evenOrOdd: number): boolean[] {
        const oddPaths: boolean[][] = [
            [true, false, false],
            [false, true, false],
            [false, false, true],
            [true, true, true],
        ];

        const evenPaths: boolean[][] = [
            [true, true, false],
            [true, false, true],
            [false, true, true],
        ];

        if (evenOrOdd % 2 === LadderContext.TYPE_ODD) {
            return evenPaths[Math.floor(Math.random() * evenPaths.length)];
        } else {
            return oddPaths[Math.floor(Math.random() * oddPaths.length)];
        }
    }

    /**
     * Calculates the ladder result.
     * @returns The result of the ladder game.
     */
    public CalculateLadderResult(): LadderResult {
        // Calculate the result
        const result = GameUtil.getEvenOrOdd();

        let ladderData: LadderData;
        if (result === LadderContext.TYPE_EVEN) {
            ladderData = this.evenData[GameUtil.getEvenOrOdd()];
        } else {
            ladderData = this.oddData[GameUtil.getEvenOrOdd()];
        }

        this.ladderResult = {
            startPoint: ladderData.startPoint,
            result: result,
            paths: this.GetRandomPath(ladderData.ladderCountType),
        };

        return this.ladderResult;
    }
}

export class LadderData {
    public startPoint: number;
    public ladderCountType: number;

    constructor(startPoint: number, ladderCountType: number) {
        this.startPoint = startPoint;
        this.ladderCountType = ladderCountType;
    }
}

export interface LadderResult {
    result: number;
    startPoint: number;
    paths: boolean[];
}

export class GameResultContext {
    public isWin: boolean = false;
    public pathFlags: boolean[] = new Array(3).fill(false);
    public winActor: number = 0;
    public winResultPos: number = 0;
    public isShowResultDirect: boolean = false;
    public gameNo: number;

    public leftResultPosIndex: number = 0;
    public rightResultPosIndex: number = 0;

    public setPath(bridge_num: number) {
        this.pathFlags.fill(false);

        if (typeof this.gameNo === "undefined") {
            return;
        }

        let random = new GameRandom(this.gameNo.toString());

        if (bridge_num == 1) {
            const randomIndex = Math.floor(random.nextInRange(0, this.pathFlags.length - 1));
            this.pathFlags[randomIndex] = true;
        }
        else if (bridge_num == 2) {
            // Initialize the array (always set size to 3)
            this.pathFlags = [false, false, false];

            // Randomly set two positions to true
            let count = 0;
            while (count < 2) {
                let index = Math.floor(random.nextInRange(0, 2)); // Choose one of 0, 1, 2
                if (!this.pathFlags[index]) { // Prevent duplicates
                    this.pathFlags[index] = true;
                    count++;
                }
            }
        }
        else {
            this.pathFlags = [true, true, true];
        }
    }
}


export class GameMainContext extends Default<GameMainContext> {
    public initPacket: GameInitPacket;
    public userName: string;
    public continueWinCount: string;
    public remainTime: number = 0;
    public round: number = 0;
    public betActor: number = 0;

    public tonPoint: number = 0;
    public tonAdress: string;
    public runPoint: number = -1;
    public roulettePoint: number = 0;
    public airdropCredit: number = 0;
    public betTonPoint: number = 0;
    public resultContext: GameResultContext = new GameResultContext();
    public isShowPlaying: boolean = false;
    public isInit: boolean = false;
    public userid: number;
    public isGameStop: boolean = false;
    public isInGameMode: boolean = false;

    //public telegram_id: string = "5798680778"; 

    public onSetTonPointEvent: ((amount: number, isTweenAnim: boolean) => void) | null = null;
    public onSetTonAdressEvent: ((address: string) => void) | null = null;
    public onSetRunPointEvent: ((amount: number, isTweenAnim: boolean) => void) | null = null;

    public onSetRoulettePointEvent: ((amount: number, isScaleTween: boolean) => void) | null = null;
    public onSetBetActorEvent: ((betActor: number) => void) | null = null;
    public onSetAirdropCreditEvent: ((credit: number) => void) | null = null;
    public onSetBetTonEvent: ((active: boolean, betAmount: number) => void) | null = null;
    public onSetUserNameEvent: ((value: string) => void) | null = null;
    public onSetNowStreakEvent: ((value: string) => void) | null = null;
    public onSetUIDEvent: ((value: string) => void) | null = null;
    public onSetTotalGamesEvent: ((value: string) => void) | null = null;
    public onSetTotalWinsEvent: ((value: string) => void) | null = null;

    constructor() {
        super();
    }

    public isReadyMode(): boolean {
        return this.initPacket.isContainLastBetInfo() || this.resultContext.winActor == 0;
    }

    public getMyBetPastGameResults(): Array<{
        game_no: number;
        bet_type: number;
        win_r_points: number;
        bet_t_points: number;
        win_t_points: number;
        total_roul_bonus: number;
        bet_winner: number;
        res_winner: number;
        res_streak: number;
    }> {
        return this.initPacket.lastTenGames;
    }

    public getTenPastGameResults(): Array<{
        game_no: number;
        bridge_num: number;
        side: number;
        winner: number;
        winStatus: number;
        betAmount: number;
        res_streak: number;
    }> {
        if (!this.initPacket || !this.initPacket.pastGameResults) {
            Logger.error("initPacket or pastGameResults is undefined.");
            return [];
        }

        if (this.initPacket.pastGameResults.length < 20) {
            Logger.error("pastGameResults array has less than 20 elements.");
            return [];
        }

        return this.initPacket.pastGameResults.slice(10, 20);
    }

    public addTonPoint(addPoint: number, isScaleTween: boolean = false) {
        this.tonPoint += addPoint;
        this.setTonPoint(this.tonPoint, isScaleTween);
    }

    public setTonPoint(point: number, isScaleTween: boolean = false) {
        this.tonPoint = GameUtil.toTwoDecimal(point);

        Logger.log(`[POINT] setTonPoint - ${this.tonPoint}`);

        if (this.onSetTonPointEvent) {
            this.onSetTonPointEvent(this.tonPoint, isScaleTween);
        }
    }

    public setTonAddress(address: string) {
        this.tonAdress = address;
        Logger.log(`[POINT] setTon Adress - ${address}`);

        if (this.onSetTonAdressEvent) {
            this.onSetTonAdressEvent(this.tonAdress);
        }
    }

    public addRunPoint(point: number) {
        
        this.setRunPoint(this.runPoint + point);
    }

    public setRunPoint(point: number,
        isScaleTween: boolean = false,
        isInit: boolean = false,
        isForce: boolean = false) {

        console.log(`setRunPoint - point : ${point}, isInit:${isInit}, isForce:${isForce}`);
        if (this.runPoint == point && !isForce)
            return;

        this.runPoint = point;
        if (this.onSetRunPointEvent) {
            this.onSetRunPointEvent(point, isScaleTween);
        }
    }


    public addRoulettePoint(addPoint: number, isScaleTween: boolean = false) {
        this.roulettePoint += addPoint;
        this.roulettePoint = GameUtil.toTwoDecimal(this.roulettePoint);

        if (this.onSetRoulettePointEvent) {
            this.onSetRoulettePointEvent(this.roulettePoint, isScaleTween);
        }
    }

    public setRoulettePoint(point: number, isScaleTween: boolean = false) {
        this.roulettePoint = GameUtil.toTwoDecimal(point);

        if (this.onSetRoulettePointEvent) {
            this.onSetRoulettePointEvent(this.roulettePoint, isScaleTween);
        }

        Logger.log(`[POINT] setRoulettePoint - ${this.roulettePoint}`);
    }

    public setAirDropCredit(credit: number) {

        this.airdropCredit = credit;

        if (this.onSetAirdropCreditEvent) {
            this.onSetAirdropCreditEvent(credit);
        }
    }

    public setBetActorAndAmount(betActor: number) {
        if (UISelectActorAlarmTab.getDefaultInstance() != null)
            UISelectActorAlarmTab.getDefaultInstance().showBetActorUI(betActor, 0);

        this.setBetActor(betActor);
        //this.setBetAmount(betAmount);
    }

    public setBetActor(betActor: number) {

        console.log(`setBetActor:${betActor}`);
        this.betActor = betActor;

        if (GameActorControl.getDefaultInstance()) {
            const actorControl = GameActorControl.getDefaultInstance();
            if (actorControl != null) {
                actorControl.leftActor.SetSelectedActorImage(this.betActor == 1);
                actorControl.rightActor.SetSelectedActorImage(this.betActor == 2);
                //GameUserBetState.getDefaultInstance().setMyBetValue(this.betActor-1);
                if (this.onSetBetActorEvent) {
                    this.onSetBetActorEvent(this.betActor - 1);
                }
            }
        }
    }

    public setUserName(userName: string) {
        this.userName = userName;

        if (this.onSetUserNameEvent != null)
            this.onSetUserNameEvent(userName);

        //const uiHud = UIHud.getDefaultInstance();
        //uiHud.uiTopMenu.setNickLabel("user : " + userName);
    }

    public setContinueWinCount(value: number) {
        this.continueWinCount = value.toString();

        if (this.onSetNowStreakEvent != null)
            this.onSetNowStreakEvent(this.continueWinCount);

        //const uiHud = UIHud.getDefaultInstance();
        //uiHud.uiRecordInform.setContinueWinCountLabel(this.continueWinCount);
    }

    public setUID(value: number) {
        this.userid = value;

        if (this.onSetUIDEvent != null)
            this.onSetUIDEvent(value.toString());


    }

    public setTotalGames(value: number) {
        if (this.onSetTotalGamesEvent != null)
            this.onSetTotalGamesEvent(value.toString());
    }

    public setTotalWins(value: number) {
        if (this.onSetTotalWinsEvent != null)
            this.onSetTotalWinsEvent(value.toString());
    }

    public setBetAmount(value: number) {

        this.betTonPoint = GameUtil.toTwoDecimal(value);

        if (this.onSetBetTonEvent) {
            this.onSetBetTonEvent(true, this.betTonPoint);
        }
    }

    public setOnSetInit(initPacket: GameInitPacket, isInitialize: boolean) {
        const gameStateMgr = GameStateManager.getDefaultInstance();
        this.initPacket = initPacket;        
        //this.setTonPoint(initPacket.t_points);
        this.setTonAddress(initPacket.ton_addr);
        this.setUID(initPacket.t_id);
        this.setRoulettePoint(initPacket.roulette_points);
        this.setContinueWinCount(initPacket.con_win_cnt);
        this.setTotalGames(initPacket.total_games);
        this.setTotalWins(initPacket.total_wins);
        this.setAirDropCredit(initPacket.air_cnt);

        let isSetRunPoint = false;

        // Initialize on first connection.
        if (isInitialize) {
            const mainContext = GameMainContext.getDefault();
            mainContext.clearGameRound();

            let showBonus = initPacket.att_bonus_cnt > 0;

            // Display the bet amount/actor.
            if (initPacket.lastBetInfo.last_bet_game_no == gameStateMgr.getCurrentGameNo()) {
                this.setBetActorAndAmount(initPacket.lastBetInfo.last_bet_winner);

                if (initPacket.cur_game_mode == gameStateMgr.STATE_BETTING) {
                    GameBettingControl.getDefaultInstance().setCurrentBetStatus(initPacket.lastBetInfo.last_bet_t_points, initPacket.lastBetInfo.last_bet_winner);
                }

                // Before displaying the result, deduct the winnings and consecutive wins if the player has won
                if (gameStateMgr.getState() == gameStateMgr.STATE_COUNT_DOWN ||
                    gameStateMgr.getState() == gameStateMgr.STATE_PLAY ||
                    gameStateMgr.getState() == gameStateMgr.RESULT_TIME) {

                    if (initPacket.lastBetInfo.isWin) {
                        isSetRunPoint = true;
                        this.setRunPoint(Math.max(0, initPacket.r_points - 10), false, true);

                        let getWinRouletteCnt = GameMissionNotiControl.getDefaultInstance().getContinueWinCnt(initPacket.con_win_cnt);;
                        this.setRoulettePoint(Math.max(0, initPacket.roulette_points - getWinRouletteCnt));

                        GameMainContext.getDefault().initPacket.con_win_cnt = Math.max(0, GameMainContext.getDefault().initPacket.con_win_cnt - 1);
                    }
                }
            }

            this.setUserName(initPacket.nick);

            switch (initPacket.cur_game_mode) {
                case gameStateMgr.STATE_PLAY:
                case gameStateMgr.STATE_RESULT:
                case gameStateMgr.STATE_COUNT_DOWN:
                    this.isShowPlaying = true;
                    break;
            }
            PathMaker.getDefaultInstance().setHidePath();

            if (showBonus) {
                GameNetwork.getDefaultInstance().sendBonusReq(
                    async (resultPacket) => {
                        Logger.log("Received result sendBonusReq response:", resultPacket);

                        if (resultPacket.suc) {
                            const node = GameUIManager.getDefaultInstance().load(UIType.ATTENDANCE_BONUS);
                            if (node) {
                                const uiAttendanceBonus = node.getComponent(UIAttendanceBonus);
                                uiAttendanceBonus.show(resultPacket.att_bonus_t_points,
                                    resultPacket.att_bonus_roulette_points,
                                    resultPacket.ret_roulette_points,
                                    resultPacket.ret_t_points);
                            }
                        }
                        else {
                            Logger.log("Bonus request failed.");
                        }
                    });
            }
        }
        else {

        }

        if (!isSetRunPoint)
            this.setRunPoint(initPacket.r_points, false, true);

    }

    public setOnBetPacket(betPacket: GameBetPacket) {
        this.setBetActorAndAmount(betPacket.bet_winner);
        this.setAirDropCredit(betPacket.ret_air_cnt);

        //GameTimeManager.getInstance().setServerTime(betPacket.server_t_stamp);
    }

    public setOnResultPacket(resultPacket: GameResultPacket) {

        this.resultContext.winActor = resultPacket.winner;
        this.resultContext.winResultPos = resultPacket.side;
        this.resultContext.isWin = resultPacket.winner == this.betActor;
        this.resultContext.gameNo = resultPacket.game_no;
        this.resultContext.setPath(resultPacket.bridge_num);

        Logger.log("SET WINNER :" + resultPacket.winner);
        //GameTimeManager.getInstance().setServerTime(resultPacket.server_t_stamp);
    }

    public clearGameRound() {
        this.setBetActor(0);
        this.resultContext.isWin = false;
        this.resultContext.winActor = 0;
        Logger.log("CLEAR WINNER :");
        this.setBetActor(0);
        this.setBetAmount(0);
        this.isShowPlaying = false;
    }

    public clear(): void {
        this.initPacket = null as any;
        this.userName = '';
        this.continueWinCount = '';
        this.remainTime = 0;
        this.round = 0;
        this.setBetActor(0);
        this.tonPoint = 0;
        this.tonAdress = '';
        this.runPoint = -1;
        this.roulettePoint = 0;
        this.airdropCredit = 0;
        this.betTonPoint = 0;
        this.resultContext = new GameResultContext();
        this.isShowPlaying = false;
        this.isInit = false;
        this.userid = 0;
        this.isGameStop = false;

        this.onSetTonPointEvent = null;
        this.onSetTonAdressEvent = null;
        this.onSetRunPointEvent = null;
        this.onSetRoulettePointEvent = null;
        this.onSetBetActorEvent = null;
        this.onSetAirdropCreditEvent = null;
        this.onSetBetTonEvent = null;
        this.onSetUserNameEvent = null;
        this.onSetNowStreakEvent = null;
        this.onSetUIDEvent = null;
        this.onSetTotalGamesEvent = null;
        this.onSetTotalWinsEvent = null;
    }


    public CheckErrorAlert(errorCode: number, err_msg: string, err_act: number) {

        if (errorCode > 0) {
            GameCommon.showPopup(err_msg, "Notice", err_act == 0 ? true : false);

            // If err_act is 1, stop all actions.
            if (err_act == 1) {
                this.isGameStop = true;
            }

            UIHud.getDefaultInstance().setErrorMessageLabel(err_msg);
        }

        // let errorMessage = "";
        // if (errorCode == 1) {
        //     errorMessage = "Unknown error.";
        //     GameCommon.showPopup(errorMessage, "Error", true);

        // }
        // else if (errorCode == 2) {
        //     errorMessage = "Format error.";
        //     GameCommon.showPopup(errorMessage, "Error", true);
        // }
        // else if (errorCode == 3) {
        //     if(err_msg.length > 0)
        //     {
        //         GameCommon.showPopup(err_msg, "Notice", err_act == 0 ? true : false);
        //     }
        //     else
        //     {
        //         errorMessage = "The server is currently under maintenance.";
        //         GameCommon.showPopup(errorMessage, "Notice", false);
        //     }

        // }
        // else if (errorCode == 10) {
        //     errorMessage = "Login failed.";
        //     GameCommon.showPopup(errorMessage, "Error", true);
        // }
        // else if (errorCode == 11) {
        //     errorMessage = "Invalid game number requested.";
        //     GameCommon.showPopup(errorMessage, "Error", true);
        // }
        // else if (errorCode == 100) {
        //     errorMessage = "Time error occurred.";
        //     GameCommon.showPopup(errorMessage, "Error", true);
        // }
        // else if (errorCode == 1000) {
        //     errorMessage = "Insufficient betting points.";
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(errorMessage);
        // }
        // else if (errorCode == 1001) {
        //     errorMessage = "Insufficient attendance bonus.";
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(errorMessage);
        // }
        // else if (errorCode == 1003) {
        //     errorMessage = "Duplicate Betting Error Occurred.";
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(errorMessage);
        // }
        // else if (errorCode == 1100) {
        //     errorMessage = "Invalid TON Address Format.";
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(errorMessage);
        // }
        // else if (errorCode == 1101) {
        //     errorMessage = "Currently Registered TON Address Format.";
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(errorMessage);
        // }
        // else if (errorCode == 1200) {
        //     errorMessage = "Nickname already exists.";
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(errorMessage);
        // }



    }
}