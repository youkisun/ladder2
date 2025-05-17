import { _decorator, Component, Label, Node } from 'cc';
import { UIRecordItem } from './UIRecordItem';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('UIRecordInform')
export class UIRecordInform extends Component {
    
    @property([Node])
    private uiRecordItemNodes: Node [] = [];

    @property(Node)
    private tenGamesRecord: Node;

    @property(Label)
    private continueWinCountLabel: Label;
    
    
    private uiRecordItems: UIRecordItem[] = [];

    onLoad() {
        this.uiRecordItems = this.uiRecordItemNodes
            .map(node => node.getComponent(UIRecordItem)) 
            .filter(component => component !== null) as UIRecordItem[];

            this.tenGamesRecord.active = false;
            this.continueWinCountLabel.node.active = false;
    }

    protected start(): void {
        
    }

    public setRecordItems()
    {
        this.tenGamesRecord.active = true;
        const tenPasGameResults = GameMainContext.getDefault().getTenPastGameResults();

        for (let i = 0; i < tenPasGameResults.length; i++) {
            this.uiRecordItems[i].Set(tenPasGameResults[i].winner, tenPasGameResults[i].winStatus, tenPasGameResults[i].res_streak);
        }
        
    }

    public setContinueWinCountLabel(count: string)
    {
        return;
        this.continueWinCountLabel.node.active = true;
        this.continueWinCountLabel.string = count;
    }
}