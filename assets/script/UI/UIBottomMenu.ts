import { _decorator, Button, Component, Node, Toggle, ToggleContainer } from 'cc';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('UIBottomMenu')
export class UIBottomMenu extends Component {

    @property(ToggleContainer)
    private toggleRoot: ToggleContainer;

    @property(Button)
    private inGameButton: Button;
    @property(Button)
    private homeButton: Button;
    @property(Button)
    private historyButton: Button;
    @property(Button)
    private myInfoButton: Button;
    @property(Button)
    private walletButton: Button;
    @property(Button)
    private storeButton: Button;

    @property(Node)
    private ingameButtonPressed: Node;
    @property(Node)
    private walletButtonPressed: Node;
    @property(Node)
    private historyButtonPressed: Node;
    @property(Node)
    private myInfoButtonPressed: Node;
    @property(Node)
    private storeButtonPressed: Node;
    @property(Node)
    private homeButtonPressed: Node;

    public onClickInGameBtn: () => void;
    public onClickHistoryBtn: () => void;
    public onClickMyInfoBtn: () => void;
    public onClickWalletBtn: () => void;
    public onClickStoreBtn: () => void;
    public onClickHomeBtn: () => void;

    protected onLoad(): void {

        this.inGameButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickInGameBtn();

            this.ingameButtonPressed.active = false;
            this.walletButtonPressed.active = false;
            this.historyButtonPressed.active = false;
            this.myInfoButtonPressed.active = false;
            this.storeButtonPressed.active = false;
            this.homeButtonPressed.active = false;

        }, this);

        this.homeButton.node.on(Button.EventType.CLICK, () => {

            this.ingameButtonPressed.active = false;
            this.walletButtonPressed.active = false;
            this.historyButtonPressed.active = false;
            this.myInfoButtonPressed.active = false;
            this.storeButtonPressed.active = false;
            this.homeButtonPressed.active = true;
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickHomeBtn();


        }, this);

        this.historyButton.node.on(Button.EventType.CLICK, () => {
            this.ingameButtonPressed.active = false;
            this.walletButtonPressed.active = false;
            this.historyButtonPressed.active = true;
            this.myInfoButtonPressed.active = false;
            this.storeButtonPressed.active = false;
            this.homeButtonPressed.active = false;
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickHistoryBtn();

        }, this);

        this.myInfoButton.node.on(Button.EventType.CLICK, () => {
            this.ingameButtonPressed.active = false;
            this.walletButtonPressed.active = false;
            this.historyButtonPressed.active = false;
            this.myInfoButtonPressed.active = true;
            this.storeButtonPressed.active = false;
            this.homeButtonPressed.active = false;
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickMyInfoBtn();

        }, this);

        this.walletButton.node.on(Button.EventType.CLICK, () => {
            this.ingameButtonPressed.active = false;
            this.walletButtonPressed.active = true;
            this.historyButtonPressed.active = false;
            this.myInfoButtonPressed.active = false;
            this.storeButtonPressed.active = false;
            this.homeButtonPressed.active = false;
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            if (this.onClickWalletBtn != null)
                this.onClickWalletBtn();



        }, this);

        this.storeButton.node.on(Button.EventType.CLICK, () => {
            this.ingameButtonPressed.active = false;
            this.walletButtonPressed.active = false;
            this.historyButtonPressed.active = false;
            this.myInfoButtonPressed.active = false;
            this.storeButtonPressed.active = false;
            this.homeButtonPressed.active = false;
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            if (this.onClickStoreBtn != null)
                this.onClickStoreBtn();


        }, this);
    }

    public clearAllButton() {
        this.ingameButtonPressed.active = false;
        this.walletButtonPressed.active = false;
        this.historyButtonPressed.active = false;
        this.myInfoButtonPressed.active = false;
        this.storeButtonPressed.active = false;
        this.homeButtonPressed.active = false;
    }

    public clearHistoryToggle() {
        this.historyButtonPressed.active = false;
    }

    public clearMyInformToggle() {
        this.myInfoButtonPressed.active = false;
    }

    public clearWalletToggle() {
        //this.walletButton.isChecked = false;
    }


}



// class TEST
// {
//     public onClickSpinBtn: () => void;

//     private onLoad()
//     {
//         this.onClickSpinBtn();
//     }
// }

// @ccclass('TEST_USE')
// export class TEST_USE extends Component
// {
//     @property(Button)
//     public myInfoButton: Button;

//     protected start(): void
//     {
//         let test = new TEST();

//         test.onClickSpinBtn = this.onClickSpinBtn.bind(this);
//     }

//     private onClickSpinBtn()
//     {
//         this.myInfoButton.node.active = false;
//     }
// }