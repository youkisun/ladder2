import { _decorator, Component, Node } from 'cc';
import { UIMyInformation } from '../UI/UIMyInformation';
import { GameMainContext } from '../Main/GameMainContext';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { UIEnterTextPanel } from '../UI/UIEnterTextPanel';
import { GameNetwork } from '../Network/GameNetwork';
import { GameUpdateNickPacket, GameUpdateTonAddr } from '../Network/GamePacket';
import { UIHud } from '../UI/UIHud';
import { UISettingTab } from '../UI/UISettingTab';
import { UIShortAlarm } from '../UI/UIShortAlarm';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

@ccclass('GameMyInfomation')
export class GameMyInfomation extends Component {

    @property(UIMyInformation)
    private uiMyInformation: UIMyInformation;

    private tonChangedCount: number = 0;
    private solChangedCount: number = 0;

    start() {

        this.uiMyInformation.onSelectedTab = this.onSelectedTab.bind(this);

        this.uiMyInformation.uiSettingTab.onClickChangeTonAdress = this.onClickChangeTonAdress.bind(this);
        this.uiMyInformation.uiSettingTab.onClickChangeSolAdress = this.onClickChangeSolAdress.bind(this);
        this.uiMyInformation.uiSettingTab.onClickChangeNickName = this.onClickChangeNickName.bind(this);

    }

    private checkLimitCount(type: number): boolean {
        let isMessage = false;
        if (type == 0) {
            this.tonChangedCount++;

            if (this.tonChangedCount > 5) {
                this.tonChangedCount = 5;
                isMessage = true;
            }
        }
        else if (type == 1) {
            this.solChangedCount++;

            if (this.solChangedCount > 5) {
                this.solChangedCount = 5;
                isMessage = true;
            }
        }
        // else if (type == 2) {
        //     this.soundChangedCount++;

        //     if (this.soundChangedCount > 5) {
        //         this.soundChangedCount = 5;
        //         isMessage = true;
        //     }
        // }

        if (isMessage) {
            UIShortAlarm.getDefaultInstance().showShortAlarm("Please try again later.");
            return true;
        }

        return false;

    }


    private onSelectedTab(tabIndex: number) {
        switch (tabIndex) {
            // MISSION
            case 0:

                break;
            // MY BET
            case 1:
                this.setMyBet();
                break;
            // SETTING
            case 2:
                break;
        }
    }

    // public set(index: number, 
    //     game_no: number,
    //     bridge_num: number,
    //     side: number,
    //     winner: number,
    //     winStatus: number,
    //     betAmount: number) 
    // {

    private setMyBet() {
        let uiMyBetTab = this.uiMyInformation.uiMyBetTab;

        const tenPasGameResults = GameMainContext.getDefault().getMyBetPastGameResults();

        for (let i = 0; i < tenPasGameResults.length; i++) {

            uiMyBetTab.set(i,
                tenPasGameResults[i].game_no,
                0,
                0,
                tenPasGameResults[i].res_winner,
                tenPasGameResults[i].bet_winner == tenPasGameResults[i].res_winner ? 2 : 1,
                tenPasGameResults[i].bet_t_points,
                tenPasGameResults[i].win_r_points,
                tenPasGameResults[i].total_roul_bonus);
        }
    }

    private async onClickChangeTonAdress() {
        const node = GameUIManager.getDefaultInstance().load(UIType.ENTER_TEXT_PANEL);
        if (node) {
            const uiEnterTextPanel = node.getComponent(UIEnterTextPanel);
            uiEnterTextPanel.setType(0);
            uiEnterTextPanel.onChangedValue = this.onChangedValueEnterTextPanel.bind(this);
            uiEnterTextPanel.onApplyValue = this.onApplyValueEnterTextPanel.bind(this);
        }
    }

    private async onClickChangeSolAdress() {
        const node = GameUIManager.getDefaultInstance().load(UIType.ENTER_TEXT_PANEL);
        if (node) {
            const uiEnterTextPanel = node.getComponent(UIEnterTextPanel);
            uiEnterTextPanel.setType(1);
            uiEnterTextPanel.onChangedValue = this.onChangedValueEnterTextPanel.bind(this);
            uiEnterTextPanel.onApplyValue = this.onApplyValueEnterTextPanel.bind(this);
        }
    }

    private async onClickChangeNickName() {
        const node = GameUIManager.getDefaultInstance().load(UIType.ENTER_TEXT_PANEL);
        if (node) {
            const uiEnterTextPanel = node.getComponent(UIEnterTextPanel);
            uiEnterTextPanel.setType(2);
            uiEnterTextPanel.onChangedValue = this.onChangedValueEnterTextPanel.bind(this);
            uiEnterTextPanel.onApplyValue = this.onApplyValueEnterTextPanel.bind(this);
        }
    }

    private onApplyValueEnterTextPanel(panelType: number, value: string) {

        if (this.checkLimitCount(panelType))
            return;

        let enterTextNode = GameUIManager.getDefaultInstance().get(UIType.ENTER_TEXT_PANEL);
        if (enterTextNode == null)
            return;

        const uiEnterTextPanel = enterTextNode.getComponent(UIEnterTextPanel);
        if (uiEnterTextPanel == null) {
            Logger.error(`dont get UIEnterTextPanel`);
            return;
        }

        uiEnterTextPanel.setActiveApplyButton(false);

        // change adrress
        if (panelType == 0) {
            GameNetwork.getDefaultInstance().sendUpdateTonAddrReq(value, (gameUpdateTonAddr) => {
                if (gameUpdateTonAddr.suc) {
                    GameMainContext.getDefault().setTonAddress(gameUpdateTonAddr.updated_ton_addr);
                    UISettingTab.getDefaultInstance().setTonAdressLabel(gameUpdateTonAddr.updated_ton_addr);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("Address updated successfully");
                    GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
                }
                else {
                    uiEnterTextPanel.setErrorMessage(`Address application failed.`);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("Address updated failed");
                }
                GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
            });
        }
        // change adrress
        else if (panelType == 1) {
            GameNetwork.getDefaultInstance().sendUpdateSolAddrReq(value, (gameUpdateSolAddr) => {
                if (gameUpdateSolAddr.suc) {
                    GameMainContext.getDefault().setTonAddress(gameUpdateSolAddr.updated_sol_addr);
                    UISettingTab.getDefaultInstance().setSolAdressLabel(gameUpdateSolAddr.updated_sol_addr);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("Address updated successfully");
                    GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
                }
                else {
                    uiEnterTextPanel.setErrorMessage(`Address application failed.`);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("Address updated failed");
                }
                GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
            });
        }
        // change nick
        else if (panelType == 1) {
            GameNetwork.getDefaultInstance().sendUpdateNickReq(value, (gameUpdateNickPacket) => {
                if (gameUpdateNickPacket.err_code == 0) {
                    GameMainContext.getDefault().setUserName(gameUpdateNickPacket.updated_nick);
                    UISettingTab.getDefaultInstance().setNicknameLabel(gameUpdateNickPacket.updated_nick);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("nickname updated successfully");
                    GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
                }
                else {
                    uiEnterTextPanel.setErrorMessage(`Nickname change failed - error code ${gameUpdateNickPacket.err_code}`);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("nickname updated failed");
                }
                GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
            });
        }
    }

    private onChangedValueEnterTextPanel(panelType: number, value: string) {
        let enterTextNode = GameUIManager.getDefaultInstance().get(UIType.ENTER_TEXT_PANEL);
        if (enterTextNode == null)
            return;

        const uiEnterTextPanel = enterTextNode.getComponent(UIEnterTextPanel);
        if (uiEnterTextPanel == null) {
            Logger.error(`dont get UIEnterTextPanel`);
            return;
        }

        let errorMessage = "";

        // change adress
        if (panelType == 0) {
            if (!this.isValidTonAddress(value))
                errorMessage = "Invalid address format";

            if (value.length <= 0)
                errorMessage = "No value provided. Please enter a valid address.";

            if (errorMessage.length <= 0) {
                if (value == GameMainContext.getDefault().initPacket.ton_addr)
                    errorMessage = "It is the same as the currently registered address.";
            }
        }
        // change adress
        else if (panelType == 1) {
            if (!this.isValidSolanaAddress(value))
                errorMessage = "Invalid address format";

            if (value.length <= 0)
                errorMessage = "No value provided. Please enter a valid address.";

            if (errorMessage.length <= 0) {
                if (value == GameMainContext.getDefault().initPacket.sol_addr)
                    errorMessage = "It is the same as the currently registered address.";
            }
        }
        // change nick
        else if (panelType == 2) {
            if (value.length <= 0)
                errorMessage = "No value provided. Please enter a valid nickname.";

            if (value.length <= 3)
                errorMessage = "Nickname must be at least three characters long.";

            if (errorMessage.length <= 0) {
                if (value == GameMainContext.getDefault().initPacket.nick)
                    errorMessage = "It is the same as the currently registered nickname.";
            }
        }



        // The apply button is enabled only if there is no error message.
        uiEnterTextPanel.setActiveApplyButton(errorMessage.length <= 0);
        uiEnterTextPanel.setErrorMessage(errorMessage);
    }

    private isValidTonAddress(address: string) {
        const tonAddressRegex = /^[A-Za-z0-9_-]{48}$/;
        if (!tonAddressRegex.test(address)) {
            return false;
        }
        return true;
    }

    private base58Decode(str: string): Uint8Array {
        const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        const alphabetMap: { [char: string]: number } = {};
        for (let i = 0; i < BASE58_ALPHABET.length; i++) {
            alphabetMap[BASE58_ALPHABET[i]] = i;
        }

        const bytes: number[] = [0];
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const value = alphabetMap[char];
            if (value === undefined) {
                throw new Error(`Invalid Base58 character: ${char}`);
            }

            for (let j = 0; j < bytes.length; j++) {
                bytes[j] *= 58;
            }

            bytes[0] += value;

            // Carry overflow
            for (let k = 0; k < bytes.length; k++) {
                if (bytes[k] > 255) {
                    if (k + 1 === bytes.length) {
                        bytes.push(0);
                    }
                    bytes[k + 1] += Math.floor(bytes[k] / 256);
                    bytes[k] %= 256;
                }
            }
        }

        // Deal with leading zeroes
        let numLeadingZeros = 0;
        for (let i = 0; i < str.length && str[i] === '1'; i++) {
            numLeadingZeros++;
        }

        const result = new Uint8Array(numLeadingZeros + bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            result[result.length - 1 - i] = bytes[i];
        }

        return result;
    }

    private isValidSolanaAddress(address: string): boolean {
        try {
            const decoded = this.base58Decode(address);
            return decoded.length === 32;
        } catch {
            return false;
        }
    }


    //#endregion
}

