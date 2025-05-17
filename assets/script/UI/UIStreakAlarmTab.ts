import { _decorator, Component, Label, Node, Tween, Vec3 } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('UIStreakAlarmTab')
export class UIStreakAlarmTab extends Component {
    
    @property(Label)
    private winCountLabel: Label = null;

    private targetCount: number = 0;
    private currentCount: number = 0;
    private increaseInterval: number = 0.1;
    private isUpdating: boolean = false;

    public play()
    {        
        this.stopWinCountIncrease();
        this.targetCount = GameMainContext.getDefault().initPacket.con_win_cnt + 1;
        this.currentCount = 0; 
        this.winCountLabel.string = "0";

        this.schedule(this.updateWinCount, this.increaseInterval);
        this.isUpdating = true;
    }

    
    onDisable() {
        this.stopWinCountIncrease();
    }

    private updateWinCount() {
        if (this.currentCount < this.targetCount) {
            this.currentCount += 1; 
            this.winCountLabel.string = this.currentCount.toString();
        } else {
            this.scaleUpAndDown(this.winCountLabel.node);
            this.stopWinCountIncrease();
        }
    }

    private stopWinCountIncrease() {
        if (this.isUpdating) {
            this.unschedule(this.updateWinCount);
            this.isUpdating = false;
        }
    }

    private scaleUpAndDown(target: Node) {
        const originalScale = new Vec3(1, 1, 1);
        const enlargedScale = new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z * 1.2); 

        Tween.stopAllByTarget(target); 
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
        .start();


            
    }
}
