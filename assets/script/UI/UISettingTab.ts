import { _decorator, Button, Color, Component, Label, Node, Sprite, Toggle } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameMainContext } from '../Main/GameMainContext';
import { GameAudioManger } from '../Main/GameAudioManger';
import { GameNetwork } from '../Network/GameNetwork';
import { UIShortAlarm } from './UIShortAlarm';
const { ccclass, property } = _decorator;

@ccclass('UISettingTab')
export class UISettingTab extends DefaultComponent<UISettingTab> {

    @property(Button)
    private tonAdressEditButton: Button;

    @property(Button)
    private solAdressEditButton: Button;

    @property(Button)
    private changeNickNameEditButton: Button;

    @property(Label)
    private tonAdressLabel: Label;

    @property(Label)
    private solAdressLabel: Label;

    @property(Label)
    private nicknameLabel: Label;
    private tonAdressDescLabel: Label;

    @property(Button)
    private soundOnButton: Button;

    @property(Sprite)
    private soundOnCheck: Sprite;

    @property(Button)
    private soundOffButton: Button;

    @property(Sprite)
    private soundOffCheck: Sprite;

    private soundCheckOn: boolean;

    private soundChangedCount: number = 0;

    public onClickChangeTonAdress: () => void;
    public onClickChangeSolAdress: () => void;
    public onClickChangeNickName: () => void;

    private checkSoundChangeLimitCount(): boolean {
        this.soundChangedCount++;

        if (this.soundChangedCount >= 5) {
            this.soundChangedCount = 5;
            UIShortAlarm.getDefaultInstance().showShortAlarm("Please try again later.");
            return true;
        }
        return false;
    }

    start() {
        this.tonAdressEditButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickChangeTonAdress();
        }, this);

        this.solAdressEditButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickChangeSolAdress();
        }, this);

        this.changeNickNameEditButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onClickChangeNickName();
        }, this);

        this.setTonAdressLabel(GameMainContext.getDefault().initPacket.ton_addr);
        this.setSolAdressLabel(GameMainContext.getDefault().initPacket.sol_addr);
        this.setNicknameLabel(GameMainContext.getDefault().initPacket.nick);


        this.soundCheckOn = GameMainContext.getDefault().initPacket.sound_on == 1 ? true : false;

        this.soundOnCheck.node.active = this.soundCheckOn;
        this.soundOffCheck.node.active = !this.soundCheckOn;

        this.soundOnButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onSoundToggle(true);
        }, this);

        this.soundOffButton.node.on(Button.EventType.CLICK, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().playSound("button");
            this.onSoundToggle(false);
        }, this);
    }

    private onSoundToggle(isOn: boolean) {        
        if (isOn == this.soundCheckOn)
            return;

        if (this.checkSoundChangeLimitCount()) {
            return;
        }

        this.soundCheckOn = isOn;
        this.soundOnCheck.node.active = isOn;
        this.soundOffCheck.node.active = !isOn;

        GameNetwork.getDefaultInstance().sendUpdateSoundReq(isOn ? 1 : 0, () => {
            if (GameAudioManger.getDefaultInstance() != null)
                GameAudioManger.getDefaultInstance().setMute(!isOn);
        });
    }

    public setTonAdressLabel(value: string) {
        if (value.length <= 0) {
            this.tonAdressLabel.string = "Not Registed";
            this.tonAdressLabel.color = Color.RED;
        }
        else {
            const formattedValue = value.length > 10
                ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
                : value;
            this.tonAdressLabel.string = `${formattedValue}`;
        }
    }

    public setSolAdressLabel(value: string) {
        if (value.length <= 0) {
            this.solAdressLabel.string = "Not Registed";
            this.solAdressLabel.color = Color.RED;
        }
        else {
            const formattedValue = value.length > 10
                ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
                : value;
            this.solAdressLabel.string = `${formattedValue}`;
        }
    }

    public setNicknameLabel(value: string) {
        this.nicknameLabel.string = value;
    }

}


