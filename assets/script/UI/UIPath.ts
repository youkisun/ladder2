import { _decorator, AnimationComponent, Color, Node, Sprite, Vec3 } from "cc";
import { DefaultComponent } from "../Utils/GameUtils";
const { ccclass, property } = _decorator;

@ccclass("UIPath")
export class UIPath extends DefaultComponent<UIPath> {

    @property({ type: [Node] })
    public startPointNodes: Node[] = [];
    @property({ type: [Node] })
    public middle0PointNodes: Node[] = [];
    @property({ type: [Node] })
    public middle1PointNodes: Node[] = [];
    @property({ type: [Node] })
    public middle2PointNodes: Node[] = [];
    @property({ type: [Node] })
    public endPointNodes: Node[] = [];

    @property({ type: [Sprite] })
    public horizontalLoad0Sprites: Sprite[] = [];
    @property({ type: [Sprite] })
    public horizontalLoad1Sprites: Sprite[] = [];
    @property({ type: [Sprite] })
    public horizontalLoad2Sprites: Sprite[] = [];

    @property({ type: [Sprite] })
    public resultCoinSprites: Sprite[] = [];
    
    @property({ type: [AnimationComponent] })
    public resultCoinAnimations: AnimationComponent[] = [];

    @property({ type: [AnimationComponent] })
    private showPathAnimation: AnimationComponent[] = [];

    private isPlayedPathAnimation: boolean[] = [];
    
    protected onLoad() {
        super.onLoad();
        this.showResultCoin(false, 0);
        this.isPlayedPathAnimation = new Array<boolean>(this.showPathAnimation.length).fill(false);
    }

    public setHideAll()
    {
        this.setHorizontalLoad(0, false);
        this.setHorizontalLoad(1, false);
        this.setHorizontalLoad(2, false);

        this.showPathAnimation[0].node.active = false;
        this.showPathAnimation[1].node.active = false;
        this.showPathAnimation[2].node.active = false;

        this.showResultCoin(false,0);

        this.isPlayedPathAnimation.fill(false);
    }
    
    public setHorizontalLoad(index: number, pathOn: boolean)
    {
        if(index == 0)
        {
            for (let i = 0; i < this.horizontalLoad0Sprites.length; i++) {
                const sprite = this.horizontalLoad0Sprites[i];
                if (sprite) 
                {
                    // if(i!=0 && i!=4) {
                    //     let color = sprite.color;
                    //     sprite.color = new Color(color.r, color.g, color.b, pathOn ? 255 : 128); 
                    // }
                    // else {
                        
                    //}                    
                    if(!this.isPlayedPathAnimation[0])
                    {
                        this.isPlayedPathAnimation[0] = true;
                        this.showPathAnimation[0].node.active = true;
                        this.showPathAnimation[0].play("dust");
                    }

                    sprite.enabled = pathOn;
                }
            }
        }
        else if(index == 1)
        {
            for (let i = 0; i < this.horizontalLoad1Sprites.length; i++) {
                const sprite = this.horizontalLoad1Sprites[i];
                if (sprite) 
                {
                    // if(i!=0 && i!=4) {
                    //     let color = sprite.color;
                    //     sprite.color = new Color(color.r, color.g, color.b, pathOn ? 255 : 128); 
                    // }
                    // else {
                        
                    //}
                    if(!this.isPlayedPathAnimation[1])
                    {
                        this.isPlayedPathAnimation[1] = true;
                        this.showPathAnimation[1].node.active = true;                    
                        this.showPathAnimation[1].play("dust");
                    }
                    

                    sprite.enabled = pathOn;
                }
            }
        }
        else if(index == 2)
        {
            for (let i = 0; i < this.horizontalLoad2Sprites.length; i++) {
                const sprite = this.horizontalLoad2Sprites[i];
                if (sprite) 
                {
                    // if(i!=0 && i!=4) {
                    //     let color = sprite.color;
                    //     sprite.color = new Color(color.r, color.g, color.b, pathOn ? 255 : 128); 
                    // }
                    // else {
                        
                    //}

                    if(!this.isPlayedPathAnimation[2])
                    {
                        this.isPlayedPathAnimation[2] = true;
                        this.showPathAnimation[2].node.active = true;
                        this.showPathAnimation[2].play("dust");
                    }
                    
                    sprite.enabled = pathOn;
                }
            }
        }
    }

    // aniType - 0 : idle, 1 : get
    public showResultCoin(isShow: boolean, direction: number, aniType: number = 0)
    {
        for (let i = 0; i < this.resultCoinSprites.length; i++) {
            const sprite = this.resultCoinSprites[i];
            if (sprite) {
                if(isShow)
                {
                    sprite.enabled = i + 1 == direction;

                    if(aniType == 1)
                    {
                        this.resultCoinAnimations[i].play("coin_get");
                    }
                    else
                    {
                        this.resultCoinAnimations[i].play("coin");
                    }
                }
                else
                {
                    sprite.enabled = false;
                }
            }
        }
    }
}