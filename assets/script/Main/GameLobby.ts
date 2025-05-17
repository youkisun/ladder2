import { _decorator, Component, director, Node } from 'cc';
import { UILobby } from '../UI/UILobby';
import { GameNetwork } from '../Network/GameNetwork';
import { GameCommon } from '../Common/GameCommon';
import { GameUIManager, UIType } from './GameUIManager';
import { UIPopup } from '../UI/UIPopup';
import { GameMainContext } from './GameMainContext';
const { ccclass, property } = _decorator;

@ccclass('GameLobby')
export class GameLobby extends Component {

    @property(UILobby)
    private uiLobby: UILobby;

    private timeUpdateCallback: () => void;

    static isInit: boolean = false;

    protected onLoad(): void {
        GameMainContext.getDefault().isInGameMode = false;
    }

    start() {

        this.uiLobby.onClickTabButtonEvent = this.onClickTabButtonEvent.bind(this);
        this.uiLobby.onClickPlayMemeRunButton = this.onClickMemeRunButtonEvent.bind(this);
        this.uiLobby.onClickPlayMemeRunDisableButton = this.onClickMemeRunDisableButtonEvent.bind(this);
        this.uiLobby.onClickMemeNewGameButtonEvent = this.onClickMemeNewGameButtonEvent.bind(this);

        this.uiLobby.setActiveMemeRunButton(GameMainContext.getDefault().initPacket.air_cnt > 0);

        if(GameLobby.isInit == false)
        {
            GameNetwork.getDefaultInstance().sendReqInitReq((initLobbyPacket) => {
                this.uiLobby.setActiveMemeRunButton(initLobbyPacket.air_cnt > 0);            
            });
            GameLobby.isInit = true;
        }
        else
        {
            this.uiLobby.setActiveMemeRunButton(GameMainContext.getDefault().airdropCredit > 0);
        }
        

        //this.schedule(this.onSendReqKeepAlive, 240);
    }

    private onClickTabButtonEvent(index: number) {

    }

    private onClickMemeRunButtonEvent() {
        director.loadScene("loadingMemeRun", (err, scene) => {
            if (err) {
                console.error("Failed to load scene:", err);
                return;
            }
            console.log("Scene loaded successfully:", scene);
        });
    }

    private onClickMemeNewGameButtonEvent() {
        const node = GameUIManager.getDefaultInstance().load(UIType.POPUP);
        if (node) {
            const uiPopup = node.getComponent(UIPopup);
            uiPopup.set("comming soon", "Notice", false, true);
            uiPopup.onClickConfirmButtonEvent = () => { GameUIManager.getDefaultInstance().hide(UIType.POPUP); };            
        }
    }

    private onClickMemeRunDisableButtonEvent() {
        const node = GameUIManager.getDefaultInstance().load(UIType.POPUP);
        if (node) {
            const uiPopup = node.getComponent(UIPopup);
    
            uiPopup.set("", "Notice", false, true);
            uiPopup.desc2RedLabel.node.active = true;
    
            
            this.timeUpdateCallback = () => {
                const now = new Date();
                const nextUtcMidnight = new Date(Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate() + 1, // next day
                    0, 0, 0, 0
                ));
    
                const diffMs = nextUtcMidnight.getTime() - now.getTime();
                const totalSeconds = Math.floor(diffMs / 1000);
    
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
    
                uiPopup.descLabel.string = `Next Airdrop in\n\n`;
                uiPopup.desc2RedLabel.string = `${hours}h ${minutes}m ${seconds}s\n\n\n`;
            };
    
            // Start updating every second.
            this.schedule(this.timeUpdateCallback, 1);
    
            // Stop updating and close the popup when the confirm button is clicked
            uiPopup.onClickConfirmButtonEvent = () => {
                this.unschedule(this.timeUpdateCallback); // stop
                GameUIManager.getDefaultInstance().hide(UIType.POPUP); // close popup
            };
    
            // "Update immediately on the first execution
            this.timeUpdateCallback();
        }
    }

    private onSendReqKeepAlive() {
        GameNetwork.getDefaultInstance().sendReqKeepAliveReq((r) => { });
    }


}


