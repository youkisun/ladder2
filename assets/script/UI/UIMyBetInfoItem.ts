import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { GameUtil } from '../Utils/GameUtils';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('UIMyBetInfoItem')
export class UIMyBetInfoItem extends Component {

    @property(Label)
    private gameDateLabel: Label;

    @property(Label)
    private userUIDLabel: Label;

    @property(Label)
    private gameRoundLabel: Label;

    @property({ type: [Sprite] })
    private myBetSprites: Sprite[] = [];

    @property(Label)
    private betAmountLabel: Label;

    @property(Label)
    private getAmountRpointLabel: Label;

    @property(Label)
    private getAmountRoulettePointLabel: Label;

    @property({ type: [Node] })
    private resultBetSprites: Node[] = [];

    @property(Node)
    private resultWinTitle: Node;

    @property(Node)
    private resultLoseTitle: Node;

    start() {

    }

    public setItem(game_no: number,
        bridge_num: number,
        side: number,
        winner: number,
        winStatus: number,
        betAmount: number,
        winRpoints: number,
        getRoulettePoint: number) {

        const game_no_str = game_no.toString();
        const no_str = game_no_str.slice(-4);
        const no_number = parseInt(no_str, 10);
        const year_data_str = game_no_str.slice(0, -4);
        const day = game_no_str.slice(4, 6); // "19"
        const year = year_data_str.slice(0, 2); // "25"
        const month = year_data_str.slice(2, 4); // "02"

        this.gameDateLabel.string = `${`${day}/${month}/${year}`}`;
        this.gameRoundLabel.string = `Round. ${no_number} ` + `\n(${`${day}/${month}/${year}`})`;

        let uid = GameMainContext.getDefault().userid;
        this.userUIDLabel.string = `UID : ${uid}`;
        
        this.getAmountRpointLabel.string = Math.floor(Number(winRpoints)).toString();
        this.getAmountRoulettePointLabel.string = Number(getRoulettePoint).toFixed(1);
        //this.betAmountLabel.string = Number(betAmount).toFixed(1);

        let myBetActor = winStatus == 2 ? winner : GameUtil.getToggleActor(winner);



        if (myBetActor == 1) {
            this.myBetSprites[0].node.active = true;
            this.myBetSprites[0].grayscale = winStatus != 2;
            this.myBetSprites[1].node.active = false;
        }
        else {
            this.myBetSprites[0].node.active = false;
            this.myBetSprites[1].node.active = true;
            this.myBetSprites[1].grayscale = winStatus != 2;
        }

        this.resultBetSprites[0].active = winner == 1;
        this.resultBetSprites[1].active = winner == 2;

        this.resultWinTitle.active = winStatus == 2;
        this.resultLoseTitle.active = winStatus != 2;
    }
}


