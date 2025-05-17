import { _decorator, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIRecordItem')
export class UIRecordItem extends Component {

    @property(Sprite)
    private pepeWin: Sprite;
    @property(Sprite)
    private dogeWin: Sprite;
    @property(Sprite)
    private winSprite: Sprite;
    @property(Sprite)
    private loseSprite: Sprite;
    @property(Label)
    private streakLabel: Label;

    start() {

    }

    // winActor - 1:dogeWin, 2:pepeWin
    // winStatus - 0:No Bet, 1:Loss, 2:Win
    public Set(winActorValue: number, winStatusValue: number, streak: number) {

        // Display the winning character.
        let winActorNode = null;
        if (winActorValue == 2) {
            this.dogeWin.node.active = true;
            this.pepeWin.node.active = false;
            winActorNode = this.dogeWin;
        }
        else {
            this.dogeWin.node.active = false;
            this.pepeWin.node.active = true;
            winActorNode = this.pepeWin;
        }

        // win
        this.winSprite.node.active = winStatusValue == 2;
        // lose
        this.loseSprite.node.active = winStatusValue == 1;

        // streak
        this.streakLabel.node.active = streak > 0;
        this.streakLabel.string = streak.toString();
    }
}


