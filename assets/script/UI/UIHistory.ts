import { _decorator, Button, Component, Node } from 'cc';
import { UIHistoryLastGameItem } from './UIHistoryLastGameItem';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { UIHud } from './UIHud';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('UIHistory')
export class UIHistory extends Component {

    @property([UIHistoryLastGameItem])
    private uiHistoryLastGameItems: UIHistoryLastGameItem[] = [];

    @property(Button)
    private closeButton: Button;

    protected onLoad(): void {
        this.closeButton.node.on(Button.EventType.CLICK, ()=>
            { 
                GameAudioManger.getDefaultInstance().playSound("button");
                GameUIManager.getDefaultInstance().hide(UIType.HISTORY);
            }, this);
            
           
    }

    public setItem(index: number, 
        game_no: number,         
        bridge_num: number, 
        side: number,
        winner: number, 
        winStatus: number)
    {
        this.uiHistoryLastGameItems[index].setItem(game_no, bridge_num, side, winner, winStatus);
    }

    protected onEnable(): void {
        let uiHud = UIHud.getDefaultInstance();
        UIHud.getDefaultInstance().setMenuColor(true);
    }

    protected onDisable(): void {
        if(UIHud.getDefaultInstance() != null)
        {
            UIHud.getDefaultInstance().uiBottomMenu.clearHistoryToggle();
            UIHud.getDefaultInstance().setMenuColor(false);
        }
         
    }
}
