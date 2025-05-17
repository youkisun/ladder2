import { _decorator, AnimationComponent, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMissionAlarm')
export class UIMissionAlarm extends Component {
    @property(AnimationComponent)
        private shortAlarmAnimation: AnimationComponent;
        
        @property(Node)
        public iconSpriteNode: Node;

        @property(Label)
        private shortAlarmLabel: Label;
            
        private shortAlarmTick: number = 0;
    
        protected start(): void {
        }
    
        public showShortAlarm(text: string, hideTime: number = 4)
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


