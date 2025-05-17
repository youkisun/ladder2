import { _decorator, Component, Node } from 'cc';
import { UIWinEffects } from './UIWinEffects';
import { GameStateManager } from '../Main/GameStateManager';
import { UIStreakAlarmTab } from './UIStreakAlarmTab';
import { UIWinGetPointsTab } from './UIWinGetPointsTab';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('UIWinAlarmTab')
export class UIWinAlarmTab extends Component {

    @property(UIWinEffects)
    private uiWinEffects: UIWinEffects;

    @property(UIStreakAlarmTab)
    private uiStreakAlarmTab: UIStreakAlarmTab;

    @property(UIWinGetPointsTab)
    private uiWinGetPointsTab: UIWinGetPointsTab;

    private timeoutId: number;

    onLoad() {

    }

    onEnable() {
        let remainTime = GameStateManager.getDefaultInstance().getCurrentRemainTime();
        //let remainTime = 10;

        this.timeoutId = -1;

        // At least 8 seconds of remaining time is required to display the effects
        if (remainTime > 8) {

            // Display streak effects starting from 3 consecutive wins
            let streak = GameMainContext.getDefault().initPacket.con_win_cnt + 1;
            if (streak >= 3) {
                this.uiStreakAlarmTab.node.active = true;
                this.uiStreakAlarmTab.play();

                this.uiWinGetPointsTab.node.active = false;

                this.timeoutId = setTimeout(() => {
                    this.uiStreakAlarmTab.node.active = false;
                    this.uiWinGetPointsTab.node.active = true;
                    this.uiWinGetPointsTab.play(false);
                }, (remainTime - 8) * 1000);
            }
            else {
                this.uiStreakAlarmTab.node.active = false;
                this.uiWinGetPointsTab.node.active = true;
                this.uiWinGetPointsTab.play(false);
            }
        }
        else {
            this.uiStreakAlarmTab.node.active = false;
            this.uiWinGetPointsTab.node.active = true;
            this.uiWinGetPointsTab.play(true);
        }
    }


    onDisable() {
        if (this.timeoutId != -1)
            clearTimeout(this.timeoutId);
    }

    update(deltaTime: number) {

    }
}


