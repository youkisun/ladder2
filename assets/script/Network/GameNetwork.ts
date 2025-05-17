import { _decorator, Component, director, game, Node } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GamePostRequest } from './GamePostRequest';
import { GameBetPacket, GameBonusPacket, GameCompMissionPacket, GameInitLobbyPacket, GameInitPacket, GameReqKeepAlivePacket, GameResultPacket, GameRoulettePacket, GameUpdateNickPacket, GameUpdateSolAddr, GameUpdateSoundPacket, GameUpdateTonAddr, GameUpdateXAccountPacket } from './GamePacket';
import { UIHud } from '../UI/UIHud';
import { GameStateManager } from '../Main/GameStateManager';
import { GameMainContext } from '../Main/GameMainContext';
import { GameAudioManger } from '../Main/GameAudioManger';
import { Logger } from '../Common/GameCommon';
import { GameTimeManager } from '../Utils/GameTimeManager';
import { UIShortAlarm } from '../UI/UIShortAlarm';
const { ccclass, property } = _decorator;

@ccclass('GameNetwork')
export class GameNetwork extends DefaultComponent<GameNetwork> {

    private postRequest: GamePostRequest = new GamePostRequest();

    private tonChangedCount: number = 0;
    private solChangedCount: number = 0;
    private soundChangedCount: number = 0;

    protected onLoad() {
        super.onLoad();

        this.postRequest.Init();
        if (!director.isPersistRootNode(this.node)) {
            director.addPersistRootNode(this.node);
        }
    }

    

    private setDebugLog(text: string, gameNo: number) {
        const formatter = new Intl.DateTimeFormat("ko-KR", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        let utcTime = formatter.format(GameTimeManager.getInstance().getCurrentTime()).replace(/[^0-9]/g, "");
        UIHud.getDefaultInstance().debugUTCLabel.string = "UTC:" + utcTime + `\nGAME.NO:${gameNo}\n${text}\n`;
    }

    public SendInitReq(isInitialize: boolean = false) {
        Logger.log(`[INIT_REQ] SendInitReq`);
        this.setDebugLog(`-SendInitReq- init:${isInitialize}`, GameStateManager.getDefaultInstance().getCurrentGameNo());
        this._sendInitReq(isInitialize, (initPacket) => {

            if (initPacket.err_code != 0) {
                const errorMsg = `[INIT_REQ] Game initialization failed - err_code : ${initPacket.err_code}`;
                Logger.error(errorMsg);
                GameMainContext.getDefault().isInit = false;
                GameMainContext.getDefault().CheckErrorAlert(initPacket.err_code, initPacket.err_msg, initPacket.err_act);
                //UIHud.getDefaultInstance().showLoading(false);
                return;
            }

            if (isInitialize) {
                if (GameAudioManger.getDefaultInstance() != null)
                    GameAudioManger.getDefaultInstance().setMute(initPacket.sound_on > 0 ? false : true);
            }

            const gameStateMgr = GameStateManager.getDefaultInstance();
            gameStateMgr.setInit(initPacket, isInitialize);

            Logger.log(`[INIT_REQ] Initialization successful: initPacket:${initPacket}`);

            GameMainContext.getDefault().setOnSetInit(initPacket, isInitialize);
            GameMainContext.getDefault().isInit = true;

            //if (isInitialize) {
            //    //gameStateMgr.playState();
            //    UIHud.getDefaultInstance().showLoading(false);
            //}

            UIHud.getDefaultInstance().uiRecordInform.setRecordItems();

        });
    }

    private _sendInitReq(isInitialize: boolean, callback: (gameInitPacket: GameInitPacket) => void) {
        Logger.log('[INIT_REQ] Game initialization packet request');
        UIHud.getDefaultInstance().setErrorMessageLabel("sendInitReq");
        let initValue = isInitialize ? 1 : 0;
        
        this.postRequest.sendInGamePostRequest("/airdrop/reqinitgame", { type: 100, st_init: initValue }, (response, elapsedTime) => {
            const parsedResponse = new GameInitPacket(response);

            //if(parsedResponse.suc)
            //{
            //    parsedResponse.correctTimeStamp(elapsedTime);    
            //}
            
            callback(parsedResponse);
        });
    }

    // bet_type - 1:airdrop, 2:ton
    public sendBetReq(params: { type: number, bet_game_no: number, bet_type: number, bet_t_points: number, bet_winner: number }, callback: (gameBetPacket: GameBetPacket) => void) {
        this.setDebugLog("-sendBetReq-", params.bet_game_no);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendBetReq" + params);
        Logger.log('[BET_REQ] sendBetReq', params);
        this.postRequest.sendInGamePostRequest("/airdrop/reqbetgame", params, (response, elapsedTime) => {
            const parsedResponse = new GameBetPacket(response);

            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);

            if(!parsedResponse.suc)
                return;

            //parsedResponse.correctTimeStamp(elapsedTime);
            callback(parsedResponse);
        });
    }

    public sendBonusReq(callback: (gameBonusPacket: GameBonusPacket) => void) {
        let params = { type: 103 };
        Logger.log('[BONUS_REQ] sendBonusReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendBonusReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/reqattbonus", params, (response, elapsedTime) => {
            const parsedResponse = new GameBonusPacket(response);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);
            parsedResponse.correctTimeStamp(elapsedTime);

            if(!parsedResponse.suc)
                return;
            callback(parsedResponse);
        });
    }

    public sendUpdateNickReq(updateNickValue: string, callback: (gameUpdateNickPacket: GameUpdateNickPacket) => void) {
        let params = { type: 104, req_nick: updateNickValue };
        Logger.log('[UPDATE_NICK_REQ] sendUpdateNickReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendUpdateNickReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/requpdatenick", params, (response, elapsedTime) => {
            const parsedResponse = new GameUpdateNickPacket(response);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);
            parsedResponse.correctTimeStamp(elapsedTime);

            if(!parsedResponse.suc)
                return;
            callback(parsedResponse);
        });
    }

    public sendUpdateTonAddrReq(tonAddrValue: string, callback: (gameUpdateTonAddrPacket: GameUpdateTonAddr) => void) {
        let params = { type: 105, req_ton_addr: tonAddrValue };
        Logger.log('[UPDATE_TON_ADDR_REQ] sendUpdateTonAddrReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendUpdateTonAddrReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/requpdatetonaddr", params, (response, elapsedTime) => {
            const parsedResponse = new GameUpdateTonAddr(response);
            parsedResponse.correctTimeStamp(elapsedTime);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);

            if(!parsedResponse.suc)
                return;
            callback(parsedResponse);
        });
    }

    public sendUpdateSolAddrReq(tonAddrValue: string, callback: (gameUpdateSolAddrPacket: GameUpdateSolAddr) => void) {
        let params = { type: 108, req_sol_addr: tonAddrValue };
        Logger.log('[UPDATE_SOL_ADDR_REQ] sendUpdateSolAddrReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendUpdateSolAddrReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/requpdatesoladdr", params, (response, elapsedTime) => {
            const parsedResponse = new GameUpdateSolAddr(response);
            parsedResponse.correctTimeStamp(elapsedTime);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);

            if(!parsedResponse.suc)
                return;
            callback(parsedResponse);
        });
    }

    public sendUpdateXAccountReq(xAccountValue: string, callback: (updateXAccountPacket: GameUpdateXAccountPacket) => void) {
        let params = { type: 110, req_x_account: xAccountValue };
        Logger.log('[UPDATE_X_ACCOUNT_REQ] sendUpdateXAccountReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendUpdateXAccountReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/requpdatexaccount", params, (response, elapsedTime) => {
            const parsedResponse = new GameUpdateXAccountPacket(response);            
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);

            if(!parsedResponse.suc)
                return;
            callback(parsedResponse);
        });
    }

    public sendRouletteReq(callback: (gameRoulettePacket: GameRoulettePacket) => void) {
        let params = { type: 106 };
        Logger.log('[BONUS_REQ] sendRouletteReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendRouletteReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/reqroulette", params, (response, elapsedTime) => {
            const parsedResponse = new GameRoulettePacket(response);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);

            callback(parsedResponse);
        });
    }

    // soundUpdate - 0 : mute, 1 : unmute 
    public sendUpdateSoundReq(onSound: number, callback: (gameUpdateSoundPacket: GameUpdateSoundPacket) => void) {
        let params = { type: 107, sound_on: onSound };
        Logger.log('sendUpdateSoundReq', params);

        this.postRequest.sendInGamePostRequest("/airdrop/requpdatesound", params, (response, elapsedTime) => {
            const parsedResponse = new GameUpdateSoundPacket(response);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);
            GameMainContext.getDefault().initPacket.sound_on = parsedResponse.updated_sound;
            
            callback(parsedResponse);
        });
    }

    public sendCompMissionReq(missionTypeValue: number, callback: (gameCompMissionPacket: GameCompMissionPacket) => void) {
        let params = { type: 109, mission_type: missionTypeValue };
        Logger.log('[COMP_MISSION_REQ] sendCompMissionReq', params);

        UIHud.getDefaultInstance().setErrorMessageLabel("sendCompMissionReq" + params);
        this.postRequest.sendInGamePostRequest("/airdrop/reqcompmission", params, (response, elapsedTime) => {
            const parsedResponse = new GameCompMissionPacket(response);
            GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);
            callback(parsedResponse);
        });
    }

    public sendReqKeepAliveReq(callback: (gameReqKeepAlivePacket: GameReqKeepAlivePacket) => void) {
        let params = { type: 98 };
        Logger.log('sendReqKeepAliveReq', params);

        //UIHud.getDefaultInstance().setErrorMessageLabel("sendReqKeepAliveReq" + params);
        this.postRequest.sendLobbyPostRequest("/airdrop/reqkeepalive", params, (response, elapsedTime) => {
            const parsedResponse = new GameReqKeepAlivePacket(response);
            //GameMainContext.getDefault().CheckErrorAlert(parsedResponse.err_code, parsedResponse.err_msg, parsedResponse.err_act);
            callback(parsedResponse);
        });
    }
}



