import { _decorator, AnimationComponent, Component, Label, Node } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('UIShortAlarm')
export class UIShortAlarm extends DefaultComponent<UIShortAlarm> {
    @property(AnimationComponent)
    private shortAlarmAnimation: AnimationComponent;
    
    @property(Label)
    private shortAlarmLabel: Label;
        
    private shortAlarmTick: number = 0;

    onLoad() {
        super.onLoad();
    }

    protected start(): void {
        this.node.active = false;
    }

    public showShortAlarm(text: string, hideTime: number = 3)
    {
        this.node.active = true;
        this.shortAlarmTick = hideTime;
        this.shortAlarmAnimation.node.active = true;
        this.shortAlarmAnimation.play();
        this.shortAlarmLabel.string = text;

        this.node.setSiblingIndex(this.node.parent.children.length - 1);
    }

    update(deltaTime: number) {
        if(this.shortAlarmTick != 0)
        {
            this.shortAlarmTick -= deltaTime;
            if(this.shortAlarmTick <= 0)
            {
                this.node.active = false;
                this.shortAlarmTick = 0.0;
            }
        }
    }
}


