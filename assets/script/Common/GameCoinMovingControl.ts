import { _decorator, Component, Node, Vec3, v3 } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { GameRandom } from '../Utils/GameRandom';
import { UIHud } from '../UI/UIHud';
import { UIHudRoulette } from '../UI/UIHudRoulette';
import { UITopMenu } from '../UI/UITopMenu';
const { ccclass, property } = _decorator;

export class MovingItem {
    public targetNode: Node = null;
    public speed: number = 2.0;
    public elapsedTime: number = 0;
    public duration: number = 0;
    public startPos: Vec3;
    public controlPoint: Vec3;
    public endPos: Vec3;
    public isMoving: boolean = false;
    public onFinish: () => void;
}

export enum CoinType {
    TON = 0,
    ROULETTE = 1,
    RUN = 2,
}

@ccclass('GameCoinMovingControl')
export class GameCoinMovingControl extends DefaultComponent<GameCoinMovingControl> {

    @property([Node])
    private moveRouletteNodes: Node[] = [];

    @property([Node])
    private moveTonNodes: Node[] = [];

    @property([Node])
    private moveRunNodes: Node[] = [];

    private _movingItems: MovingItem[] = [];

    protected onLoad(): void {
        super.onLoad();
        this.moveRouletteNodes.forEach(element => {
            element.active = false;
        });

        this.moveTonNodes.forEach(element => {
            element.active = false;
        });

        this.moveRunNodes.forEach(element => {
            element.active = false;
        });
    }

    public pushItem(coinType: CoinType, startPos: Vec3, onFinish: () => void) {
        const movingItem = new MovingItem();

        let speed = 1000;
        let targetNode = null;

        let endPos = new Vec3(0,0,0);

        if(coinType == CoinType.ROULETTE)
        {
            endPos = UIHudRoulette.getDefaultInstance().node.getWorldPosition();
            targetNode = this.moveRouletteNodes.find(item => !item.active);
        }
        else if(coinType == CoinType.RUN)
        {
            endPos = UITopMenu.getDefaultInstance().runCoinIcon.getWorldPosition();
            targetNode = this.moveRunNodes.find(item => !item.active);
        }
        else
        {
            endPos = UITopMenu.getDefaultInstance().tonCoinNode.getWorldPosition();
            targetNode = this.moveTonNodes.find(item => !item.active);
        }

        if (targetNode == null)
            return;

        movingItem.targetNode = targetNode;
        movingItem.targetNode.active = true;
        movingItem.speed = speed;
        movingItem.startPos = startPos;
        movingItem.endPos = endPos;
        movingItem.onFinish = onFinish;

        const distance = Vec3.distance(startPos, endPos);
        movingItem.duration = distance / speed;
        movingItem.elapsedTime = 0;
        movingItem.isMoving = true;

        const direction = endPos.clone().subtract(startPos.clone()).normalize();
        let perpendicular = v3(-direction.y, direction.x, 0);

        const random = new GameRandom();
        perpendicular = perpendicular.multiplyScalar(random.nextInRange(-600, 600));

        movingItem.controlPoint = v3(
            (startPos.x + endPos.x) / 2 + perpendicular.x,
            (startPos.y + endPos.y) / 2 + perpendicular.y,
            0
        );

        this._movingItems.push(movingItem);
    }

    public popItem() {
        this._movingItems = this._movingItems.filter(item => item.isMoving);
    }

    update(deltaTime: number) {
        for (let item of this._movingItems) {
            if (!item.isMoving) continue;

            item.elapsedTime += deltaTime;
            let t = item.elapsedTime / item.duration;
            if (t > 1) {
                t = 1;
                item.isMoving = false;
                if (item.onFinish) {
                    item.onFinish();
                    item.targetNode.active = false;
                }
                this.popItem();
            }

            const newPosition = this.getQuadraticBezierPoint(item.startPos, item.controlPoint, item.endPos, t);
            item.targetNode.setWorldPosition(newPosition);
        }


    }

    private getQuadraticBezierPoint(p0: Vec3, p1: Vec3, p2: Vec3, t: number): Vec3 {
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        return v3(x, y, 0);
    }
}
