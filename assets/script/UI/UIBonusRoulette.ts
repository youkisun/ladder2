import { _decorator, Button, Component, Label, Node } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameBonusRoulette } from '../BonusRoulette/GameBonusRoulette';
import { UIRouletteResult } from './UIRouletteResult';
import { GameAudioManger } from '../Main/GameAudioManger';
import { UITopMenu } from './UITopMenu';
const { ccclass, property } = _decorator;

@ccclass('UIBonusRoulette')
export class UIBonusRoulette extends DefaultComponent<UIBonusRoulette> {

    @property([Label])
    private amountLabels: Label[] = [];

    @property(Label)
    private bonusCountLabel: Label;

    @property(Button)
    private spinButton: Button;

    @property(Button)
    private closeButton: Button;

    @property(UIRouletteResult)
    public uiRouletteResult: UIRouletteResult;

    public isShow: boolean;

    public onClickSpinBtn: () => boolean;

    protected onLoad() {
        super.onLoad();

        for (let i = 0; i < this.amountLabels.length; i++) {
            this.amountLabels[i].string = "";
        }

        this.node.active = false;

        this.spinButton.node.on(Button.EventType.CLICK, ()=>
        {

            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            if( this.onClickSpinBtn() )
            {
                this.setActiveAllInteraction(false);
            }
        }, this);

        this.closeButton.node.on(Button.EventType.CLICK, ()=>
        {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.hide();
        }, this);

        this.uiRouletteResult.hide();
    }

    public setGetAmountLabel(getAmount: number, totalAmount: number) {
        if(getAmount <= 0)
            this.uiRouletteResult.hide();
        else
        {
            this.uiRouletteResult.show(getAmount, totalAmount);
            //this.getAmountLabel.string = `Prize : ${getAmount} $RUN points\nTotal $RUN points : ${totalAmount.toFixed(1)}`; 
        }
    }

    public setHasAmountLabel(amount: number) {
        this.bonusCountLabel.string = `Roulette Points : ${amount.toFixed(1)}`; 
    }

    public setAmountLabel(index: number, amountValue: string) {
        this.amountLabels[index].string = amountValue.toLocaleString();
    }

    public setActiveAllInteraction(value: boolean) {
        this.spinButton.interactable = value;
        this.closeButton.interactable = value;
    }

    protected onEnable(): void {
        UITopMenu.getDefaultInstance().setActive(false);
        this.isShow = true;
    }

    protected onDisable(): void {
        UITopMenu.getDefaultInstance().setActive(true);
        this.isShow = false;

        this.uiRouletteResult.hide();
    }

    public show()
    {
        this.node.active = true;

        
    }

    public hide()
    {
        
        this.node.active = false;
    }
}