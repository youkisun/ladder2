
export enum ActorType {
    PEPE = 0,
    DOGE = 1,
}

export class ActorTypeInt {
    static PEPE: number = 0;
    static DOGE: number = 1;
}

export class ActorPosTypeInt {
    static LEFT: number = 0;
    static RIGHT: number = 1;
}

import { _decorator, Component, Node, Enum, AnimationComponent } from 'cc';
import { ActorTransform } from "./ActorTransform";
import { ActorContext } from "./ActorContext";
const { ccclass, property } = _decorator;

@ccclass('Actor')
export class Actor extends Component {
    @property(AnimationComponent)
    private actorAnimation: AnimationComponent;

    @property({ type: Enum(ActorType) })    
    private actorType: ActorType = ActorType.PEPE;

    @property(Node)
    private selectedActorImage: Node;

    private animParamName: string;
    private animNames: string[] = ["idle", "walk", "win", "lose"];

    public actorTransform!: ActorTransform;
    public actorContext: ActorContext = new ActorContext();

    start() {
        this.initialize();
    }

    private initialize(): void {
        this.actorContext.actorType = this.actorType;
        this.actorTransform = new ActorTransform(this.node); // this.node is the default object connected to Cocos' Transform

        this.animParamName = this.actorType == ActorType.PEPE ? "pepe_" : "doge_";
    }

    public SetSelectedActorImage(value: boolean)
    {
        this.selectedActorImage.active = value;
    }

    // 0 : idle, 1 : walk, 2 : win, 3 : lose
    public playAnimation(state: number)
    {        
        this.actorAnimation.stop();
        this.actorAnimation.play(this.animParamName + this.animNames[state]);
    }

    onDestroy(): void {
    }
}
