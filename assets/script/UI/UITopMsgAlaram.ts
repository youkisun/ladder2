import { _decorator, AnimationComponent, Button, Component, Label, Node } from 'cc';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('UITopMsgAlaram')
export class UITopMsgAlaram extends Component {
    @property(Button)
    private closeButton: Button;

    @property(Label)
    private descLabel: Label = null;

    private hideRemainTime: number;

    protected onLoad(): void {

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            GameUIManager.getDefaultInstance().hide(UIType.TOP_MSG_ALARAM);
        }, this);


    }

    public setDescLabel(descText: string, hideTime = 0.0) {
        this.descLabel.string = descText;
        this.hideRemainTime = hideTime;
    }
    update(deltaTime: number) {
        if (this.hideRemainTime > 0) {
            this.hideRemainTime -= deltaTime;
            if (this.hideRemainTime <= 0) {
                GameUIManager.getDefaultInstance().hide(UIType.TOP_MSG_ALARAM);
            }
        }
    }
}


