import { _decorator, AnimationComponent, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIWinEffects')
export class UIWinEffects extends Component {

    @property([AnimationComponent])
    private winEffectAnims: AnimationComponent[] = [];

    @property
    private effectPlayTerm: number = 0.3;

    private winEffectTick = 0.0;
    private winEffectIndex: number = 0;

    onEnable() 
    {
        this.winEffectTick = 0.0;
        this.winEffectIndex = 0;
        this.winEffectAnims.forEach(element => {
            element.node.active = false;
        });

        this.playEffect();
    }
    
    onDisable() 
    {
    
    }

    playEffect()
    {
        this.winEffectAnims[this.winEffectIndex].node.active = true;
        this.winEffectAnims[this.winEffectIndex].play();
        this.winEffectIndex++;
    }
    
    update(dt: number): void 
    {
        if(this.winEffectIndex >= this.winEffectAnims.length)
            return;

        this.winEffectTick += dt;
        if(this.winEffectTick > this.effectPlayTerm)
        {
            this.winEffectTick = 0.0;
            this.playEffect();
        }
    }
}


