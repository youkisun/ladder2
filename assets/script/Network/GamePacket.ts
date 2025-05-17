import { GameCommon } from "../Common/GameCommon";
import { GameStateManager } from "../Main/GameStateManager";

// 게임 초기화 패킷.
export class GameInitPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public server_t_stamp: number;

    // telegram last name + first name.
    public nick: string;
    // telegram id
    public t_id: number;

    // free airdrop count
    public air_cnt: number;

    // run coin point,
    public r_points: number;
    // ton coin adress
    public ton_addr: string;
    // sol coin adress
    public sol_addr: string;
    public mi_tel_run: number;
    public mi_x_run: number;
    public mi_x_account: string;
    // Roulette points can be used starting from +1.
    public roulette_points: number;

    // Attendance bonus, given once a day (upon Telegram login).
    public att_bonus_cnt: number;
    public total_wins: number;
    // total bet count
    public total_games: number;
    // Number of logins (increases by +1 upon Telegram login)
    public login_cnt: number;
    // Number of friend invitations
    public refer_cnt: number;
    // Number of consecutive wins
    public con_win_cnt: number;

    public sound_on: number;

    public cur_game_mode: number;
    public bet_sec: number;
    public wait_sec: number;
    public game_sec: number;
    public cur_game_no: number;

    public lastBetInfo: {
        last_bet_game_no: number;
        last_bet_t_points: number;
        last_bet_winner: number;
        isWin: boolean;
    };

    // Betting results of the user's last 10 games
    public lastTenGames: Array<{
        game_no: number;
        bet_type: number;
        win_r_points: number;
        bet_t_points: number;
        win_t_points: number;
        total_roul_bonus: number;
        bet_winner: number;
        res_winner: number;
        res_streak: number;
    }>;

    public pastGameResults: Array<{
        game_no: number;
        bridge_num: number;
        side: number;
        winner: number;
        winStatus: number;
        betAmount: number;
        res_streak: number;
    }>;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.err_code = json.err_code;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;

        const resBody = json.res_body;
        this.nick = resBody.nick;
        this.r_points = Number(resBody.r_points);
        this.air_cnt = Number(resBody.air_cnt);
        this.ton_addr = resBody.ton_addr;
        this.sol_addr = resBody.sol_addr;
        this.mi_tel_run = resBody.mi_tel_run;
        this.mi_x_run = resBody.mi_x_run;
        this.mi_x_account = resBody.mi_x_account;
        this.roulette_points = Number(resBody.roulette_points);
        this.att_bonus_cnt = Number(resBody.att_bonus_cnt);
        this.total_wins = resBody.total_wins;
        this.total_games = resBody.total_games;
        this.login_cnt = resBody.login_cnt;
        this.refer_cnt = resBody.refer_cnt;
        this.t_id = resBody.t_id;
        this.con_win_cnt = resBody.con_win_cnt;
        this.sound_on = resBody.sound_on;
        // Client starts from 0, server starts from 1.
        // Subtract 1 to match.
        this.cur_game_mode = resBody.cur_game_mode - 1;
        this.bet_sec = 30;
        this.wait_sec = 10;
        this.game_sec = 20;
        this.cur_game_no = resBody.cur_game_no;


        if (this.lastTenGames != null) {
            let findGame = this.lastTenGames.find(x => x.game_no == this.lastBetInfo.last_bet_game_no);
            if (findGame != null)
                this.lastBetInfo.isWin = findGame.win_r_points > 0;
        }
        else
        {
            this.lastBetInfo.isWin = false;
        }


        this.pastGameResults = resBody.past_game_results;

        // Set winStatus by comparing the last 20 games with lastTenGames
        this.pastGameResults.forEach((pastGame) => {
            const matchingGame = this.lastTenGames.find((lastGame) => lastGame.game_no === pastGame.game_no);

            if (matchingGame) {
                pastGame.winStatus = matchingGame.bet_winner === pastGame.winner ? 2 : 1;
                pastGame.res_streak = matchingGame.res_streak;
            }
            else {
                pastGame.res_streak = 0;
                pastGame.winStatus = 0;
            }
        });
    }


    public getCurrentBetInfo(gameNo: number) {
        return this.lastTenGames.find(game => game.game_no === gameNo);
    }

    public isContainLastBetInfo(): boolean {
        return this.lastBetInfo.last_bet_game_no == GameStateManager.getDefaultInstance().getCurrentGameNo();
    }
}

export class GameBetPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public server_t_stamp: number;
    public bet_winner: number;

    public ret_bridge_num: number;
    public ret_side: number;
    public ret_winnder: number;

    public win_r_points: number;
    public win_roulette_points: number;

    public ret_air_cnt: number;
    public ret_r_points: number;
    public ret_roulette_points: number;

    public ret_con_win_cnt: number;
    public ret_total_wins: number;
    public ret_total_games: number;

    public refer_cnt: number;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.err_code = json.err_code;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;
        this.server_t_stamp = json.server_t_stamp;

        const resBody = json.res_body || {};

        this.bet_winner = resBody.bet_winner;
        this.ret_bridge_num = resBody.ret_bridge_num;
        this.ret_side = resBody.ret_side;
        this.ret_winnder = resBody.ret_winnder;

        this.win_r_points = resBody.win_r_points;
        this.win_roulette_points = resBody.win_roulette_points;

        this.ret_air_cnt = resBody.ret_air_cnt;
        this.ret_r_points = resBody.ret_r_points;
        this.ret_roulette_points = resBody.ret_roulette_points;

        this.ret_con_win_cnt = resBody.ret_con_win_cnt;
        this.ret_total_wins = resBody.ret_total_wins;
        this.ret_total_games = resBody.ret_total_games;

        this.refer_cnt = resBody.refer_cnt;
    }
}


export class GameResultPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public server_t_stamp: number;
    public game_no: number;
    public bridge_num: number;
    public side: number;
    public winner: number;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.err_code = json.err_code;

        this.err_msg = json.err_msg;
        this.err_act = json.err_act;

        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        // res_body의 game_result에서 값을 추출
        const gameResult = json.res_body.game_result;
        this.game_no = gameResult.game_no;
        this.bridge_num = gameResult.bridge_num;
        this.side = gameResult.side;
        this.winner = gameResult.winner;
        this.game_no = gameResult.game_no;
    }

    public correctTimeStamp(elapsedTime: number) {
        this.server_t_stamp = GameCommon.calServerTimeStamp(elapsedTime, this.send_t_stamp, this.recv_t_stamp);

    }
}

export class GameBonusPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public server_t_stamp: number;
    public att_bonus_t_points: number;
    public att_bonus_roulette_points: number;

    public ret_t_points: number;
    public ret_roulette_points: number;

    constructor(json: any) {
        this.type = json.type ?? 0;
        this.suc = json.suc ?? false;
        this.err_code = json.err_code ?? 0;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
        this.recv_t_stamp = json.recv_t_stamp ?? 0;
        this.send_t_stamp = json.send_t_stamp ?? 0;

        const resBody = json.res_body ?? {};
        this.att_bonus_t_points = Number(resBody.att_bonus_t_points) ?? 0;
        this.att_bonus_roulette_points = Number(resBody.att_bonus_roulette_points) ?? 0;
        this.ret_t_points = Number(resBody.ret_t_points) ?? 0;
        this.ret_roulette_points = Number(resBody.ret_roulette_points) ?? 0;
    }

    public correctTimeStamp(elapsedTime: number) {
        this.server_t_stamp = GameCommon.calServerTimeStamp(elapsedTime, this.send_t_stamp, this.recv_t_stamp);
    }
}


export class GameRoulettePacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;

    public opt_1_r_points: number;
    public opt_2_r_points: number;
    public opt_3_r_points: number;
    public opt_4_r_points: number;
    public opt_5_r_points: number;
    public opt_6_r_points: number;
    public opt_7_r_points: number;

    // Winning roulette number (1~7)
    public win_opt: number;

    // Winning run points
    public win_r_points: number;

    public total_r_points: number;
    // Current run points after adding the
    public left_roulette_points: number;

    constructor(json: any) {
        this.type = json.type ?? 0;
        this.suc = json.suc ?? false;
        this.err_code = json.err_code ?? 0;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        const resBody = json.res_body ?? {};
        this.opt_1_r_points = resBody.opt_1_r_points ?? 0;
        this.opt_2_r_points = resBody.opt_2_r_points ?? 0;
        this.opt_3_r_points = resBody.opt_3_r_points ?? 0;
        this.opt_4_r_points = resBody.opt_4_r_points ?? 0;
        this.opt_5_r_points = resBody.opt_5_r_points ?? 0;
        this.opt_6_r_points = resBody.opt_6_r_points ?? 0;
        this.opt_7_r_points = resBody.opt_7_r_points ?? 0;
        this.win_opt = resBody.win_opt ?? 0;
        this.win_r_points = Number(resBody.win_r_points) ?? 0;
        this.total_r_points = Number(resBody.total_r_points) ?? 0;
        this.left_roulette_points = Number(resBody.left_roulette_points) ?? 0;
    }
}


export class GameUpdateNickPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public server_t_stamp: number;
    public updated_nick: string;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.err_code = json.err_code;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        const resBody = json.res_body;
        this.updated_nick = resBody.updated_nick;
    }

    public correctTimeStamp(elapsedTime: number) {
        this.server_t_stamp = GameCommon.calServerTimeStamp(elapsedTime, this.send_t_stamp, this.recv_t_stamp);
    }
}

export class GameUpdateTonAddr {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public server_t_stamp: number;
    public updated_ton_addr: string;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        const resBody = json.res_body;
        this.updated_ton_addr = resBody.updated_ton_addr;
        this.err_code = json.err_code;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
    }

    public correctTimeStamp(value: number) {
        this.server_t_stamp = GameCommon.calServerTimeStamp(value, this.send_t_stamp, this.recv_t_stamp);
    }
}

export class GameUpdateSolAddr {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public server_t_stamp: number;
    public updated_sol_addr: string;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        const resBody = json.res_body;
        this.updated_sol_addr = resBody.updated_sol_addr;
        this.err_code = json.err_code;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
    }

    public correctTimeStamp(value: number) {
        this.server_t_stamp = GameCommon.calServerTimeStamp(value, this.send_t_stamp, this.recv_t_stamp);
    }
}

export class GameUpdateXAccountPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;
    public updated_x_account: string;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        const resBody = json.res_body;
        this.updated_x_account = resBody.updated_x_account;
        this.err_code = json.err_code;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
    }
}

export class GameUpdateSoundPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;

    // 0 : mute, 1 : unmute
    public updated_sound: number;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc ?? false;
        this.err_code = json.err_code ?? 0;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
        this.recv_t_stamp = json.recv_t_stamp;
        this.send_t_stamp = json.send_t_stamp;

        const resBody = json.res_body ?? {};
        this.updated_sound = resBody.updated_sound ?? 0;
    }
}

export class GameCompMissionPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public err_msg: string;
    public err_act: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;

    public mission_type: number;
    public reward_roulette_points: number;
    public ret_roulette_points: number;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc ?? false;
        this.err_code = json.err_code ?? 0;
        this.err_msg = json.err_msg;
        this.err_act = json.err_act;
        this.recv_t_stamp = json.recv_t_stamp ?? 0;
        this.send_t_stamp = json.send_t_stamp ?? 0;

        const resBody = json.res_body ?? {};
        this.mission_type = resBody.mission_type ?? 0;
        this.reward_roulette_points = resBody.updated_sound ?? 0;
        this.ret_roulette_points = resBody.ret_roulette_points ?? 0;
    }
}

export class GameInitLobbyPacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;

    public t_id: number;
    public air_cnt: number;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc ?? false;
        this.err_code = json.err_code ?? 0;
        this.recv_t_stamp = json.recv_t_stamp ?? 0;
        this.send_t_stamp = json.send_t_stamp ?? 0;

        const resBody = json.res_body ?? {};
        this.t_id = resBody.t_id ?? 0;
        this.air_cnt = resBody.air_cnt ?? 0;
    }
}

export class GameReqKeepAlivePacket {
    public type: number;
    public suc: boolean;
    public err_code: number;
    public recv_t_stamp: number;
    public send_t_stamp: number;

    constructor(json: any) {
        this.type = json.type;
        this.suc = json.suc ?? false;
        this.err_code = json.err_code ?? 0;
        this.recv_t_stamp = json.recv_t_stamp ?? 0;

    }
}