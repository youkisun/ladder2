import { _decorator, Button, Component, Enum, Label, Node, ProgressBar, Sprite, Tween, UITransform, Vec3, Widget } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
import { UIShortAlarm } from './UIShortAlarm';
import { UIHud } from './UIHud';
import { GameAudioManger } from '../Main/GameAudioManger';
import { Logger } from '../Common/GameCommon';
import { GameNetwork } from '../Network/GameNetwork';
import { GameSystemFile } from '../Utils/GameSystemFile';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { UIEnterTextPanel } from './UIEnterTextPanel';
import { UIPopup } from './UIPopup';
const { ccclass, property } = _decorator;

export enum MissionType {
    GAME_WIN_COUNT = 0,
    GAME_PLAY_COUNT = 1,
    GAME_INVITE_FRIENDS = 2,
    GAME_X_SHARE = 3,
    GAME_TELEGRAM_SHARE = 4,
}

export class MissionContext {

    private uiMissionItem: UIMissionItem;
    private missionType: MissionType;

    private subscribeTelegramTimeout: number | null = null;
    private subscribeXTimeout: number | null = null;

    private xAccountChangedCount: number = 0;

    private curStatus: number = 0;

    private setCurStatus(value: number, isShowAlaram: boolean = false) {
        this.curStatus = value;

        this.uiMissionItem.stopScaleAnimSubscribeButton();

        if (value == 0) {
            this.uiMissionItem.setSubscribeDescLabel("Go");
            this.uiMissionItem.setActiveSubscribeButton(true);
        }
        else if (value == 1) {
            this.uiMissionItem.setSubscribeDescLabel("Claim");
            this.uiMissionItem.setActiveSubscribeButton(true);
            this.uiMissionItem.playScaleAnimSubscribeButton();
        }
        else if (value == 2) {
            this.uiMissionItem.setActiveSubscribeButton(false);
            this.uiMissionItem.setSubscribeDescLabel("Claimed");

            if (isShowAlaram)
                UIShortAlarm.getDefaultInstance().showShortAlarm("Mission Reward x 3");
        }

    }

    public set(uiMissionItem: UIMissionItem) {
        this.uiMissionItem = uiMissionItem;
        let mainContext = GameMainContext.getDefault();
        let rewardPoint = -1;
        let targetCount = -1;
        //let curPercent = 100;
        let curCount = 0;
        let rewardPointStr = "";
        let curMissionDescStr = "";
        let missionTargetCountStr = "";

        this.missionType = uiMissionItem.missionType;

        if (this.missionType == MissionType.GAME_WIN_COUNT) {

            let totalWins = mainContext.initPacket.total_wins % 30;
            // for (let i = 0; i < this.wins_R_Win_count.length; i++) {
            //     if(this.wins_R_Win_count[i] > totalWins)
            //     {
            //         rewardPoint = this.wins_R_Win_reward_point[i];
            //         targetCount = this.wins_R_Win_count[i];
            //         break;
            //     }
            // }

            rewardPoint = 1;
            targetCount = 30;

            if (rewardPoint == -1) {
                rewardPointStr = "MAX";
                curMissionDescStr = `Total Wins achieved: ${totalWins}`;
                missionTargetCountStr = "Target Wins: MAX";
            }
            else {
                rewardPointStr = rewardPoint.toString();
                curMissionDescStr = `Total Wins achieved: ${totalWins}`;
                missionTargetCountStr = `Target Wins: ${targetCount}`;

                //curPercent = totalWins / targetCount;
                curCount = totalWins;
            }


        }
        else if (this.missionType == MissionType.GAME_PLAY_COUNT) {

            let totalPlays = mainContext.initPacket.total_games % 30;
            // for (let i = 0; i < this.wins_R_Play_count.length; i++) {
            //     if(this.wins_R_Play_count[i] > totalPlays)
            //     {
            //         rewardPoint = this.wins_R_Play_reward_Point[i];
            //         targetCount = this.wins_R_Play_count[i];
            //         break;
            //     }
            // }

            rewardPoint = 1;
            targetCount = 30;

            if (rewardPoint == -1) {
                rewardPointStr = "MAX";
                curMissionDescStr = `Total Game achieved: ${totalPlays}`;
                missionTargetCountStr = "Target Game: MAX";
            }
            else {
                rewardPointStr = rewardPoint.toString();
                curMissionDescStr = `Total Game achieved: ${totalPlays}`;
                missionTargetCountStr = `Target Game: ${targetCount}`;

                //curPercent = totalPlays / targetCount;
                curCount = totalPlays;
            }
        }
        else if (this.missionType == MissionType.GAME_INVITE_FRIENDS) {
            uiMissionItem.onClickCopyLinkEvent = this.onClickCopyLinkEvent.bind(this);
            uiMissionItem.onClickShareLinkEvent = this.onClickShareLinkEvent.bind(this);

            let refer_cnt = mainContext.initPacket.refer_cnt;
            rewardPointStr = "1";
            curMissionDescStr = `Invited Friends: ${refer_cnt}`;
            missionTargetCountStr = `Earned Run points: ${refer_cnt * 100}`;
        }
        else if (this.missionType == MissionType.GAME_TELEGRAM_SHARE) {

            if (GameMainContext.getDefault().initPacket.mi_tel_run > 0) {
                this.setCurStatus(2);
            }
            else {
                uiMissionItem.onClickSubscribeEvent = this.onClickSubscribeTelegram.bind(this);
                this.setCurStatus(0);
            }

        }
        else if (this.missionType == MissionType.GAME_X_SHARE) {

            uiMissionItem.onClickXAccountPopupEvent = this.onXAccountPopup.bind(this);
            uiMissionItem.onClickSubscribeEvent = this.onClickSubscribeX.bind(this);
            uiMissionItem.xAccountPopupButton.node.active = false;

            if (GameMainContext.getDefault().initPacket.mi_x_run <= 0 &&
                GameMainContext.getDefault().initPacket.mi_x_account.length <= 0) {
                this.setCurStatus(0);
            }
            else if (GameMainContext.getDefault().initPacket.mi_x_run <= 0 &&
                GameMainContext.getDefault().initPacket.mi_x_account.length > 0) {
                this.setCurStatus(1);
            }
            else {
                this.setCurStatus(2);
                uiMissionItem.xAccountPopupButton.node.active = true;
            }
        }


        if (missionTargetCountStr.length > 0) {
            uiMissionItem.setRewardCount(rewardPointStr);
            uiMissionItem.setCurMissionDescLabel(curMissionDescStr);
            uiMissionItem.setMissionDescLabel(missionTargetCountStr);
            uiMissionItem.setPercent(curCount);
        }

    }

    private onClickCopyLinkEvent() {
        UIShortAlarm.getDefaultInstance().showShortAlarm("The invitation address has been copied");
        let telegram_id = GameMainContext.getDefault().initPacket.t_id;
        const linkToShare = `${GameSystemFile.getLinkToShare()}?startapp=${telegram_id}`;

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(linkToShare)
                .then(() => {
                    Logger.log("The link has been copied to the clipboard!");
                })
                .catch((err) => {
                    Logger.error("Clipboard copy failed:", err);
                });
        } else {

            const textarea = document.createElement('textarea');
            textarea.value = linkToShare;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                Logger.log("The link has been copied to the clipboard");
            } catch (err) {
                Logger.error("Clipboard copy failed:", err);
            }
            document.body.removeChild(textarea);
        }
    }

    private onClickShareLinkEvent() {
        const tg = Telegram.WebApp;
        let telegram_id = GameMainContext.getDefault().initPacket.t_id;
        const linkToShare = `${GameSystemFile.getLinkToShare()}?startapp=${telegram_id}`;

        if (typeof tg !== 'undefined') {
            tg.openTelegramLink(`http://t.me/share/url?url=${linkToShare}`);
        } else {
            UIHud.getDefaultInstance().setErrorMessageLabel("tg library is not available in this environment.");
            Logger.log("tg library is not available in this environment.");
        }
    }

    private onClickSubscribeTelegram() {
        this.uiMissionItem.setActiveSubscribeButton(false);
        if (this.curStatus == 0) {

            const tg = Telegram.WebApp;
            this.subscribeTelegramTimeout = window.setTimeout(() => {
                this.uiMissionItem.setActiveSubscribeButton(true);
                this.subscribeTelegramTimeout = null;
            }, 1000);

            if (typeof tg !== 'undefined') {
                this.setCurStatus(1);
                tg.openTelegramLink(GameSystemFile.getLinkTelegram());
            } else {
                // tg 객체가 없는 경우 대체 처리
                UIHud.getDefaultInstance().setErrorMessageLabel("tg library is not available in this environment.");
                Logger.log("tg library is not available in this environment.");
            }
        }
        else if (this.curStatus == 1) {
            GameNetwork.getDefaultInstance().sendCompMissionReq(101, (compMissionRes) => {
                if (compMissionRes.err_code == 0) {
                    GameMainContext.getDefault().setRoulettePoint(compMissionRes.ret_roulette_points);
                    this.setCurStatus(2, true);
                    GameMainContext.getDefault().initPacket.mi_tel_run = 1;
                } else {
                    this.setCurStatus(1);
                }
            });
        }
    }

    private onClickSubscribeX() {

        if (this.curStatus == 0) {
            this.onXAccountPopup();
        }
        else if (this.curStatus == 1) {
            this.onProcessSubscribeX();
        }
    }

    private onProcessSubscribeX() {
        this.uiMissionItem.setSubscribeDescLabel("Processing");
        this.uiMissionItem.setActiveSubscribeButton(false);

        GameNetwork.getDefaultInstance().sendCompMissionReq(102, (compMissionRes) => {
            if (compMissionRes.err_code == 0) {
                GameMainContext.getDefault().setRoulettePoint(compMissionRes.ret_roulette_points);
                this.setCurStatus(2, true);
                GameMainContext.getDefault().initPacket.mi_x_run = 1;
                this.uiMissionItem.xAccountPopupButton.node.active = true;
            } else {
                this.setCurStatus(1);
            }
        });
        this.subscribeXTimeout = null;

    }

    private onXAccountPopup() {
        GameAudioManger.getDefaultInstance().playSound("button");
        const node = GameUIManager.getDefaultInstance().load(UIType.ENTER_TEXT_PANEL);
        if (node) {
            const uiEnterTextPanel = node.getComponent(UIEnterTextPanel);
            uiEnterTextPanel.setType(3);
            uiEnterTextPanel.onChangedValue = this.onChangedValueEnterTextPanel.bind(this);
            uiEnterTextPanel.onApplyValue = this.onApplyValueEnterTextPanel.bind(this);
        }
    }

    public OnDisable() {
        if (this.subscribeTelegramTimeout !== null) {
            clearTimeout(this.subscribeTelegramTimeout);
            this.subscribeTelegramTimeout = null;
            Logger.log("subscribeTelegramTimeout has been canceled.");
        }

        if (this.subscribeXTimeout !== null) {
            clearTimeout(this.subscribeXTimeout);
            this.subscribeXTimeout = null;
            Logger.log("[TEST0] subscribeXTimeout has been canceled");
        }
    }

    private onApplyValueEnterTextPanel(panelType: number, value: string) {

        let isMessage = false;
        this.xAccountChangedCount++;

        if (this.xAccountChangedCount > 5) {
            this.xAccountChangedCount = 5;
            isMessage = true;
        }

        if (isMessage) {
            UIShortAlarm.getDefaultInstance().showShortAlarm("Please try again later.");
            return;
        }

        let enterTextNode = GameUIManager.getDefaultInstance().get(UIType.ENTER_TEXT_PANEL);
        if (enterTextNode == null)
            return;

        const uiEnterTextPanel = enterTextNode.getComponent(UIEnterTextPanel);
        if (uiEnterTextPanel == null) {
            Logger.error(`dont get UIEnterTextPanel`);
            return;
        }

        uiEnterTextPanel.setActiveApplyButton(false);

        if (panelType == 3) {
            // @ ts-ignore
            if (value.startsWith('@')) {
                value = value.slice(1);
            }

            GameNetwork.getDefaultInstance().sendUpdateXAccountReq(value, (gameUpdateXAccount) => {
                if (gameUpdateXAccount.suc) {
                    UIShortAlarm.getDefaultInstance().showShortAlarm("X Account updated successfully");
                    GameUIManager.getDefaultInstance().hide(UIType.ENTER_TEXT_PANEL);
                    GameMainContext.getDefault().initPacket.mi_x_account = gameUpdateXAccount.updated_x_account;

                    if (this.curStatus == 0) {
                        this.setCurStatus(1);
                        //this.onProcessSubscribeX();
                        
                        const node = GameUIManager.getDefaultInstance().load(UIType.POPUP);
                        if (node) {
                            const uiPopup = node.getComponent(UIPopup);
                            uiPopup.set("Click the Meme Run X link to complete your subscription.", "Notice", false, true);
                            uiPopup.onClickConfirmButtonEvent = () => 
                                { 
                                    window.open(GameSystemFile.getLinkX(), "_blank");
                                    GameUIManager.getDefaultInstance().hide(UIType.POPUP); 
                                };
                        }
                    }
                }
                else {
                    uiEnterTextPanel.setErrorMessage(`X Account application failed.`);
                    UIShortAlarm.getDefaultInstance().showShortAlarm("X Account updated failed");
                    this.setCurStatus(0);
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

        if (panelType == 3) {

            if (value.startsWith('@')) {
                value = value.slice(1);
            }

            if (!this.isValidXAccount(value))
                errorMessage = "Invalid X account format";

            if (value.length <= 0)
                errorMessage = "No value provided. Please enter a valid x account.";

            if (value.length <= 3)
                errorMessage = "x account must be at least three characters long.";

            if (errorMessage.length <= 0) {
                if (value == GameMainContext.getDefault().initPacket.mi_x_account) {
                    errorMessage = "It is the same as the currently registered x account.";
                }
            }
        }

        // // The apply button is enabled only if there is no error message.
        uiEnterTextPanel.setActiveApplyButton(errorMessage.length <= 0);
        uiEnterTextPanel.setErrorMessage(errorMessage);
    }

    private isValidXAccount(x_account: string): boolean {
        if (x_account === null || x_account === undefined) {
            return false;
        }

        if (typeof x_account !== 'string') {
            return false;
        }

        // Length check (excluding the leading '@')
        const checkValue = x_account.startsWith('@') ? x_account.slice(1) : x_account;

        if (checkValue.length < 4 || checkValue.length > 15) {
            return false;
        }

        // Only allow valid characters (excluding the leading '@')
        const allowedChars = /^[a-zA-Z0-9_]+$/;
        if (!allowedChars.test(checkValue)) {
            return false;
        }

        return true;
    }

}



interface TelegramWebApp {
    initData: string;
    initDataUnsafe: any;
    close: () => void;
    showAlert: (message: string) => void;
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
    openTelegramLink: (url: string) => void;
    sendData: (data: string) => void;
}

interface TelegramNamespace {
    WebApp: TelegramWebApp;
}

// Declare global objects (supports mobile & desktop web)
declare const Telegram: TelegramNamespace;

declare global {
    interface Window {
        Telegram: TelegramNamespace;
    }
}

export { };


@ccclass('UIMissionItem')
export class UIMissionItem extends Component {
    @property({ type: Enum(MissionType) })
    public missionType: MissionType;

    @property(Label)
    private rewardCountLabel: Label;

    @property(Label)
    private curMisionDescLabel: Label;

    @property(Label)
    private misionDescLabel: Label;

    @property(ProgressBar)
    private progressBar: ProgressBar;

    @property(Label)
    private missionPercentLabel: Label;

    @property(Button)
    private copyLinkButton: Button;

    @property(Button)
    private shareLinkButton: Button;

    @property(Button)
    private subscribeButton: Button;

    @property(Button)
    public xAccountPopupButton: Button;

    @property(Label)
    private subscribeButtonTitleLabel: Label;

    public onClickCopyLinkEvent: () => void;
    public onClickShareLinkEvent: () => void;
    public onClickSubscribeEvent: () => void;
    public onClickXAccountPopupEvent: () => void;

    private missionContext: MissionContext;

    onLoad() {
        this.missionContext = new MissionContext();

        if (this.xAccountPopupButton != null)
            this.xAccountPopupButton.node.active = false;

        if (this.copyLinkButton != null) {
            this.copyLinkButton.node.on(Button.EventType.CLICK, () => {
                GameAudioManger.getDefaultInstance().playSound("button");
                if (this.onClickCopyLinkEvent != null)
                    this.onClickCopyLinkEvent();
            }, this);
        }

        if (this.shareLinkButton != null) {
            this.shareLinkButton.node.on(Button.EventType.CLICK, () => {
                GameAudioManger.getDefaultInstance().playSound("button");
                if (this.onClickShareLinkEvent != null)
                    this.onClickShareLinkEvent();
            }, this);
        }

        if (this.subscribeButton != null) {
            this.subscribeButton.node.on(Button.EventType.CLICK, () => {
                GameAudioManger.getDefaultInstance().playSound("button");
                if (this.onClickSubscribeEvent != null)
                    this.onClickSubscribeEvent();
            }, this);
        }

        if (this.xAccountPopupButton != null) {
            this.xAccountPopupButton.node.on(Button.EventType.CLICK, () => {
                GameAudioManger.getDefaultInstance().playSound("button");
                if (this.onClickXAccountPopupEvent != null)
                    this.onClickXAccountPopupEvent();
            }, this);
        }

    }

    protected onEnable(): void {
        this.missionContext.set(this);
    }

    protected onDisable(): void {
        if (this.missionContext != null)
            this.missionContext.OnDisable();
    }

    public setRewardCount(value: string) {
        this.rewardCountLabel.string = `x${value}`;
    }

    public setCurMissionDescLabel(value: string) {
        this.curMisionDescLabel.string = value;
    }

    public setMissionDescLabel(value: string) {
        this.misionDescLabel.string = value;
    }

    public setSubscribeDescLabel(value: string) {
        this.subscribeButtonTitleLabel.string = value;
    }

    public getSubscribeDescLabel() {
        return this.subscribeButtonTitleLabel.string;
    }

    public setActiveSubscribeButton(value: boolean) {
        this.subscribeButton.interactable = value;
    }

    public playScaleAnimSubscribeButton() {
        if (this.subscribeButton != null) {
            this.scaleUpAndDown(this.subscribeButton.node);
        }
    }

    public stopScaleAnimSubscribeButton() {
        if (this.subscribeButton != null) {
            Tween.stopAllByTarget(this.subscribeButton.node);
            this.subscribeButton.node.setScale(1, 1, 1);
        }
    }

    public setPercent(value: number) {
        const max = 30;
        const displayValue = value >= max ? 0 : value;
        if (this.progressBar != null)
            this.progressBar.progress = value / max; // Convert to a value between 0 and 1
        this.missionPercentLabel.string = `${displayValue}/${max}`;
    }

    scaleUpAndDown(target: Node) {
        const originalScale = new Vec3(1, 1, 1);
        const enlargedScale = new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z * 1.2);

        Tween.stopAllByTarget(target); // Stop Tween
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
            .union()
            .repeatForever()
            .start();
    }
}


