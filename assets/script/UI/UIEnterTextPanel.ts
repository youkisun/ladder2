import { _decorator, Button, Component, EditBox, Label, Node, RichText } from 'cc';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { GameAudioManger } from '../Main/GameAudioManger';
import { GameMainContext } from '../Main/GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('UIEnterTextPanel')
export class UIEnterTextPanel extends Component {

    @property(EditBox)
    private adressEditBox: EditBox = null;

    @property(Button)
    private pastButton: Button = null;

    @property(Button)
    private applyButton: Button = null;

    @property(Button)
    private closeButton: Button = null;

    @property(Label)
    private errorMessageLabel: Label = null;

    @property(Label)
    private descLabel: Label = null;

    @property(RichText)
    private descLabel2: RichText = null;


    private errorMessageRemainShowTime: number = 0;

    // 0 : Enter TON coin address, 1 : Enter Solana coin address, 2 : Change nickname.
    // 3 : Enter X Acount
    public panelType = 0;

    public onApplyValue: (panelType: number, value: string) => void;
    public onChangedValue: (panelType: number, value: string) => void;

    protected onLoad(): void {
        this.setActiveApplyButton(false);
        this.descLabel2.node.active = false;
    }

    start() {
        this.pastButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.pasteButtonEvent();
        }, this);
        this.applyButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.applyButtonEvent();
        }, this);
        this.closeButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.closeButtonEvent();
        }, this);
        this.adressEditBox.node.on('text-changed', this.onTextChangedEvent, this);

        this.adressEditBox.textLabel.verticalAlign = Label.VerticalAlign.CENTER;
        this.adressEditBox.placeholderLabel.verticalAlign = Label.VerticalAlign.CENTER;
    }

    private onTextChangedEvent() {
        this.onChangedValue(this.panelType, this.adressEditBox.textLabel.string.trim());
    }

    private async getClipboardCopy(): Promise<string> {
        return navigator.clipboard.readText();
    }

    private pasteButtonEvent() {
        this.getClipboardCopy().then(copyText => {
            copyText = copyText.trim();
            if (copyText.length > 0) {
                this.adressEditBox.string = copyText;
                this.onChangedValue(this.panelType, copyText);
            }
        });
    }

    private applyButtonEvent() {
        this.onApplyValue(this.panelType, this.adressEditBox.textLabel.string.trim());
    }

    private closeButtonEvent() {
        GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
    }

    public setErrorMessage(value: string) {
        this.errorMessageLabel.string = value;
    }

    public setType(typeValue: number) {
        this.panelType = typeValue;
        this.pastButton.node.active = typeValue != 2;
        this.descLabel2.node.active = false;
        this.adressEditBox.string = "";

        if (this.panelType == 0 || this.panelType == 1) {
            this.adressEditBox.placeholderLabel.string = "Click here to enter the address.";
            this.descLabel.string = "Please enter the address.";
            this.adressEditBox.maxLength = 48;
        }
        else if (this.panelType == 3) {
            this.adressEditBox.placeholderLabel.string = "Click here to enter the account.";

            this.pastButton.node.active = false;
            let username = "Unregistered";
            const account = GameMainContext.getDefault()?.initPacket?.mi_x_account;
            if (typeof account === 'string' && account.length > 0) {
                username = account;
            }

            this.descLabel.string = `Please enter the your X account(username)`;
            this.descLabel2.string = `(Registered Account : <color=#E73434>${username}</color>)`;
            this.descLabel2.node.active = true;
            this.adressEditBox.maxLength = 15;
            this.setErrorMessage("* Incorrect information may result in disadvantages.\nduring the Airdrop process");
        }
        else {
            this.adressEditBox.placeholderLabel.string = "Click here to enter the nickname.";
            this.descLabel.string = "Please enter the nickname.";
            this.adressEditBox.maxLength = 8;
        }
    }

    public setActiveApplyButton(value: boolean) {
        this.applyButton.interactable = value;
    }

    update(deltaTime: number) {
        //let inputStr = this.adressEditBox.textLabel.string.trim();
    }
}


