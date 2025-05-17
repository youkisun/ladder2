import { _decorator, Button, Component, Label, Node, tween, Vec3 } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { GameMainContext } from '../Main/GameMainContext';
import { GameBonusPacket } from '../Network/GamePacket';
import { UIHudRoulette } from './UIHudRoulette';
import { UITopMenu } from './UITopMenu';
import { UIHud } from './UIHud';
import { CoinType, GameCoinMovingControl } from '../Common/GameCoinMovingControl';
import { GameCommon } from '../Common/GameCommon';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('UIAttendanceBonus')
export class UIAttendanceBonus extends DefaultComponent<UIAttendanceBonus> {

    @property(Label)
    private getTonCoinLabel: Label = null;

    @property(Label)
    private getRoulettePointLabel: Label = null;

    @property(Button)
    private closeButton: Button = null;

    @property(Button)
    private backSpriteButton: Button = null;

    @property(Node)
    private tonIcon: Node = null;

    @property(Node)
    private rouletteIcon: Node = null;

    private isOnLoaded: boolean = false;

    protected onLoad(): void {
        super.onLoad();
        this.isOnLoaded = true;
        this.getTonCoinLabel.string = "";
        this.getRoulettePointLabel.string = "";

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            this.onCloseBtn();
        }, this);

        this.backSpriteButton.node.on(Button.EventType.CLICK, () => {
            this.onCloseBtn();
        }, this);
    }

    private onCloseBtn() {
        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().playSound("button");
        GameUIManager.getDefaultInstance().hide(UIType.ATTENDANCE_BONUS);
    }

    private setActiveCloseBtn(active: boolean) {
        this.closeButton.interactable = active;
        this.backSpriteButton.interactable = active;
    }

    public async show(att_bonus_t_points: number,
        att_bonus_roulette_points: number,
        ret_roulette_points: number,
        ret_t_points: number) {

        this.closeButton.node.active = true;
        this.setActiveCloseBtn(false);

        // let toneStartPos = this.tonIcon.getWorldPosition();
         let rouletteStartPos = this.rouletteIcon.getWorldPosition();

        // let loopCount = GameCommon.getTonCoinEffectCount(att_bonus_t_points);
        // for (let i = 0; i < loopCount; i++) {
        //     const timeoutId = setTimeout(() => {
        //         GameCoinMovingControl.getDefaultInstance().pushItem(CoinType.TON,
        //             toneStartPos,
        //             () => { });
        //     }, i * 100);
        // }
        // await this.animateLabel(this.getTonCoinLabel, att_bonus_t_points);

        let loopCount = 10;
        for (let i = 0; i < loopCount; i++) {
            const timeoutId = setTimeout(() => {
                GameCoinMovingControl.getDefaultInstance().pushItem(CoinType.ROULETTE,
                    rouletteStartPos,
                    () => { });
            }, i * 100);
        }

        await this.animateLabel(this.getRoulettePointLabel, att_bonus_roulette_points);

        this.setActiveCloseBtn(true);
        GameMainContext.getDefault().setRoulettePoint(ret_roulette_points, true);
        GameMainContext.getDefault().setTonPoint(ret_t_points, true);
    }

    protected onDisable(): void {
    }

    private animateLabel(label: Label, targetValue: number): Promise<void> {
        return new Promise((resolve) => {
            if (!label) return resolve();

            let currentValue = 0;
            label.string = currentValue.toString();

            tween(label.node)
                .to(0.2, { scale: new Vec3(1.3, 1.3, 1) })
                .start();

            // Adjust the increase speed
            const step = Math.max(1, Math.ceil(targetValue / 50));

            const updateValue = () => {
                if (currentValue < targetValue) {
                    currentValue += step;

                    // Adjust the final step (prevent overshooting)
                    if (currentValue > targetValue) {
                        currentValue = targetValue; // Force the final value
                    }

                    label.string = `x ${currentValue}`;
                    requestAnimationFrame(updateValue);
                } else {
                    // Restore the size to the original and call resolve
                    tween(label.node)
                        .to(0.2, { scale: new Vec3(1, 1, 1) })
                        .call(() => resolve()) // Call resolve after the animation ends
                        .start();
                }
            };
            updateValue();
        });
    }

}
