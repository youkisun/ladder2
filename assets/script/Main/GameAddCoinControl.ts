import { _decorator, Component, Node } from 'cc';
import { Default } from '../Utils/GameUtils';
import { UITopMenu } from '../UI/UITopMenu';
import { UIHudRoulette } from '../UI/UIHudRoulette';
const { ccclass, property } = _decorator;

@ccclass('GameAddCoinControl')
export class GameAddCoinControl extends Default<GameAddCoinControl> {

    public isActiveAddRunEffect: boolean = false;
    public isActiveAddRouletteEffect: boolean = false;

    public onSetRunAddPointEvent: ((amount: number, isShowPlus: boolean) => void) | null = null;
    public onSetRouletteAddPointEvent: ((amount: number, isShowPlus: boolean) => void) | null = null;

    public startAddRun(startPoint: number) {
        if (UITopMenu.getDefaultInstance() && !this.isActiveAddRunEffect)
            UITopMenu.getDefaultInstance().setActiveAddRunCoinMode(true);

        this.isActiveAddRunEffect = true;
        if (this.onSetRunAddPointEvent != null)
            this.onSetRunAddPointEvent(startPoint, false);
    }

    public updateAddRun(addPoint: number) {
        if (UITopMenu.getDefaultInstance() && !this.isActiveAddRunEffect)
            UITopMenu.getDefaultInstance().setActiveAddRunCoinMode(true);

        this.isActiveAddRunEffect = true;
        if (this.onSetRunAddPointEvent != null)
            this.onSetRunAddPointEvent(addPoint, true);
    }

    public hideAddRun() {
        if (UITopMenu.getDefaultInstance())
            UITopMenu.getDefaultInstance().setActiveAddRunCoinMode(false, true);

        this.isActiveAddRunEffect = false;
    }

    public startRoulette(startPoint: number) {
        if(UIHudRoulette.getDefaultInstance() && !this.isActiveAddRouletteEffect)
            UIHudRoulette.getDefaultInstance().setActiveAddAmountEffect(true);

        this.isActiveAddRouletteEffect = true;
        if (this.onSetRouletteAddPointEvent != null)
            this.onSetRouletteAddPointEvent(startPoint, false);
    }

    public updateRoulette(addPoint: number) {
        if(UIHudRoulette.getDefaultInstance() && !this.isActiveAddRouletteEffect)
            UIHudRoulette.getDefaultInstance().setActiveAddAmountEffect(true);

        this.isActiveAddRouletteEffect = true;
        if (this.onSetRouletteAddPointEvent != null)
            this.onSetRouletteAddPointEvent(addPoint, false);
    }

    public hideRoulette() {
        if (UIHudRoulette.getDefaultInstance())
            UIHudRoulette.getDefaultInstance().setActiveAddAmountEffect(false, true);

        this.isActiveAddRouletteEffect = false;
    }

}


