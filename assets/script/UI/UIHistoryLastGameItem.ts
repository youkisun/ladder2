import { _decorator, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIHistoryLastGameItem')
export class UIHistoryLastGameItem extends Component {

    @property(Label)
    private gameNoLabel: Label;

    @property(Label)
    private leftDescLabel: Label;

    @property(Label)
    private pepeWinLabel: Label;

    @property(Label)
    private dogeWinLabel: Label;

    @property(Sprite)
    private pepeSprite: Sprite;

    @property(Sprite)
    private dogeSprite: Sprite;


    start() {

    }

    public setItem(game_no: number, 
        bridge_num: number, 
        side: number,
        winner: number, 
        winStatus: number)
    {
        let sideStr = "LEFT";
        if(side == 2)
            sideStr = "RIGHT";

        const game_no_str = game_no.toString();
        const no_str = game_no_str.slice(-4);
        const no_number = parseInt(no_str, 10);
        const year_data_str = game_no_str.slice(0, -4);
        const day = game_no_str.slice(4, 6); // "19"
        const year = year_data_str.slice(0, 2); // "25"
        const month = year_data_str.slice(2, 4); // "02"
        

        this.gameNoLabel.string = `Round. ${no_number} (${`${day}/${month}/${year}`})`;
        this.leftDescLabel.string = `${bridge_num} LINE,  ${sideStr}`;

        this.pepeSprite.node.active = winner == 1;
        this.dogeSprite.node.active = winner == 2;

        this.pepeWinLabel.node.active = winner == 1;
        this.dogeWinLabel.node.active = winner == 2;
    }

    // update(deltaTime: number) {
        
    // }
}


