import { ActorState, GameActorControl } from "../Actor/GameActorControl";
import { UIHud } from "../UI/UIHud";
import { UIPath } from "../UI/UIPath";
import { GameMainContext } from "./GameMainContext";
import { GameState } from "./GameState";
import { GameStateManager } from "./GameStateManager";
import { GameUserBetState } from "../UserBetState/GameUserBetState";
import { UISelectActorAlarmTab } from "../UI/UISelectActorAlarmTab";
import { GameBettingControl } from "./GameBettingControl";
import { GameAudioManger } from "./GameAudioManger";
import { UIPopup } from "../UI/UIPopup";
import { GameCommon } from "../Common/GameCommon";
import { director } from "cc";
import { GameUIManager, UIType } from "./GameUIManager";



export class GameBettingState extends GameState {
    private isInit: boolean = false;
    private remainTimeTick: number = 0;

    public onEnterState(remainTime: number): void {

        const uiPath = UIPath.getDefaultInstance();
        uiPath.setHideAll();

        GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_READY);

        const uiHud = UIHud.getDefaultInstance();
        uiHud.uiAlaram.showStatusMessage(true, 0);

        this.remainTimeTick = remainTime;
        uiHud.setShowWaitPopup(false);
        GameBettingControl.getDefaultInstance().show();

        GameUserBetState.getDefaultInstance().play(remainTime, true);

        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().playBGM(0);

        this.isInit = true;

        //if (GameMainContext.getDefault().airdropCredit <= 0) {

        //    const node = GameUIManager.getDefaultInstance().load(UIType.POPUP);
        //    if (node) {
        //        const uiPopup = node.getComponent(UIPopup);
        //        uiPopup.set("Daily airdrop credits used.\nTry again later", "Notice", false, true);
        //        uiPopup.onClickConfirmButtonEvent = this.onGotoLobby.bind(this);
        //    }
        //}
    }

    private onGotoLobby() {
        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().stopAll();
        director.loadScene("lobbyScene", (err, scene) => {
            if (err) {
                console.error("Failed to load scene:", err);
                return;
            }
            console.log("Scene loaded successfully:", scene);
        });
    }

    public onUpdate(deltaTime: number) {
        if (this.remainTimeTick > 0) {
            this.remainTimeTick -= deltaTime;
            const remainingTime = Math.floor(this.remainTimeTick + 1);
            const value = "Seconds left :" + remainingTime.toString();

            const uiHud = UIHud.getDefaultInstance();
            if (uiHud != null)
                uiHud.uiAlaram.setSelectActorAlarmRemainTime(this.remainTimeTick);
        }
    }

    public onCloseState(): void {
        this.isInit = false;

        if (UISelectActorAlarmTab.getDefaultInstance() != null)
            UISelectActorAlarmTab.getDefaultInstance().node.active = false;

        GameBettingControl.getDefaultInstance().hide();
    }
}