import { Logger } from "../Common/GameCommon";
import { GameResultPacket } from "../Network/GamePacket";
import { GameRandom } from "../Utils/GameRandom";
import { Default } from "../Utils/GameUtils";
import { GameMainContext } from "./GameMainContext";

export class GameResultContext extends Default<GameResultContext> {
    private _isWin: boolean = false;
    private _pathFlags: boolean[] = new Array(3).fill(false);
    private _winActor: number = 0;
    private _winResultPos: number = 0;
    private _isShowResultDirect: boolean = false;
    private _gameNo: number;

    private _leftResultPosIndex: number = 0;
    private _rightResultPosIndex: number = 0;

    public get isWin(): boolean {
        return this._isWin;
    }
    public set isWin(value: boolean) {
        this._isWin = value;
    }

    public get pathFlags(): boolean[] {
        return this._pathFlags;
    }
    public set pathFlags(value: boolean[]) {
        this._pathFlags = value;
    }

    public get winActor(): number {
        return this._winActor;
    }
    public set winActor(value: number) {
        this._winActor = value;
    }

    public get winResultPos(): number {
        return this._winResultPos;
    }
    public set winResultPos(value: number) {
        this._winResultPos = value;
    }

    public get isShowResultDirect(): boolean {
        return this._isShowResultDirect;
    }
    public set isShowResultDirect(value: boolean) {
        this._isShowResultDirect = value;
    }

    public get gameNo(): number {
        return this._gameNo;
    }
    public set gameNo(value: number) {
        this._gameNo = value;
    }

    public get leftResultPosIndex(): number {
        return this._leftResultPosIndex;
    }
    public set leftResultPosIndex(value: number) {
        this._leftResultPosIndex = value;
    }

    public get rightResultPosIndex(): number {
        return this._rightResultPosIndex;
    }
    public set rightResultPosIndex(value: number) {
        this._rightResultPosIndex = value;
    }

    public setPath(bridge_num: number) {
        this._pathFlags.fill(false);

        if (typeof this._gameNo === "undefined") {
            return;
        }

        let random = new GameRandom(this._gameNo.toString());

        if (bridge_num == 1) {
            const randomIndex = Math.floor(random.nextInRange(0, this._pathFlags.length - 1));
            this._pathFlags[randomIndex] = true;
        }
        else if (bridge_num == 2) {
            this._pathFlags = [false, false, false];

            let count = 0;
            while (count < 2) {
                let index = Math.floor(random.nextInRange(0, 2));
                if (!this._pathFlags[index]) {
                    this._pathFlags[index] = true;
                    count++;
                }
            }
        }
        else {
            this._pathFlags = [true, true, true];
        }
    }

    public clearRound() {
        this._isWin = false;
        this._winActor = 0;
    }

    public setOnResultPacket(resultPacket: GameResultPacket) {
        this._winActor = resultPacket.winner;
        this._winResultPos = resultPacket.side;
        this._isWin = resultPacket.winner == GameMainContext.getDefault().betActor;
        this._gameNo = resultPacket.game_no;
        this.setPath(resultPacket.bridge_num);

        Logger.log("SET WINNER :" + resultPacket.winner);
    }
}
