import { _decorator, Component, Node } from 'cc';
import { UIMyBetInfoItem } from './UIMyBetInfoItem';
import { GameInitPacket } from '../Network/GamePacket';
const { ccclass, property } = _decorator;

@ccclass('UIMyBetTab')
export class UIMyBetTab extends Component {
    @property({ type: [UIMyBetInfoItem] })
    private myBetInfoItems: UIMyBetInfoItem[] = [];
    
    onLoad() {
        this.myBetInfoItems.forEach(element=>
            {
                element.node.active = false;
            });
    }

    public set(index: number, 
        game_no: number,
        bridge_num: number,
        side: number,
        winner: number,
        winStatus: number,
        betAmount: number,
        winRpoints: number,
        getRoulettePoint: number) 
    {
        this.myBetInfoItems[index].node.active = true;
        this.myBetInfoItems[index].setItem(game_no, bridge_num, side, winner, winStatus, betAmount, winRpoints, getRoulettePoint);
    }
}


