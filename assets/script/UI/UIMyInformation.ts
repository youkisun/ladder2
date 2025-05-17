import { _decorator, Button, Component, Node } from 'cc';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { UIMyBetTab } from './UIMyBetTab';
import { UISettingTab } from './UISettingTab';
import { UIHud } from './UIHud';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('UIMyInformation')
export class UIMyInformation extends Component {

    @property({ type: [Button] })
    private tabButtons: Button[] = [];

    @property({ type: [Node] })
    private tabButtonSelecteds: Node[] = [];

    @property(Button)
    private closeButton: Button;

    @property({ type: [Node] })
    private tabPanels: Node[] = [];

    @property(UIMyBetTab)
    public uiMyBetTab: UIMyBetTab;
    @property(UISettingTab)
    public uiSettingTab: UISettingTab;

    public onSelectedTab: (value: number) => void;

    protected onLoad(): void {

    }

    start() {

        for (let i = 0; i < this.tabButtons.length; i++) {
            let button = this.tabButtons[i];
            button.node.on(Button.EventType.CLICK, () => {
                this.onClickTabButton(i);
            }, this);
        }

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            GameAudioManger.getDefaultInstance().playSound("button");
            GameUIManager.getDefaultInstance().hide(UIType.MY_INFORMATION);
        }, this);
    }

    private onClickTabButton(index: number) {
        GameAudioManger.getDefaultInstance().playSound("button");
        this.unSelectedAll();
        this.tabButtonSelecteds[index].active = true;
        this.tabPanels[index].active = true;
        if (this.onSelectedTab != null)
            this.onSelectedTab(index);
    }

    private unSelectedAll() {
        for (let i = 0; i < this.tabButtonSelecteds.length; i++) {
            this.tabButtonSelecteds[i].active = false;
        }

        for (let i = 0; i < this.tabPanels.length; i++) {
            this.tabPanels[i].active = false;
        }

    }

    protected onEnable(): void {
        UIHud.getDefaultInstance().setMenuColor(true);
        this.onClickTabButton(0);
    }

    protected onDisable(): void {
        if (UIHud.getDefaultInstance() != null) {
            UIHud.getDefaultInstance().uiBottomMenu.clearMyInformToggle();
            UIHud.getDefaultInstance().setMenuColor(false);
        }

    }

}


