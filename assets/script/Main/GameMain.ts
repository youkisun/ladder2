import { _decorator, Component, director, Game, game, Node, ResolutionPolicy, view } from 'cc';
import { UIHud } from '../UI/UIHud';
import { GameMainContext } from './GameMainContext';
import { GameNetwork } from '../Network/GameNetwork';
import { GameStateManager } from './GameStateManager';
import { GameInitPacket } from '../Network/GamePacket';
import { GameUIManager, UIType } from './GameUIManager';
import { DefaultComponent } from '../Utils/GameUtils';
import { UITopMsgAlaram } from '../UI/UITopMsgAlaram';
import { GameBonusRoulette } from '../BonusRoulette/GameBonusRoulette';
import { GameUserBetState } from '../UserBetState/GameUserBetState';
import { UIShortAlarm } from '../UI/UIShortAlarm';
import { UIAttendanceBonus } from '../UI/UIAttendanceBonus';
import { GameMissionNotiControl } from './GameMissionNotiControl';
import { GameCoinMovingControl } from '../Common/GameCoinMovingControl';
import { GameCommon, Logger } from '../Common/GameCommon';
import { GameAudioManger } from './GameAudioManger';
import { GameSystemFile } from '../Utils/GameSystemFile';
const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends DefaultComponent<GameMain> {

    private isProcessingHome = false;
    private isProcessingMyInfo = false;
    private isProcessingHistory = false;
    private isProcessingWallet = false;

    resizeCanvas() {
        view.setDesignResolutionSize(1080, 1920, view.getResolutionPolicy());
        view.resizeWithBrowserSize(true);
    }

    applyFit() {
        // Fix vertical resolution, sides can be cropped
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_HEIGHT);
    }

    updateResolution() {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const targetHeight = 1920;
        const aspectRatio = screenW / screenH;
        const adjustedWidth = targetHeight * aspectRatio;

        // Adjust the width of the design resolution to match the aspect ratio
        view.setDesignResolutionSize(adjustedWidth, targetHeight, ResolutionPolicy.FIXED_HEIGHT);
    }

    protected onLoad(): void {
        GameMainContext.getDefault().isInGameMode = true;
        game.on(Game.EVENT_HIDE, this.onGameToBackground, this);
        game.on(Game.EVENT_SHOW, this.onBackgroundToGame, this);

        //window.addEventListener('resize', this.resizeCanvas);

        director.on("resize", this.updateResolution, this);
        //view.setResizeCallback(this.updateResolution.bind(this));
        this.updateResolution();

        //view.setDesignResolutionSize(1080, 1920, 2); // 2 = SHOW_ALL
        // main.ts or an early script in your scene
        // window.addEventListener('resize', () => {
        //     let canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
        //     if (canvas) {
        //         canvas.style.width = '1080px';
        //         canvas.style.height = '100vh';
        //     }
        // });

        // window.addEventListener('resize', this.resizeCanvas);
        // window.addEventListener('load', this.resizeCanvas);
    }

    start() {

        window.addEventListener('keydown', (event) => {
            if (event.key === 'F5') {
                event.preventDefault();
                console.log('F5 globally blocked');
            }
        }, true);

        let uiHud = UIHud.getDefaultInstance();
        GameNetwork.getDefaultInstance().SendInitReq(true);

        uiHud.uiBottomMenu.onClickInGameBtn = this.onClickInGameBtn.bind(this);
        uiHud.uiBottomMenu.onClickHomeBtn = this.onClickHomeBtn.bind(this);
        uiHud.uiBottomMenu.onClickHistoryBtn = this.onClickHistoryBtn.bind(this);
        uiHud.uiBottomMenu.onClickMyInfoBtn = this.onClickMyInformBtn.bind(this);
        uiHud.uiBottomMenu.onClickWalletBtn = this.onClickWalletBtn.bind(this);
        uiHud.uiBottomMenu.onClickStoreBtn = this.onClickStoreBtn.bind(this);
        uiHud.uiHudRoulette.onClickOpenRouletteButton = this.onClickRouletteOpenBtn.bind(this);
    }

    private onClickInGameBtn() {
        GameUIManager.getDefaultInstance().hideAll();
    }

    private onClickHomeBtn() {

        GameMainContext.getDefault().isInGameMode = false;
        director.loadScene("lobbyScene", (err, scene) => {
            if (err) {
                console.error("Failed to load scene:", err);
                return;
            }
            GameAudioManger.getDefaultInstance().stopAll();
            console.log("Scene loaded successfully:", scene);
        });
    }

    private onClickMyInformBtn() {
        
        if (GameUIManager.getDefaultInstance().isShow(UIType.MY_INFORMATION)) {
            let uiHud = UIHud.getDefaultInstance();
            uiHud.uiBottomMenu.clearAllButton();
            GameUIManager.getDefaultInstance().hideAll();
        }
        else {
            GameUIManager.getDefaultInstance().hideAll();
            GameUIManager.getDefaultInstance().load(UIType.MY_INFORMATION);
        }
    }

    private onClickHistoryBtn() {
        if (GameUIManager.getDefaultInstance().isShow(UIType.HISTORY)) {
            let uiHud = UIHud.getDefaultInstance();
            uiHud.uiBottomMenu.clearAllButton();
            GameUIManager.getDefaultInstance().hideAll();
        }
        else {
            GameUIManager.getDefaultInstance().hideAll();
            GameUIManager.getDefaultInstance().load(UIType.HISTORY);
        }
    }

    private onClickWalletBtn() {
        GameUIManager.getDefaultInstance().hideAll();
        UIShortAlarm.getDefaultInstance().showShortAlarm("Preparing...");
    }

    private onClickStoreBtn() {
        GameUIManager.getDefaultInstance().hideAll();
        UIShortAlarm.getDefaultInstance().showShortAlarm("Preparing...");
    }

    private onClickRouletteOpenBtn() {
        const node = GameUIManager.getDefaultInstance().load(UIType.ROULETTE);
        if (node) {
            const bonusRoulette = node.getComponent(GameBonusRoulette);
            bonusRoulette.show();
        }
    }

    private onGameToBackground() {
        Logger.log("Game is now in the background.");
    }

    private onBackgroundToGame() {
        Logger.log("Game is back in the foreground.");
        let stateMgr = GameStateManager.getDefaultInstance();
         if (stateMgr.getCurrentGameNo() != GameMainContext.getDefault().initPacket.cur_game_no)
        {
            GameNetwork.getDefaultInstance().SendInitReq(true);
        }
        else {
            stateMgr.RefreshTimeState();
            stateMgr.playState(true);
        }
    }

    update(deltaTime: number) {

    }
}