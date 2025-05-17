import { _decorator, Component, Label, Node } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('UISelectActorAlarmTab')
export class UISelectActorAlarmTab extends DefaultComponent<UISelectActorAlarmTab> {
    
    @property(Label)
    private statusMessageLabel: Label;

    @property([Node])
    private betActorSprites: Node[] = [];

    @property(Label)
    private betTonCoinLabel: Label;

    protected onLoad(): void {
        super.onLoad();
    }

    private init()
    {
        this.statusMessageLabel.string = "Choose your\nAIRDROP PLAYER";
        this.betActorSprites.forEach(element => {
            element.active = false;
        });

        //this.betTonCoinLabel.node.parent.active = false;
    }

    public showBetActorUI(betActor: number, betAmount: number)
    {
        if(betActor <= 0)
        {
            //Logger.error("UISelectActorAlarmTab.showBetActorUI - error betActor index is zero");
            return;
        }

        this.betActorSprites.forEach(element => {
            element.active = false;
        });

        this.statusMessageLabel.string = "Your Player.";        
        this.betActorSprites[betActor - 1].active = true;

        //this.betTonCoinLabel.node.parent.active = true;
        //this.betTonCoinLabel.string = betAmount.toFixed(1);
    }

    protected onEnable(): void {
        this.init();
        let curBetActor = GameMainContext.getDefault().betActor;
        let curBetAmount = GameMainContext.getDefault().betTonPoint;
        if(curBetActor > 0)
        {
            this.showBetActorUI(curBetActor, curBetAmount);
        }
    }
}


