import { _decorator, Button, Component, Label, Node, RichText, Tween, Vec3 } from 'cc';
import { GameAudioManger } from '../Main/GameAudioManger';
import { CoinType, GameCoinMovingControl } from '../Common/GameCoinMovingControl';
import { GameMainContext } from '../Main/GameMainContext';
import { GameBonusRoulette } from '../BonusRoulette/GameBonusRoulette';
import { GameAddCoinControl } from '../Main/GameAddCoinControl';
const { ccclass, property } = _decorator;

@ccclass('UIRouletteResult')
export class UIRouletteResult extends Component {
    @property(Label)
    private getRunPointLabel: Label = null;

    @property(RichText)
    private totalRunPointRichText: RichText = null;

    @property(Button)
    private backSpriteButton: Button;

    @property(Button)
    private closeButton: Button;

    @property(Node)
    private runCoinSpriteNode: Node;

    private currentPoint: number = 0;
    private targetPoint: number = 0;
    private increaseInterval: number = 0.01; // Increase every 0.01 seconds
    private increaseAmount: number = 5; // Amount to increase at once
    private isUpdating: boolean = false;
    private timeoutIds: number[] = [];
    private isActive: boolean;

    public addedRunPoint: number;

    start() {
        this.closeButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.hide();
        }, this);

        this.backSpriteButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.hide();
        }, this);
    }

    update(deltaTime: number) { }

    public show(resultAmount: number, totalAmount: number) {
        this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeoutIds = [];
        this.isActive = true;
        this.addedRunPoint = 0;

        let loopCount = resultAmount / 10;
        for (let i = 0; i < loopCount; i++) {
            const timeoutId = setTimeout(() => {
                GameCoinMovingControl.getDefaultInstance().pushItem(CoinType.RUN,
                    this.runCoinSpriteNode.getWorldPosition(),
                    () => {
                        if (this.isActive) {
                            this.addedRunPoint += 10;
                            GameAddCoinControl.getDefault().updateAddRun(this.addedRunPoint);
                            if (this.addedRunPoint >= resultAmount) {
                                if (GameAddCoinControl.getDefault().isActiveAddRunEffect)
                                    GameAddCoinControl.getDefault().hideAddRun();
                            }
                        }
                    });
            }, i * 100);
            this.timeoutIds.push(timeoutId);
        }

        this.closeButton.node.active = false;
        this.backSpriteButton.node.active = false;
        this.node.active = true;
        this.scaleUpAndDown(this.node);
        this.animatePointIncrease(resultAmount);
        let totalAmountStr = totalAmount.toLocaleString();
        this.totalRunPointRichText.string = `Total <color=#ff0000>${totalAmountStr}</color>\n$RUN points`;
    }

    public hide() {
        this.node.active = false;
        this.stopPointIncrease(); // Stop the increase animation
    }

    private animatePointIncrease(targetValue: number) {
        this.targetPoint = targetValue;
        this.currentPoint = 0; // Starting value

        this.schedule(this.updatePointLabel, this.increaseInterval);
        this.isUpdating = true;
    }

    private updatePointLabel() {
        if (this.currentPoint < this.targetPoint) {
            this.currentPoint += this.increaseAmount;
            if (this.currentPoint > this.targetPoint) {
                this.currentPoint = this.targetPoint;
            }
            this.getRunPointLabel.string = `x ${this.currentPoint.toLocaleString()}`;
        } else {
            this.stopPointIncrease();
        }
    }

    private stopPointIncrease() {
        if (this.isUpdating) {
            this.unschedule(this.updatePointLabel);
            this.isUpdating = false;
        }
    }

    private scaleUpAndDown(target: Node) {
        const originalScale = new Vec3(1, 1, 1); // Original size
        const enlargedScale = new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z * 1.2); // Enlarge by 1.2 times

        Tween.stopAllByTarget(target); // Stop existing Tweens (prevent duplicate execution)
        new Tween(target)
            .to(0.1, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    target.setScale(
                        originalScale.x + (enlargedScale.x - originalScale.x) * ratio,
                        originalScale.y + (enlargedScale.y - originalScale.y) * ratio,
                        originalScale.z + (enlargedScale.z - originalScale.z) * ratio
                    );
                }
            })
            .to(0.1, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    target.setScale(
                        enlargedScale.x - (enlargedScale.x - originalScale.x) * ratio,
                        enlargedScale.y - (enlargedScale.y - originalScale.y) * ratio,
                        enlargedScale.z - (enlargedScale.z - originalScale.z) * ratio
                    );
                }
            })
            .call(() => {
                this.closeButton.node.active = true;
                this.backSpriteButton.node.active = true;
            })
            .start();
    }

    protected onDisable(): void {
        if (GameAddCoinControl.getDefault().isActiveAddRunEffect)
            GameAddCoinControl.getDefault().hideAddRun();

        this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeoutIds = [];

        this.isActive = false;
    }
}
