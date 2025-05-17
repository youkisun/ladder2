import { _decorator } from "cc";
import { Actor, ActorTypeInt } from "../Actor/Actor";
import { Default, DefaultComponent } from "../Utils/GameUtils";
import { PathMaker } from "../Path/PathMaker";
import { GameMainContext } from "../Main/GameMainContext";
import { UIPath } from "../UI/UIPath";
import { GameAudioManger } from "../Main/GameAudioManger";

const { ccclass, property } = _decorator;

export class ActorState {
    public static ACTOR_STATE_NONE = 0;
    public static ACTOR_STATE_READY = 1;
    public static ACTOR_STATE_MOVE = 2;
    public static ACTOR_STATE_ARRIVE = 3;
    public static ACTOR_STATE_FINISH = 4;
}

/**
 * Game play control
 */
@ccclass("GameActorControl")
export class GameActorControl extends DefaultComponent<GameActorControl> {
    
    @property({ type: [Actor] })
    public leftActor : Actor;

    @property({ type: [Actor] })
    public rightActor : Actor;
    

    private _actorState: number = ActorState.ACTOR_STATE_NONE;

    public getState() : number
    {
        return this._actorState;
    }

    protected onLoad() {
        super.onLoad();
    }

    public SetActorState(actorState: number, selectActor: number = 0, elapsedTime: number = 0) 
    {
        this._actorState = actorState;
        const pathMaker = PathMaker.getDefaultInstance();

        if (actorState === ActorState.ACTOR_STATE_READY) {
            const { success, leftStartPos, rightStartPos } = pathMaker.tryGetStartPosition();
            if (success) {
                this.leftActor.playAnimation(0);
                this.leftActor.actorTransform.setStartPosition(leftStartPos);
                this.rightActor.playAnimation(0);
                this.rightActor.actorTransform.setStartPosition(rightStartPos);
            }
        } else if (actorState === ActorState.ACTOR_STATE_MOVE) {

            this.leftActor.playAnimation(1);
            this.rightActor.playAnimation(1);

            if (selectActor === 0) {
                const { success, positions: leftPositions } = pathMaker.tryGetPath(0); // 0 for left
                if (success) {
                    this.leftActor.actorTransform.setPath(leftPositions);
                    this.leftActor.actorTransform.setElapsedTime(elapsedTime);
                }
            } else {
                const { success, positions: rightPositions } = pathMaker.tryGetPath(1); // 1 for right
                if (success) {
                    this.rightActor.actorTransform.setPath(rightPositions);
                    this.rightActor.actorTransform.setElapsedTime(elapsedTime);
                }
            }
            
        } else if (actorState === ActorState.ACTOR_STATE_ARRIVE) {
            this.leftActor.playAnimation(GameMainContext.getDefault().resultContext.winActor == 1 ? 2 : 3);
            this.rightActor.playAnimation(GameMainContext.getDefault().resultContext.winActor == 2 ? 2 : 3);

            this.leftActor.SetSelectedActorImage(false);
            this.rightActor.SetSelectedActorImage(false);

            
        } 
        else if (actorState === ActorState.ACTOR_STATE_FINISH) {
            
        }
    }

    update(deltaTime: number) {
        if (this._actorState === ActorState.ACTOR_STATE_MOVE) {
            const rightActor = this.rightActor.actorTransform.updatePlayMove();
            const leftActor = this.leftActor.actorTransform.updatePlayMove();
            if( rightActor && leftActor )
            {
                this.SetActorState(ActorState.ACTOR_STATE_ARRIVE);
                GameAudioManger.getDefaultInstance().stopSound("walk");
                const uiPath = UIPath.getDefaultInstance();
                uiPath.showResultCoin(true, GameMainContext.getDefault().resultContext.winResultPos, 1);
            }
        }
    }
}


