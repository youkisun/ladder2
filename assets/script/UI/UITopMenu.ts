import { _decorator, AnimationComponent, Button, Component, Label, Node, Tween, tween, Vec3, Widget } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
import { GameStateManager } from '../Main/GameStateManager';
import { DefaultComponent, GameUtil } from '../Utils/GameUtils';
import { GameAddCoinControl } from '../Main/GameAddCoinControl';
const { ccclass, property } = _decorator;

@ccclass('UITopMenu')
export class UITopMenu extends DefaultComponent<UITopMenu> {

    @property(AnimationComponent)
    private animation: AnimationComponent;

    @property(Label)
    private tonCoinTotalAmountLabel: Label = null;

    @property(Node)
    public runCoinNode: Node;

    @property(Label)
    private runCoinTotalAmountLabel: Label = null;

    @property(Node)
    public runCoinIcon: Node;

    @property(Button)
    private expendButton: Button;

    @property(Button)
    private hideButton: Button;

    @property(Label)
    private roundLabel: Label = null;

    @property(Label)
    private uidLabel: Label = null;

    @property(Label)
    private totalGamesLabel: Label = null;

    @property(Label)
    private totalWinsLabel: Label = null;

    @property(Label)
    private nowSteakLabel: Label = null;

    @property(Node)
    public tonCoinNode: Node;

    

    private originParent: Node;

    private isExpended: boolean = false;

    private isActive: boolean = true;

    protected onLoad(): void {
        super.onLoad();
        this.roundLabel.string = "";
        this.uidLabel.string = "";

        this.originParent = this.node.parent;
    }

    start() {
        
        GameMainContext.getDefault().onSetRunPointEvent = this.setTotalRunCoinLabel.bind(this);
        GameAddCoinControl.getDefault().onSetRunAddPointEvent = this.setAddRunCoinLabel.bind(this);
        GameMainContext.getDefault().onSetUIDEvent = this.setUIDLabel.bind(this);
        GameMainContext.getDefault().setTotalGames = this.setTotalGamesLabel.bind(this);
        GameMainContext.getDefault().setTotalWins = this.setTotalWinsLabel.bind(this);
        GameMainContext.getDefault().onSetNowStreakEvent = this.setNowStreakLabel.bind(this);
        GameStateManager.getDefaultInstance().onSetRoundEvent = this.setRoundLabel.bind(this);
        this.expendButton.node.on(Button.EventType.CLICK, this.expendButtonEvent, this);
        this.hideButton.node.on(Button.EventType.CLICK, this.hideButtonEvent, this);
    }

    scaleUpAndDown(target: Node) {
        const originalScale = new Vec3(1, 1, 1);
        const enlargedScale = new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z * 1.2); 

        Tween.stopAllByTarget(target);
        new Tween(target)
            .to(0.3, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    target.setScale(
                        originalScale.x + (enlargedScale.x - originalScale.x) * ratio,
                        originalScale.y + (enlargedScale.y - originalScale.y) * ratio,
                        originalScale.z + (enlargedScale.z - originalScale.z) * ratio
                    );
                }
            })
            .to(0.3, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    target.setScale(
                        enlargedScale.x - (enlargedScale.x - originalScale.x) * ratio,
                        enlargedScale.y - (enlargedScale.y - originalScale.y) * ratio,
                        enlargedScale.z - (enlargedScale.z - originalScale.z) * ratio
                    );
                }
            })
            .start();
    }

    // public setTotalTonCoinLabel(value: number, isScaleTween: boolean = false) {
    //     value = GameUtil.toTwoDecimal(value);
    //     this.subTonCoinAmount.string = this.tonCoinTotalAmountLabel.string = value.toString();

    //     if (isScaleTween)
    //         this.scaleUpAndDown(this.tonCoinTotalAmountLabel.node);
    // }

    public setTotalRunCoinLabel(value: number, isScaleTween: boolean = false) {
        value = GameUtil.toTwoDecimal(value);
        this.runCoinTotalAmountLabel.string = value.toString();

        if (isScaleTween)
            this.scaleUpAndDown(this.runCoinTotalAmountLabel.node);
    }

    public setAddRunCoinLabel(value: number, isShowPlus: boolean) {
        value = GameUtil.toTwoDecimal(value);
        if(isShowPlus)
        {
            this.runCoinTotalAmountLabel.string = `+ ${value.toString()}`;
            this.scaleUpAndDown(this.runCoinTotalAmountLabel.node);
        }
        else
        {
            
            this.runCoinTotalAmountLabel.string = `${value.toString()}`;                        
        }
    }

    // public setTonAdressLabel(value: string) {
    //     if (value.length > 0) {
    //         const formattedValue = value.length > 10 
    //             ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
    //             : value;
    //         this.subTonAdressLabel.string = `TON CLAIM ADDR : ${formattedValue}`;
    //     } else {
    //         this.subTonAdressLabel.string = `TON CLAIM ADDR : unregistered`;
    //     }
    // }
    

    public setRoundLabel(value: number) {
        this.roundLabel.string = `Round : ${value}`;
    }

    public setUIDLabel(value: string) {
        this.uidLabel.string = `UID : ${value}`;
    }

    public setTotalGamesLabel(value: string) {
        this.totalGamesLabel.string = `TOTAL GAMES : ${value}`;
    }

    public setTotalWinsLabel(value: string) {
        this.totalWinsLabel.string = `TOTAL WINS : ${value}`;
    }

    public setNowStreakLabel(value: string) {
        this.nowSteakLabel.string = `NOW STREAK : ${value}`;
    }

    private expendButtonEvent() {

        if(!this.isActive)
            return;

        this.isExpended = !this.isExpended;
        const animName = this.isExpended ? "showTopInfo" : "hideTopInfo";
        this.animation.stop();
        this.animation.play(animName);
    }

    private hideButtonEvent() {
        this.isExpended = false;
        this.animation.stop();
        this.animation.play("hideTopInfo");
    }

    public setParent(parent: Node) {
        this.node.setParent(parent);
    }

    public revertParent() {
        this.node.setParent(this.originParent);
    }

    public setActive(value: boolean) {
        this.isExpended = false;
        const animName = "hideTopInfo";
        this.animation.stop();
        this.animation.play(animName);
        this.isActive = value;

    }

    public setActiveAddRunCoinMode(active: boolean, isScale: boolean = false) {

        if(active)
        {
            GameMainContext.getDefault().onSetRunPointEvent = null;
        }
        else
        {
            GameMainContext.getDefault().onSetRunPointEvent = this.setTotalRunCoinLabel.bind(this);
            GameMainContext.getDefault().setRunPoint(GameMainContext.getDefault().runPoint, isScale, false, true);
            
        }
        console.log(`setActiveAddRunCoinNode:${active}`);
    }
}