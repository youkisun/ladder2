import { _decorator, Component, Node } from 'cc';
import { GameRandom } from '../Utils/GameRandom';
import { GameMainContext } from '../Main/GameMainContext';
import { GameStateManager } from '../Main/GameStateManager';
import { UIHud } from '../UI/UIHud';
import { GameState } from '../Main/GameState';
import { DefaultComponent } from '../Utils/GameUtils';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

export class UserBetData {
    public time: number;
    public betValue: number;

    constructor(time: number, betValue: number) {
        this.time = time;
        this.betValue = betValue;
    }
}

@ccclass('GameUserBetState')
export class GameUserBetState extends DefaultComponent<GameUserBetState> {

    startPointRatioValues: number[][] = [
        [70, 90, 100],
        [50, 90, 100],
        [40, 90, 100],
    ];

    private userBetData: UserBetData[] = [];
    private isPlay: boolean;
    private remainTime: number;
    private checkRemainTime: number;

    private leftBetCount: number;
    private rightBetCount: number;

    public start(): void {
        GameMainContext.getDefault().onSetBetActorEvent = this.setMyBetValue.bind(this);
    }

    // Set my betting value
    public setMyBetValue(bet: number) {
        let userBetDataEntry: UserBetData = { time: 0, betValue: bet };
        this.userBetData.push(userBetDataEntry);
        this.userBetData.sort((a, b) => a.time - b.time);
    }

    private make(seed: number) {
        const random = new GameRandom(seed.toString());
        this.userBetData = [];

        let startPointRatio: number[] = [0, 0, 0];
        let value = random.nextInRange(0, 100);

        if (value < 50) {
            // Early betting probability
            startPointRatio = this.startPointRatioValues[0];
        } else if (value < 80) {
            // Mid betting probability
            startPointRatio = this.startPointRatioValues[1];
        } else {
            // Late betting probability
            startPointRatio = this.startPointRatioValues[2];
        }

        // Betting users
        let betUserCount = random.nextInRange(5, 50);
        Logger.log(`[BET_STATUS] betUserCount : ${betUserCount}`);

        for (let i = 0; i < betUserCount; i++) {
            value = random.nextInRange(0, 100);
            for (let j = 0; j < startPointRatio.length; j++) {
                const userBetDataEntry: UserBetData = { time: 0, betValue: 0 };

                if (value < startPointRatio[j]) {
                    if (j === 0) {
                        // Betting between 1 and 10 seconds
                        userBetDataEntry.time = random.nextInRange(3, 10);
                    } else if (j === 1) {
                        // Betting between 11 and 20 seconds
                        userBetDataEntry.time = random.nextInRange(11, 20);
                    } else {
                        // Betting between 21 and 29 seconds
                        userBetDataEntry.time = random.nextInRange(21, 29);
                    }

                    // Left or right betting
                    let randomBetValue = random.nextInRange(0, 100);
                    userBetDataEntry.betValue = randomBetValue > 45 ? 0 : 1;
                    this.userBetData.push(userBetDataEntry);
                    break;
                }
            }
        }

        // Sort by time
        this.userBetData.sort((a, b) => a.time - b.time);
        Logger.log(this.userBetData);
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.isPlay = false;
        this.node.active = false;
    }

    public play(remainTime: number, init: boolean) {
        // if (GameMainContext.getDefault().isInit == false) {
        //     this.hide();
        //     return;
        // }

        if (init)
            UIHud.getDefaultInstance().uiUserBetState.init();

        this.show();
        this.rightBetCount = 0;
        this.leftBetCount = 0;
        this.remainTime = remainTime;
        // Apply probability every 3 seconds
        const gameNo = GameStateManager.getDefaultInstance().getCurrentGameNo();
        this.make(gameNo);
        this.setCurSecondPercent(this.remainTime);
        this.checkRemainTime = Math.floor(this.remainTime / 3) * 3;
        this.isPlay = true;
    }

    update(deltaTime: number) {
        if (this.remainTime > 0)
            this.remainTime -= deltaTime;

        if (this.isPlay && this.userBetData.length > 0) {
            if (this.checkRemainTime > this.remainTime) {
                this.checkRemainTime = Math.floor(this.remainTime / 3) * 3;
                this.setCurSecondPercent(this.checkRemainTime);
            }

            if (this.remainTime <= 0) {
                this.isPlay = false;
                this.setCurSecondPercent(0);
            }
        }
    }

    private setCurSecondPercent(remainTime: number) {
        const second = GameStateManager.getDefaultInstance().BETTING_TIME - remainTime;

        for (let i = this.userBetData.length - 1; i >= 0; i--) {
            const item = this.userBetData[i];
            if (item.time <= second) {

                if (item.betValue > 0) {
                    this.rightBetCount++;
                }
                else {
                    this.leftBetCount++;
                }

                Logger.log(`[BET_STATUS] time : ${item.time}, leftBet : ${this.leftBetCount}, rightBet : ${this.rightBetCount}`);

                this.userBetData.splice(i, 1);
            }
        }

        // Adjust to ensure the total is 100%
        let totalBetCount = this.leftBetCount + this.rightBetCount;

        let leftPercent = totalBetCount > 0
            ? (this.leftBetCount / totalBetCount) * 100
            : 0;

        let rightPercent = totalBetCount > 0
            ? (this.rightBetCount / totalBetCount) * 100
            : 0;

        // Adjust the ratio to not exceed 100
        const total = leftPercent + rightPercent;
        if (total == 0) {

        }
        else if (total > 100) {
            const scale = 100 / total;
            leftPercent = Math.floor(leftPercent * scale);
            rightPercent = 100 - leftPercent;
        } else if (total < 100) {
            leftPercent = Math.ceil(leftPercent);
            rightPercent = 100 - leftPercent;
        }

        // Prevent negative values
        if (leftPercent < 0) leftPercent = 0;
        if (rightPercent < 0) rightPercent = 0;

        // Prevent 100% and adjust randomly
        if (leftPercent >= 100) {
            const randomValue = Math.floor(Math.random() * 10) + 1; // 1~10
            leftPercent = 100 - randomValue;
            rightPercent = randomValue;
        } else if (rightPercent >= 100) {
            const randomValue = Math.floor(Math.random() * 10) + 1; // 1~10
            leftPercent = randomValue;
            rightPercent = 100 - randomValue;
        }

        UIHud.getDefaultInstance().uiUserBetState.setPercent(leftPercent, rightPercent);
    }
}