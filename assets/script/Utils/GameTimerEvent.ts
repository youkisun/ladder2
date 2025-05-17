import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameTimerEventAttribute')
class GameTimerEventAttribute {
    private onUpdate: ((elapsed: number, duration: number) => void) | null = null;
    private onFinishReturn: ((params: any[]) => void) | null = null;
    private onFinish: (() => void) | null = null;

    private paramArray: any[] | null = null;
    private targetTime = 0.0;

    private curTime = 0.0;
    

    private isSetCheckValidObj = false;
    private checkValidObj: Node | null = null;
    public uniqueObj: Node | null = null;
    public hashKey = '';
    public isRemove = false;

    public get CheckValidObj(): Node | null {
        return this.checkValidObj;
    }

    public set CheckValidObj(value: Node | null) {
        this.isSetCheckValidObj = value !== null;
        this.checkValidObj = value;
    }

    public reset(): void {
        this.onUpdate = null;
        this.onFinishReturn = null;
        this.onFinish = null;

        this.targetTime = 0.0;
        this.curTime = 0.0;
        this.paramArray = null;
        this.hashKey = '';

        this.isRemove = false;
        this.uniqueObj = null;
        this.CheckValidObj = null;
    }

    public setParams(...paramArray: any[]): void {
        this.paramArray = paramArray;
    }

    public play(
        startTime: number,
        targetTime: number,
        onUpdate: (elapsed: number, duration: number) => void,
        onFinish?: (() => void) | ((params: any[]) => void)
    ): void {
        this.curTime = startTime;
        this.targetTime = targetTime;
        this.onUpdate = onUpdate;

        if (typeof onFinish === 'function') {
            if (onFinish.length > 0) {
                this.onFinishReturn = onFinish as (params: any[]) => void;
                this.onFinish = null;
            } else {
                this.onFinish = onFinish as () => void;
                this.onFinishReturn = null;
            }
        }

        this.isRemove = false;        
    }

    public updateTime(deltaTime :number): void {        
        this.curTime += deltaTime;

        if (this.curTime >= this.targetTime) {
            this.isRemove = true;
            this.finishEvent();
            return;
        }

        if (this.onUpdate) {
            if (!this.isSetCheckValidObj || this.checkValidObj !== null) {
                this.onUpdate(this.curTime, this.targetTime);
            } else {
                this.isRemove = true;
            }
        }
    }

    public finishEvent(): void {
        if (!this.isSetCheckValidObj || this.checkValidObj !== null) {
            if (this.onFinishReturn) {
                this.onFinishReturn(this.paramArray || []);
            } else if (this.onFinish) {
                this.onFinish();
            }
        }
    }
}

@ccclass('GameTimerEvent')
export class GameTimerEvent {
    private static lstTimers: GameTimerEventAttribute[] = [];
    private static TimerAttriPool: GameTimerEventAttribute[] = [];

    public static clearVariables(): void {
        this.lstTimers = [];
        this.TimerAttriPool = [];
    }

    public static clear(): void {
        for (const timer of this.lstTimers) {
            this.TimerAttriPool.push(timer);
        }
        this.lstTimers = [];
    }

    public static play(
        hashCode: string,
        startTime: number,
        targetTime: number,
        onUpdate: (elapsed: number, duration: number) => void,
        onFinish?: (() => void) | ((params: any[]) => void)
    ): GameTimerEventAttribute {
        let timerAttri = this.lstTimers.find((t) => t.hashKey === hashCode);

        if (!timerAttri) {
            timerAttri = this.TimerAttriPool.pop() || new GameTimerEventAttribute();
            timerAttri.reset();
            timerAttri.hashKey = hashCode;
            this.lstTimers.push(timerAttri);
        }

        timerAttri.play(startTime, targetTime, onUpdate, onFinish);
        return timerAttri;
    }

    public static update(deltaTime :number): void {
        for (let i = this.lstTimers.length - 1; i >= 0; i--) {
            const timer = this.lstTimers[i];
            if (timer.isRemove) {
                this.TimerAttriPool.push(timer);
                this.lstTimers.splice(i, 1);
            } else {
                timer.updateTime(deltaTime);
            }
        }
    }
}
