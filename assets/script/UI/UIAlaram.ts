import { _decorator, AnimationComponent, Component, Label, Node } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

export enum AlaramType {
    BETTING = 0,
    WAIT_SECOND,
    GAME_START,
    WIN,
    LOSE,
    STRAIGHT_WINS,
    NONE,
}

@ccclass('UIAlarm')
export class UIAlarm extends Component {

    @property(AnimationComponent)
    private betAmountAnimation: AnimationComponent;

    

    @property(Node)
    private betAmount: Node;

    @property(Label)
    private betAmountLabel: Label;

    @property(Node)
    private statusMessage: Node;

    @property(Label)
    private selectActorAlarmRemainTime: Label;

    @property(Label)
    private waitAlarmRemainTime: Label;

    @property([Node])
    private statusShowNodes: Node[] = [];

    @property([AnimationComponent])
    private statusShowAnim: AnimationComponent[] = [];

    private statusShow: AlaramType = AlaramType.NONE;

    onLoad() {
        this.showBetMessage(false);
        this.showStatusMessage(false);
    }

    protected start(): void {
        GameMainContext.getDefault().onSetBetTonEvent = this.showBetMessage.bind(this);
    }

    public showBetMessage(active: boolean, betAmount: number = 0, betActor: number = 0) {
        return;

        if(betAmount == 0)
            active = false;    

        this.betAmount.active = active;
        if(active) {
            this.betAmountAnimation.stop();
            this.betAmountAnimation.play("showBetAlaram");
            this.betAmountLabel.string = "bet : " + betAmount.toLocaleString();
        }
    }

    public showStatusMessage(active: boolean, type: AlaramType = AlaramType.NONE) {
        this.statusMessage.active = active;        

        if(active) {
            for (let i = 0; i < this.statusShowNodes.length; i++) {
                this.statusShowNodes[i].active = false;
            }

            this.statusShowNodes[type].active = active;

            // Prevent duplication.
            if(this.statusShow != type && this.statusShowAnim[type] != null)
            {         
                this.statusShowAnim[type].play();
            }
        }

        this.statusShow = type;
    }

    public setSelectActorAlarmRemainTime(remainTime: number)
    {
        if(remainTime >= 0)
            this.selectActorAlarmRemainTime.string = `Seconds left : ${remainTime.toFixed(0)}`;
    }

    public setWaitAlarmRemainTime(remainTime: number)
    {
        if(remainTime >= 0)
            this.waitAlarmRemainTime.string = `Ready ${remainTime.toFixed(0)}`;
    }
}


