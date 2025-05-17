import { _decorator, Component, Label, Node } from 'cc';
import { GameStateManager } from '../Main/GameStateManager';
const { ccclass, property } = _decorator;

@ccclass('UIPlayWaitPopup')
export class UIPlayWaitPopup extends Component {

    @property(Label)
    private roundLabel: Label;

    protected onEnable(): void {
        this.roundLabel.string = GameStateManager.getDefaultInstance().getCurrentRound().toString();
    }

}


