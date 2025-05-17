import { ActorState, GameActorControl } from "../Actor/GameActorControl";
import { GameResultPacket } from "../Network/GamePacket";
import { GameNetwork } from "../Network/GameNetwork";
import { UIHud } from "../UI/UIHud";
import { GameMainContext } from "./GameMainContext";
import { GameState } from "./GameState";
import { GameStateManager } from "./GameStateManager";
import { GameUserBetState } from "../UserBetState/GameUserBetState";
import { GameRandom } from "../Utils/GameRandom";
import { GameAudioManger } from "./GameAudioManger";
import { Logger } from "../Common/GameCommon";
import { UIPath } from "../UI/UIPath";

enum CountDownStateType {
    RESULT_REQ = 0,
    FINISH,
}

export class GameCountDownState extends GameState {
    private remainTime: number = 0;
    private sendResultRemainTime: number = 4;
    private curState: CountDownStateType = CountDownStateType.RESULT_REQ;
    private isPlayedBGM = false;

    public onEnterState(remainTime: number): void {
        this.isPlayedBGM = false;
        this.remainTime = remainTime;
        GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_READY);
        const uiHud = UIHud.getDefaultInstance();

        const uiPath = UIPath.getDefaultInstance();
        uiPath.setHideAll();

        this.curState = CountDownStateType.RESULT_REQ;
        uiHud.uiAlaram.showStatusMessage(true, 1);

        GameUserBetState.getDefaultInstance().play(0, false);

        const random = new GameRandom();
        this.sendResultRemainTime = random.nextInRange(3, 4);
    }

    public onUpdate(deltaTime: number) {
        this.remainTime -= deltaTime;

        switch (this.curState) {
            case CountDownStateType.RESULT_REQ:
                this.curState = CountDownStateType.FINISH;                
                break;
        }

        if (this.remainTime > 0) {
            const remainingTime = Math.floor(this.remainTime + 1);
            const value = "Ready " + remainingTime.toString();

            const uiHud = UIHud.getDefaultInstance();
            uiHud.uiAlaram.setWaitAlarmRemainTime(this.remainTime);

            if (this.isPlayedBGM == false && this.remainTime <= 6) {
                this.isPlayedBGM = true;
                if (GameAudioManger.getDefaultInstance() != null)
                    GameAudioManger.getDefaultInstance().playBGM(1, 6 - this.remainTime);
            }
        }
    }

    public onCloseState(): void {

    }
}