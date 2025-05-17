import { _decorator, Component, Node } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
import { UIHistory } from '../UI/UIHistory';
const { ccclass, property } = _decorator;

@ccclass('GameHistory')
export class GameHistory extends Component {
    onEnable() {
        // Retrieve and display the results of the last 20 games.
        let initPacket = GameMainContext.getDefault().initPacket;    

        let uiHistory = this.node.getComponent(UIHistory);
        //initPacket.pastGameResults

        let index = 0;
        for (const result of initPacket.pastGameResults) {            
            //Logger.log(`Game No: ${result.game_no}, Bridge No: ${result.bridge_num}, Side: ${result.side}, Winner: ${result.winner}, Win Status: ${result.winStatus}`);
            uiHistory.setItem(index++, result.game_no, result.bridge_num, result.side, result.winner, result.winStatus);
        }
    }

    
}




