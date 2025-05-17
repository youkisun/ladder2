
export abstract class GameState {
    protected _curRemainTime: number = 0;

    public abstract onEnterState(remainTime: number): void;
    public abstract onCloseState(): void;
    public abstract onUpdate(deltaTime: number);
}