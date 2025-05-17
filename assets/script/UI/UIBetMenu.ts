import { _decorator, AnimationComponent, Button, Color, Component, EditBox, Label, Node, Sprite } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
import { UIShortAlarm } from './UIShortAlarm';
const { ccclass, property } = _decorator;

@ccclass('UIBetMenu')
export class UIBetMenu extends Component {
    
    @property(Node)
    private rootNode: Node = null;

    @property(AnimationComponent)
    private animation: AnimationComponent;
    
    //----------------------------------------------------------------------------------
    // betAmountClickType
    @property(Node)
    private betAmountClickType: Node = null;

    @property(Button)
    private betAmountType0Button: Button;
    @property(Button)
    private betAmountType1Button: Button;
    @property(Button)
    private betAmountType2Button: Button;
    @property(Button)
    private betAmountType3Button: Button;

    @property(Label)
    private betAmountType0ButtonLabel: Label;
    @property(Label)
    private betAmountType1ButtonLabel: Label;
    @property(Label)
    private betAmountType2ButtonLabel: Label;
    @property(Label)
    private betAmountType3ButtonLabel: Label;

    @property(Node)
    private betAmountType0SelectImage: Node;
    @property(Node)
    private betAmountType1SelectImage: Node;
    @property(Node)
    private betAmountType2SelectImage: Node;
    @property(Node)
    private betAmountType3SelectImage: Node;

    @property(Button)
    private changeBetManualButton: Button = null;

    //----------------------------------------------------------------------------------
    // betAmountManualType

    @property(Node)
    private betAmountManualType: Node = null;

    @property(Button)
    private changeBetClickButton: Button = null;

    @property(EditBox)
    private betAmountEditBox: EditBox = null;

    @property(Button)
    private betAmountMaxButton: Button = null;

    //----------------------------------------------------------------------------------


    @property(Button)
    private betActor0Button: Button;
    @property(Button)
    private betActor1Button: Button;

    // @property(Sprite)
    // private betActor0Sprite: Sprite;
    // @property(Sprite)
    // private betActor1Sprite: Sprite;

    @property(Node)
    private betActorSelect0Image: Node;
    @property(Node)
    private betActorSelect1Image: Node;

    @property(Label)
    private betActor0ButtonLabel: Label;
    @property(Label)
    private betActor1ButtonLabel: Label;

    @property(Button)
    private betBtn: Button = null;

    @property(Node)
    private betMark: Node;

    @property(Node)
    private betButtonDisable: Node;

    @property(Label)
    private betAmountLabel: Label;

    @property(Label)
    private airdropAmountLabel: Label;

    public betValues: number[] = [0.1, 0.5, 1, 5];
    
    private betUIMode = 0;

    public onClickBetBtnEvent: () => void = null;
    public onClickBetAmountBtnEvent: (betAmountPoint: number) => void = null;
    public onClickClearBetAmountBtnEvent: () => void = null;
    public onClickBetActorButtonEvent: (betActor: number) => void = null;
    
    protected onLoad(): void {
        this.betBtn.node.on(Button.EventType.CLICK, ()=>
            { 
                this.onClickBetBtnEvent(); 
            }, this);
        
        this.changeBetManualButton.node.on(Button.EventType.CLICK, ()=>{ this.onClickClearBetAmountBtnEvent(); }, this);
        this.changeBetClickButton.node.on(Button.EventType.CLICK, this.changeBetBtnModeEvent, this);

        this.betAmountType0Button.node.on(Button.EventType.CLICK, ()=>{ this.onClickBetAmountBtnEvent(this.betValues[0]); }, this);
        this.betAmountType1Button.node.on(Button.EventType.CLICK, ()=>{ this.onClickBetAmountBtnEvent(this.betValues[1]); }, this);
        this.betAmountType2Button.node.on(Button.EventType.CLICK, ()=>{ this.onClickBetAmountBtnEvent(this.betValues[2]); }, this);
        this.betAmountType3Button.node.on(Button.EventType.CLICK, ()=>{ this.onClickBetAmountBtnEvent(this.betValues[3]); }, this);

        this.betActor0Button.node.on(Button.EventType.CLICK, ()=>{ this.onClickBetActorButtonEvent(0); }, this);
        this.betActor1Button.node.on(Button.EventType.CLICK, ()=>{ this.onClickBetActorButtonEvent(1); }, this);

        this.betAmountMaxButton.node.on(Button.EventType.CLICK, this.betAmountMaxEvent, this);

        this.changeBetBtnModeEvent();
        //this.betAmountButtonEvent(0);
        

        this.betAmountType0ButtonLabel.string = `+${this.betValues[0]}`;
        this.betAmountType1ButtonLabel.string = `+${this.betValues[1]}`;
        this.betAmountType2ButtonLabel.string = `+${this.betValues[2]}`;
        this.betAmountType3ButtonLabel.string = `+${this.betValues[3]}`;

        this.rootNode.active = false;           
        this.betButtonDisable.active = false;     

        this.setBetActorButtonUI(0);

        GameMainContext.getDefault().onSetAirdropCreditEvent = this.setAirdropAmountLabel.bind(this);
    }

    public buttonDisable()
    {
        this.betButtonDisable.active = true;
        this.betBtn.interactable = false;        

        this.betAmountType0Button.interactable = false;
        this.betAmountType1Button.interactable = false;
        this.betAmountType2Button.interactable = false;
        this.betAmountType3Button.interactable = false;

        this.changeBetManualButton.interactable = false;
        this.betAmountMaxButton.interactable = false;
        this.changeBetClickButton.interactable = false;

        this.betActor0Button.interactable = false;
        this.betActor1Button.interactable = false;
    }

    public buttonEnable()
    {
        this.betMark.active = false;
        this.betBtn.interactable = true;
        this.betButtonDisable.active = false;
        

        this.betAmountType0Button.interactable = true;
        this.betAmountType1Button.interactable = true;
        this.betAmountType2Button.interactable = true;
        this.betAmountType3Button.interactable = true;

        this.changeBetManualButton.interactable = true;
        this.betAmountMaxButton.interactable = true;
        this.changeBetClickButton.interactable = true;

        this.betActor0Button.interactable = true;
        this.betActor1Button.interactable = true;
    }

    private changeBetBtnModeEvent()
    {
        this.betUIMode = 0;
        this.betAmountClickType.active = true;
        this.betAmountManualType.active = false;
    }

    public setAirdropAmountLabel(value: number) {
        this.airdropAmountLabel.string = `(${value}/30)`;
    }

    public setReserveBetLabel(value: number) {
        return;
        if (value > 0)
            this.betAmountLabel.string = `(${value.toFixed(1).toLocaleString()})`;
        else
            this.betAmountLabel.string = "";

        this.betButtonDisable.active = value <= 0;
    }

    public setBetActorButtonUI(index: number)
    {
        if(index == 0)
        {
            this.betActorSelect0Image.active = true;            
            //this.betActor0Sprite.color = new Color(255,255,255,255);
            //this.betActor0ButtonLabel.color = new Color(255,255,255,255);
            this.betActorSelect1Image.active = false;
           //this.betActor1Sprite.color = new Color(255,255,255,150);
            //his.betActor1ButtonLabel.color = new Color(255,255,255,150);
        }
        else
        {
            this.betActorSelect0Image.active = false;
            //this.betActor0Sprite.color = new Color(255,255,255,150);
            //this.betActor0ButtonLabel.color = new Color(255,255,255,150);
            this.betActorSelect1Image.active = true;
            //this.betActor1Sprite.color = new Color(255,255,255,255);
            //this.betActor1ButtonLabel.color = new Color(255,255,255,255);
        }

        
    }

    private betAmountMaxEvent()
    {
    //    this.betAmount = GameMainContext.getDefault().tonPoint;
    //    this.betAmountEditBox.string = this.betAmount.toString();
        
    }

    public activeUI() {
        this.rootNode.active = true;
        
        this.buttonEnable();
        this.setReserveBetLabel(0);
    }

    public showUI()
    {        
        this.activeUI();
        this.animation.stop();
        this.animation.play("showBetBtnsAnim");
    }

    public hideUI(isImediatly: boolean = false)
    {
        this.animation.stop();
        this.betMark.active = false;
        
        if(isImediatly)
        {
            const state = this.animation.getState("hideBetBtnsAnim");
            if (state) {
                state.time = state.duration;
                state.update(state.duration);
            }            
        }
        else
        {
            this.animation.play("hideBetBtnsAnim");
        }
    }
}