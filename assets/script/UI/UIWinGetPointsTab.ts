import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { GameMainContext } from '../Main/GameMainContext';
import { GameMissionNotiControl } from '../Main/GameMissionNotiControl';
import { CoinType, GameCoinMovingControl } from '../Common/GameCoinMovingControl';
import { GameCommon, Logger } from '../Common/GameCommon';
import { GameAudioManger } from '../Main/GameAudioManger';
import { GameAddCoinControl } from '../Main/GameAddCoinControl';
import { GameBonusRoulette } from '../BonusRoulette/GameBonusRoulette';
import { DefaultComponent } from '../Utils/GameUtils';

const { ccclass, property } = _decorator;

@ccclass('UIWinGetPointsTab')
export class UIWinGetPointsTab extends DefaultComponent<UIWinGetPointsTab> {

    //@property(Node)
    //private uiHudRouletteNode: Node = null;

    //@property(Node)
    //private uiHudTonNode: Node = null;

    @property(Node)
    private runPoints: Node = null;

    @property(Node)
    private getRunPointIcon: Node = null;

    @property(Label)
    private getRunPointLabel: Label = null;

    @property(Node)
    private roulettePoints: Node = null;

    @property(Node)
    private getRouletteIcon: Node = null;

    @property(Label)
    private getRoulettePointLabel: Label = null;

    private totalTonPoint: number;
    private getRoulettePoint: number;
    private totalRoulettePoint: number;
    private showRunPoints: number;
    private showRoulettePoints: number;

    private timeoutIds: number[] = [];

    private _isShowDirect: boolean = false;
    private _isCoinEffectPlay: boolean = false;
    private _isPlay: boolean = false;

    protected onLoad(): void {
        super.onLoad();
    }

    start() {
    }

    public play(isShowDirect: boolean): void {
        this._isPlay = true;
        // ���� Ÿ�̸� ����
        this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeoutIds = [];

        let mainContext = GameMainContext.getDefault();
        //let getTonPoint = (mainContext.betTonPoint * 2);
        //this.totalTonPoint = mainContext.tonPoint + getTonPoint;
        let getRunPoint = 10;

        this.runPoints.active = true;
        this.roulettePoints.active = false;

        // If the roulette UI is visible, hide the effects
        if (isShowDirect == false && GameBonusRoulette.getDefaultInstance() != null)
            isShowDirect = GameBonusRoulette.getDefaultInstance().isShow();

        this._isShowDirect = isShowDirect;
        const isVictory = true;

        this.getRoulettePoint = GameMissionNotiControl.getDefaultInstance().getWinRoulettePoints();
        this.totalRoulettePoint = this.getRoulettePoint + GameMainContext.getDefault().roulettePoint;

        if (isVictory) {

            mainContext.addRunPoint(10);
            mainContext.setRoulettePoint(this.totalRoulettePoint, true);
            mainContext.setTonPoint(this.totalTonPoint);


            if (isShowDirect) {
                this.getRunPointLabel.string = `+${getRunPoint.toFixed(1)}`;
                this.roulettePoints.active = this.getRoulettePoint > 0;
                let getRoulettePoint = GameMissionNotiControl.getDefaultInstance().getWinRoulettePoints();
                this.getRoulettePointLabel.string = `+${getRoulettePoint.toFixed(1)}`;

            } else {

                this._isCoinEffectPlay = true;
                GameAddCoinControl.getDefault().startAddRun(mainContext.runPoint);
                GameAddCoinControl.getDefault().startRoulette(GameMainContext.getDefault().roulettePoint);

                if (GameAudioManger.getDefaultInstance() != null)
                    GameAudioManger.getDefaultInstance().playSound("roulletPlay");
                //let loopCount = GameCommon.getTonCoinEffectCount(getTonPoint);
                let loopCount = getRunPoint;
                for (let i = 0; i < loopCount; i++) {
                    const timeoutId = setTimeout(() => {
                        GameCoinMovingControl.getDefaultInstance().pushItem(CoinType.RUN,
                            this.getRunPointIcon.getWorldPosition(),
                            () => { });
                    }, i * 100);
                    this.timeoutIds.push(timeoutId);
                }

                // ton coin point effect
                loopCount = getRunPoint * 10;
                this.showRunPoints = 0;

                Logger.log(`[POINT] coin point effect - loopCount : ${loopCount}, getRunPoint : ${getRunPoint}`);

                for (let i = 0; i < loopCount; i++) {
                    const timeoutId = setTimeout(() => {
                        if (this.node.active) {
                            this.showRunPoints += 0.1;
                            this.getRunPointLabel.string = `+${this.showRunPoints.toFixed(1)}`;

                            GameAddCoinControl.getDefault().updateAddRun(this.showRunPoints);

                            console.log(`this.showRunPoints:${this.showRunPoints}, getRunPoint:${getRunPoint}`);

                            if (this.showRunPoints >= getRunPoint - 0.1)
                            {
                                GameAddCoinControl.getDefault().hideAddRun();
                                this._isCoinEffectPlay = false;
                            }
                        }
                    }, i * 50);
                    this.timeoutIds.push(timeoutId);
                }

                // roulette point effect after 1 second
                const timeoutId = setTimeout(() => {
                    this.animateNode(this.getRunPointLabel.node);
                    this.showRoulettePoint();



                }, 1000);
                this.timeoutIds.push(timeoutId);

                const winSoundTimeoutId = setTimeout(() => {
                    if (GameAudioManger.getDefaultInstance() != null)
                        GameAudioManger.getDefaultInstance().stopSound("roulletPlay");
                }, 2000);
                this.timeoutIds.push(winSoundTimeoutId);


            }
        }
    }


    private showRoulettePoint() {
        this.roulettePoints.active = this.getRoulettePoint > 0;

        if (this.getRoulettePoint > 0) {

            this.animateNode(this.getRoulettePointLabel.node);

            let loopCount = Math.round(this.getRoulettePoint * 10);
            for (let i = 0; i < loopCount; i++) {
                const timeoutId = setTimeout(() => {
                    GameCoinMovingControl.getDefaultInstance().pushItem(CoinType.ROULETTE,
                        this.getRouletteIcon.getWorldPosition(),
                        () => {
                            if (this.node.active) {
                                //GameMainContext.getDefault().addRoulettePoint(0.1, true);
                                GameAddCoinControl.getDefault().updateRoulette(0.1 * (i + 1));
                                if (loopCount <= i + 1)
                                {
                                    GameAddCoinControl.getDefault().hideRoulette();
                                }
                            }

                        });
                }, i * 50);

                this.timeoutIds.push(timeoutId);
            }


            this.showRoulettePoints = 0;
            for (let i = 0; i < loopCount; i++) {
                const timeoutId = setTimeout(() => {
                    this.showRoulettePoints += 0.1;
                    this.getRoulettePointLabel.string = `+${this.showRoulettePoints.toFixed(1)}`;

                }, i * 100);
                this.timeoutIds.push(timeoutId);
            }
        }
    }

    private animateNode(node: Node): void {
        node.setScale(new Vec3(1, 1, 1));
        tween(node)
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    protected onDisable(): void {
        this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeoutIds = [];

        if (this._isCoinEffectPlay) {
            GameAddCoinControl.getDefault().hideAddRun();
            GameAddCoinControl.getDefault().hideRoulette();
        }

        this._isPlay = false;
        this._isShowDirect = true;
        this._isCoinEffectPlay = false;
    }

    public forceStopEffect() {
        if (this._isCoinEffectPlay && this._isPlay) {
            this.onDisable();

            this.getRunPointLabel.string = `+${10}`;
            this.roulettePoints.active = this.getRoulettePoint > 0;
            let getRoulettePoint = GameMissionNotiControl.getDefaultInstance().getWinRoulettePoints();
            this.getRoulettePointLabel.string = `+${getRoulettePoint.toFixed(1)}`;

            
        }

    }

    update(deltaTime: number) { }
}
