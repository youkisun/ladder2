import { ActorState, GameActorControl } from "../Actor/GameActorControl";
import { PathMaker } from "../Path/PathMaker";
import { UIHud } from "../UI/UIHud";
import { UIPath } from "../UI/UIPath";
import { GameAudioManger } from "./GameAudioManger";
import { GameMainContext, LadderContext } from "./GameMainContext";
import { GameState } from "./GameState";
import { GameStateManager } from "./GameStateManager";

enum PlayState {
    SHOW_LADDER_0 = 0,
    SHOW_LADDER_1,
    SHOW_LADDER_2,
    MOVE_ACTOR,
    FINISH,
}

export class GameplayState extends GameState 
{
    private curTick: number = 0;
    private playState: PlayState = PlayState.FINISH;
    
    public onEnterState(remainTime: number): void {
        const uiHud = UIHud.getDefaultInstance();
        
        this.curTick = -1;
        const mainContext = GameMainContext.getDefault();

        uiHud.uiAlaram.showStatusMessage(true, 2);

        GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_READY);

        const curGameNo = GameStateManager.getDefaultInstance().getCurrentGameNo();
        
        if(mainContext.resultContext.gameNo != curGameNo)
        {            
            uiHud.setShowWaitPopup(true);
            this.playState = PlayState.FINISH;
            //GameActorControl.getDefaultInstance().PepeActor.actorTransform.setFinishPosition(0);
            //GameActorControl.getDefaultInstance().DogeActor.actorTransform.setFinishPosition(1);

            //GameStateManager.getDefaultInstance().onCheckSendResultReq();
        }      
        else
        {
            uiHud.setShowWaitPopup(false);
            this.playState = PlayState.SHOW_LADDER_0;
            this.curTick = GameStateManager.getDefaultInstance().PLAY_TIME - remainTime;
        }
    }

    public onUpdate(deltaTime: number) {
        if(this.curTick == -1)
            return;

        this.curTick += deltaTime;

        switch (this.playState) {
            case PlayState.SHOW_LADDER_0:
                if (this.curTick > 1.5) {
                    const uiPath = UIPath.getDefaultInstance();
                    uiPath.showResultCoin(true, GameMainContext.getDefault().resultContext.winResultPos);
                    
                    UIHud.getDefaultInstance().uiAlaram.showStatusMessage(false);
                    this.playState = PlayState.SHOW_LADDER_1;
                    PathMaker.getDefaultInstance().setPath(0, GameMainContext.getDefault().resultContext.pathFlags[0]);
                }
                break;

            case PlayState.SHOW_LADDER_1:
                if (this.curTick > 2.5) {
                    this.playState = PlayState.SHOW_LADDER_2;
                    PathMaker.getDefaultInstance().setPath(1, GameMainContext.getDefault().resultContext.pathFlags[1]);
                }
                break;

            case PlayState.SHOW_LADDER_2:
                if (this.curTick > 3.5) {
                    this.playState = PlayState.MOVE_ACTOR;
                    PathMaker.getDefaultInstance().setPath(2, GameMainContext.getDefault().resultContext.pathFlags[2]);
                }
                break;

            case PlayState.MOVE_ACTOR:
                if (this.curTick > 4.5) {
                    if (GameAudioManger.getDefaultInstance() != null)
                        GameAudioManger.getDefaultInstance().playSound("walk", true);
                    this.playState = PlayState.FINISH;
                    GameMainContext.getDefault().resultContext.isWin = GameMainContext.getDefault().betActor == GameMainContext.getDefault().resultContext.winActor;
                    GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_MOVE, 0, this.curTick - 4.5);
                    GameActorControl.getDefaultInstance().SetActorState(ActorState.ACTOR_STATE_MOVE, 1, this.curTick - 4.5);

                    
                }
                break;

            default:
                break;
            }
    }

    public onCloseState(): void {        
        if (GameAudioManger.getDefaultInstance() != null)
            GameAudioManger.getDefaultInstance().stopSound("walk");
        UIHud.getDefaultInstance().uiAlaram.showBetMessage(false);
    }
}