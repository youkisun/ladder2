import { _decorator, Button, Component, director, Label, Node, ResolutionPolicy, view } from 'cc';
import { GameAudioManger } from '../Main/GameAudioManger';
import { GameSystemFile } from '../Utils/GameSystemFile';
const { ccclass, property } = _decorator;

@ccclass('UILobby')
export class UILobby extends Component {

    @property(Button)
    private allTabButton: Button;
    @property(Button)
    private airDropTabButton: Button;
    @property(Button)
    private newGamesTabButton: Button;
    @property(Node)
    private allTabButtonSelected: Node;
    @property(Node)
    private airDropTabButtonSelected: Node;
    @property(Node)
    private newGamesTabButtonSelected: Node;

    @property(Node)
    private airdropGamesTab: Node;
    @property(Node)
    private newGamesTab: Node;

    @property(Button)
    private playMemeRunButton: Button;
    @property(Button)
    private playMemeRunDisableButton: Button;

    @property(Button)
    private playMemeNewGame0Button: Button;
    @property(Button)
    private playMemeNewGame1Button: Button;
    @property(Button)
    private playMemeNewGame2Button: Button;

    @property(Label)
    private gameVersionLabel: Label;
    

    public onClickPlayMemeRunButton: () => void = null;
    public onClickPlayMemeRunDisableButton: () => void = null;
    public onClickTabButtonEvent: (index:number) => void = null;
    public onClickMemeNewGameButtonEvent: () => void = null;

    resizeCanvas() {
        view.setDesignResolutionSize(1080, 1920, view.getResolutionPolicy());
        view.resizeWithBrowserSize(true);
    }

    applyFit() {
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_HEIGHT);
    }

    updateResolution() {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const targetHeight = 1920;
        const aspectRatio = screenW / screenH;
        const adjustedWidth = targetHeight * aspectRatio;

        view.setDesignResolutionSize(adjustedWidth, targetHeight, ResolutionPolicy.FIXED_HEIGHT);
    }

    protected onLoad(): void {
        director.on("resize", this.updateResolution, this);

        this.playMemeRunButton.interactable = false;
        this.updateResolution();

        this.allTabButton.node.on(Button.EventType.CLICK, () => {
            //GameAudioManger.getDefaultInstance().playSound("button");
            this.setTabSelectedNode(1);
            this.onClickTabButtonEvent(1);

            this.airdropGamesTab.active = true;
            this.newGamesTab.active = true;

        }, this);

        this.airDropTabButton.node.on(Button.EventType.CLICK, () => {
            //GameAudioManger.getDefaultInstance().playSound("button");
            this.setTabSelectedNode(2);
            this.onClickTabButtonEvent(2);

            this.airdropGamesTab.active = true;
            this.newGamesTab.active = false;
        }, this);

        this.newGamesTabButton.node.on(Button.EventType.CLICK, () => {
            //GameAudioManger.getDefaultInstance().playSound("button");
            this.setTabSelectedNode(3);
            this.onClickTabButtonEvent(3);

            this.airdropGamesTab.active = false;
            this.newGamesTab.active = true;
        }, this);

        this.playMemeNewGame0Button.node.on(Button.EventType.CLICK, () => {
            this.onClickMemeNewGameButtonEvent();
            //GameAudioManger.getDefaultInstance().playSound("button");
        }, this);

        this.playMemeNewGame1Button.node.on(Button.EventType.CLICK, () => {
            this.onClickMemeNewGameButtonEvent();
           // GameAudioManger.getDefaultInstance().playSound("button");
        }, this);

        this.playMemeNewGame2Button.node.on(Button.EventType.CLICK, () => {
            this.onClickMemeNewGameButtonEvent();
           // GameAudioManger.getDefaultInstance().playSound("button");
        }, this);
    }

    

    private setTabSelectedNode(index: number) {
        this.allTabButtonSelected.active = index == 1;
        this.airDropTabButtonSelected.active = index == 2;
        this.newGamesTabButtonSelected.active = index == 3;        
    }

    public setActiveMemeRunButton(active: boolean) {
        this.playMemeRunButton.interactable = active;
        this.playMemeRunButton.node.active = active;
        this.playMemeRunDisableButton.node.active = !active;
    }

    public SetVersionLabel(version: string) {
        this.gameVersionLabel.string = version;
    }

    start() {


        this.playMemeRunButton.node.on(Button.EventType.CLICK, () => {

            this.onClickPlayMemeRunButton();
            
        }, this);

        this.playMemeRunDisableButton.node.on(Button.EventType.CLICK, () => {

            this.onClickPlayMemeRunDisableButton();
            
        }, this);

        this.SetVersionLabel(GameSystemFile.getVersion());
    }


}


