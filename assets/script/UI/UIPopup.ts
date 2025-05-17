import { _decorator, Button, Component, Label, Node } from 'cc';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('UIPopup')
export class UIPopup extends Component {
    @property(Button)
    public closeButton: Button;

    @property(Button)
    public confirmButton: Button;

    @property(Label)
    public titleLabel: Label;

    @property(Label)
    public descLabel: Label;

    @property(Label)
    public desc2RedLabel: Label;

    public onClickConfirmButtonEvent: () => void = null;

    start() {
        this.closeButton.node.on(Button.EventType.CLICK, () => {
            GameAudioManger.getDefaultInstance().playSound("button");
            GameUIManager.getDefaultInstance().hide(UIType.POPUP);
        }, this);

        this.confirmButton.node.on(Button.EventType.CLICK, ()=>{ this.onClickConfirmButtonEvent(); }, this);
    }

    public set(descLabel: string, titleLabel: string, isActiveCloseBtn: boolean, isActiveConfirmBtn: boolean = false) {
        this.onClickConfirmButtonEvent = null;
        this.titleLabel.string = titleLabel;
        this.descLabel.string = descLabel;        
        this.closeButton.node.active = isActiveCloseBtn;
        this.confirmButton.node.active = isActiveConfirmBtn;            

        this.desc2RedLabel.node.active = false;
    }
}


