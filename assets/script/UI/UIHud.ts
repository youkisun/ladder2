import { _decorator, Component, Label, Button, Color, Sprite, Node, EditBox } from 'cc';
import { DefaultComponent } from "../Utils/GameUtils";
import { GameTimerEvent } from "../Utils/GameTimerEvent";
import { GameMainContext } from '../Main/GameMainContext';
import { GameStateManager } from '../Main/GameStateManager';
import { UIBetMenu } from './UIBetMenu';
import { UITopMenu } from './UITopMenu';
import { UIRecordInform } from './UIRecordInform';
import { UIAlarm } from './UIAlaram';
import { UIUserBetState } from './UIUserBetState';
import { UIBottomMenu } from './UIBottomMenu';
import { UIHudRoulette } from './UIHudRoulette';
const { ccclass, property } = _decorator;

@ccclass('UIHud')
export class UIHud extends DefaultComponent<UIHud> {    

    @property({ type: [Label] })
    private errorMessageLabel: Label;    

    @property(Node)
    private uiPlayWaitPopup: Node;

    @property(UIBetMenu)
    public uiBetMenu: UIBetMenu;

    @property(UIRecordInform)
    public uiRecordInform: UIRecordInform;

    @property(UIAlarm)
    public uiAlaram: UIAlarm;

    @property(Node)
    public debugLog: Node;
    
    @property(Button)
    public debugButton: Button;

    @property(Node)
    public loadingScreen: Node;

    @property(UIUserBetState)
    public uiUserBetState: UIUserBetState;

    @property(UIBottomMenu)
    public uiBottomMenu: UIBottomMenu;

    @property(UIHudRoulette)
    public uiHudRoulette: UIHudRoulette;

    @property(Node)
    private menuColor: Node;

    @property(Label)
    public debugUTCLabel: Label;

    

    private menuColorCnt = 0;

    public setMenuColor(value: boolean) {
        this.menuColorCnt = value ? this.menuColorCnt+1 : this.menuColorCnt-1;
        this.menuColor.active = this.menuColorCnt > 0;
    }

    protected onLoad() {
        super.onLoad();
        this.setShowWaitPopup(false);
        this.showLoading(false);
        this.debugLog.active = false;
        
        this.debugButton.node.on(Button.EventType.CLICK, ()=>
            {
                this.debugLog.active = !this.debugLog.active;
            }, this);
    }

    public isShowWaitPopup(): boolean
    {
        return this.uiPlayWaitPopup.active;
    }

    public setShowWaitPopup(isShow: boolean) {
        this.uiPlayWaitPopup.active = isShow;
    }
    
    // public setStatusLabel(value: string){
        
    //     this.statusLabel.string = value + "(GameNo." + GameStateManager.getDefaultInstance()._curGameNo.toString() + ")";
    // }
    
    public setErrorMessageLabel(value: string){
        this.errorMessageLabel.string = value;
    }

    public showLoading(value: boolean) {
        this.loadingScreen.active = value;
    }


    // public setBetActorLabel(value: number){
    //     if(value == 1)
    //         this.betActorLabel.string = "Bet : Pepe"";
    //     else if(value == 2)
    //         this.betActorLabel.string = "Bet" : Doge";
    // }

    // public setBetAmountLabel(value: number){
    //     this.betAmountLabel.string = "Bet Amount : " + value.toString();        
    // }

    // public playRemainTime(value: number){
    //     this.remainTimeLabel.enabled = true;
    //     this.remainTimeTick = value;
        
    // }

    // public stopRemainTime()
    // {
    //     this.remainTimeLabel.enabled = false;
    // }

    private onUpdateRemainTime(cur: number, target: number) {
        
    }

    // update(deltaTime: number) {
    //     if(this.remainTimeTick > 0)
    //     {
    //         this.remainTimeTick -= deltaTime;
    //         const remainingTime = Math.floor(this.remainTimeTick + 1);
    //         const value = `${remainingTime} Seconds`;
    //         this.remainTimeLabel.string = value;
    //     }
    // }
}