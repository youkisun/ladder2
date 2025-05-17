import { _decorator, Button, Component, Label, Node, Tween, Vec3 } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
import { DefaultComponent, GameUtil } from '../Utils/GameUtils';
import { GameAudioManger } from '../Main/GameAudioManger';
import { Logger } from '../Common/GameCommon';
import { GameAddCoinControl } from '../Main/GameAddCoinControl';
const { ccclass, property } = _decorator;

@ccclass('UIHudRoulette')
export class UIHudRoulette extends DefaultComponent<UIHudRoulette> {

    @property(Button)
    private openButton: Button;

    @property(Label)
    private amountLabel: Label;

    @property(Label)
    private addAmountEffectLabel: Label;

    private originParent: Node;
    private currentTween: Tween<Node> | null = null;

    public onClickOpenRouletteButton: () => void;

    protected onLoad(): void {
        super.onLoad();
        GameMainContext.getDefault().onSetRoulettePointEvent = this.onSetRoulettePointEvent.bind(this);
        GameAddCoinControl.getDefault().onSetRouletteAddPointEvent = this.onSetAddRoulettePointEvent.bind(this);
        this.originParent = this.node.parent;
        this.addAmountEffectLabel.node.active = false;
    }

    start() {
        this.openButton.node.on(Button.EventType.CLICK, () => {
            GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickOpenRouletteButton();
        }, this);

    }

    public setActiveAddAmountEffect(acitve: boolean, isScale: boolean = false) {
        this.amountLabel.node.active = !acitve;
        this.addAmountEffectLabel.node.active = acitve;

        if (isScale)
            this.scaleUpAndDown(this.amountLabel.node);
    }

    private onSetRoulettePointEvent(amount: number, isScaleTween: boolean = false) {
        if (typeof amount !== "number") {
            Logger.error("Invalid amount type:", amount);
            return;
        }

        amount = GameUtil.toTwoDecimal(amount);
        this.amountLabel.string = amount.toFixed(1);

        if (amount >= 1) {
            this.startScaleLoopEffect(this.node);
        } else {
            this.stopScaleLoopEffect();
        }
    }

    public onSetAddRoulettePointEvent(value: number, isShowPlus: boolean) {
        if (isShowPlus) {
            this.addAmountEffectLabel.string = `+ ${value.toString()}`;
            this.scaleUpAndDown(this.addAmountEffectLabel.node);
        }
        else {

            this.addAmountEffectLabel.string = `${value.toString()}`;            
        }
    }

    private startScaleLoopEffect(target: Node) {
        if (this.currentTween) {
            return;
        }

        const originalScale = new Vec3(1, 1, 1);
        const enlargedScale = new Vec3(1.1, 1.1, 1.1);

        const loopTween = new Tween(target)
            .to(0.2, { scale: enlargedScale })
            .to(0.2, { scale: originalScale })
            .delay(0.3)
            .union()
            .repeatForever();

        this.currentTween = loopTween;
        loopTween.start();
    }

    private stopScaleLoopEffect() {
        if (this.currentTween) {
            this.currentTween.stop();                // Stop the current Tween
            Tween.stopAllByTarget(this.node);        // Stop all Tweens for the target
            this.node.setScale(1, 1, 1);             // Restore to the original size
            this.currentTween = null;
        }
    }

    scaleUpAndDown(target: Node) {
        const originalScale = new Vec3(1, 1, 1); // Save the original size
        const enlargedScale = new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z * 1.2); // Enlarge by 1.2 times

        // Use Tween to enlarge and then restore to the original size
        Tween.stopAllByTarget(target); // Stop existing Tweens (prevent duplicate execution)
        new Tween(target)
            .to(0.3, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    target.setScale(
                        originalScale.x + (enlargedScale.x - originalScale.x) * ratio,
                        originalScale.y + (enlargedScale.y - originalScale.y) * ratio,
                        originalScale.z + (enlargedScale.z - originalScale.z) * ratio
                    );
                }
            })
            .to(0.3, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    target.setScale(
                        enlargedScale.x - (enlargedScale.x - originalScale.x) * ratio,
                        enlargedScale.y - (enlargedScale.y - originalScale.y) * ratio,
                        enlargedScale.z - (enlargedScale.z - originalScale.z) * ratio
                    );
                }
            })
            .start();
    }

    public setParent(parent: Node) {
        this.node.setParent(parent);
    }

    public revertParent() {
        this.node.setParent(this.originParent);
    }
}


