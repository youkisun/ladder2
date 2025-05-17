import { _decorator, Component, Node } from 'cc';
import { DefaultComponent, GameUtil } from '../Utils/GameUtils';
import { GameStateManager } from './GameStateManager';
import { GameNetwork } from '../Network/GameNetwork';
import { GameMainContext } from './GameMainContext';
import { UIHud } from '../UI/UIHud';
import { UIShortAlarm } from '../UI/UIShortAlarm';
import { GameAudioManger } from './GameAudioManger';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

@ccclass('GameBettingControl')
export class GameBettingControl extends DefaultComponent<GameBettingControl> {

    private betAmount: number = 0.0;
    private selectedActor: number = 1;
    private isShow: boolean = false;

    protected start(): void {
        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.onClickBetBtnEvent = this.onClickBetBtnEvent.bind(this);
        uiHud.uiBetMenu.onClickBetAmountBtnEvent = this.onClickBetAmountBtnEvent.bind(this);
        uiHud.uiBetMenu.onClickClearBetAmountBtnEvent = this.onClickClearBetAmountBtnEvent.bind(this);
        uiHud.uiBetMenu.onClickBetActorButtonEvent = this.onClickBetActorButtonEvent.bind(this);
    }

    public setCurrentBetStatus(betAmount: number, betActor: number) {
        //if (betAmount > 0 && betActor > 0) {
        if (betActor > 0) {
            this.isShow = true;
            let uiHud = UIHud.getDefaultInstance();
            uiHud.uiBetMenu.showUI();

            this.selectedActor = betActor;
            this.betAmount = GameUtil.toTwoDecimal(betAmount);

            uiHud.uiBetMenu.setBetActorButtonUI(betActor - 1);
            uiHud.uiBetMenu.setReserveBetLabel(betAmount);

            uiHud.uiBetMenu.buttonDisable();        }

    }

    public setRefreshUI() {
        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.activeUI();        
    }

    private onClickBetActorButtonEvent(betActorArrayIndex: number) {
        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().playSound("button");
        this.selectedActor = betActorArrayIndex + 1;
        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.setBetActorButtonUI(betActorArrayIndex);
        Logger.log("[BET_CONTROL] betActorButtonEvent - selectedActor : " + this.selectedActor.toString());
    }

    private onClickClearBetAmountBtnEvent() {

        this.betAmount = 0;
        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.setReserveBetLabel(0);
        UIShortAlarm.getDefaultInstance().showShortAlarm(`Clear Bet`, 1);
    }

    private onClickBetAmountBtnEvent(amount: number) {
        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().playSound("button");
        this.betAmount += amount;
        if (this.isCanBetAmount()) {
            let uiHud = UIHud.getDefaultInstance();
            uiHud.uiBetMenu.setReserveBetLabel(this.betAmount);
            UIShortAlarm.getDefaultInstance().showShortAlarm(`+${this.betAmount.toFixed(1)}`, 1);
            Logger.log(`[BET_CONTROL] onClickBetAmountBtnEvent - amount : ${amount}`);
        }
        else {
            this.betAmount -= amount;
        }
    }

    private onClickBetBtnEvent() {
        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().playSound("button");

        if (this.isCanBetAmount() == false)
            return;

        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.buttonDisable();

        //this.betAmount = Math.round(this.betAmount * 100) / 100;
        this.betAmount = 0.1;//Math.round(this.betAmount * 100) / 100;

        GameNetwork.getDefaultInstance().sendBetReq({ type: 101, bet_game_no: GameStateManager.getDefaultInstance().getCurrentGameNo(), bet_type: 1, bet_t_points: 0, bet_winner: this.selectedActor },
            (resultPacket) => {
                Logger.log("Received result onBet response:", resultPacket);
                GameMainContext.getDefault().setOnBetPacket(resultPacket);
            });
    }

    private isCanBetAmount(): boolean {
        // if (this.betAmount > 1.0 && GameMainContext.getDefault().initPacket.total_games < 50) {
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(`**Bets of 1 TON or more are only allowed after 50 or more game participations.**`, 2);
        //     return;
        // }

        // if (this.betAmount > GameMainContext.getDefault().tonPoint) {
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(`Insufficient funds.`, 2);
        //     //alert("Insufficient funds.");
        //     return false;
        // }
        // else if (this.betAmount <= 0) {
        //     UIShortAlarm.getDefaultInstance().showShortAlarm(`Please select your bet amount first.`, 2);
        //     //alert("Please enter your bet amount.");
        //     return false;
        // }

        
        if (GameMainContext.getDefault().airdropCredit <= 0) {
            UIShortAlarm.getDefaultInstance().showShortAlarm(`Insufficient Credit`, 2);
            return false;
        }

        return true;
    }

    public show() {
        if (this.isShow)
            return;

        Logger.log(`[BET_CONTROL] show`);

        this.isShow = true;
        this.betAmount = 0;

        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.showUI();
    }

    public hide() {
        if (this.isShow == false)
            return;

        Logger.log(`[BET_CONTROL] hide`);
        this.isShow = false;

        let uiHud = UIHud.getDefaultInstance();
        uiHud.uiBetMenu.hideUI();
    }

}


