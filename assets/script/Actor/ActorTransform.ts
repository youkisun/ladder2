import { _decorator, Node, Vec3, math } from "cc";
import { UIPath } from "../UI/UIPath";
const { ccclass, property } = _decorator;

@ccclass("ActorTransform")
export class ActorTransform {
    private _cachedNode: Node;
    private _paths: Vec3[] = [];
    private _moveSpeed: number = 500;

    constructor(actorNode: Node) {
        this._cachedNode = actorNode;
    }

    setPath(positions: Vec3[]) {
        this._paths = [...positions];
    }

    setStartPosition(pos: Vec3) {
        this._cachedNode.setWorldPosition(pos);
    }

    public setFinishPosition(posType: number)
    {
        const position = UIPath.getDefaultInstance().endPointNodes[posType].getWorldPosition();
        this._cachedNode.setWorldPosition(position);
    }

    public setLastPosition() {
        
    }

    /**
     * Move the actor based on the elapsed time (for synchronization).
     * @param elapsedTime Time to move the actor.
     */
    setElapsedTime(elapsedTime: number) {
        if (elapsedTime <= 0 || this._paths.length === 0) {
            return;
        }

        let curPos = this._cachedNode.getWorldPosition();

        while (elapsedTime > 0 && this._paths.length > 0) {
            const targetPos = this._paths[0];
            const toTargetDistVector = Vec3.subtract(new Vec3(), targetPos, curPos);
            const curMoveDir = Vec3.normalize(new Vec3(), toTargetDistVector);
            const moveValue = Vec3.multiplyScalar(new Vec3(), curMoveDir, this._moveSpeed * elapsedTime);

            const toTargetDist = toTargetDistVector.length();
            const moveValueDist = moveValue.length();

            const isArriveCurTarget = moveValueDist >= toTargetDist;
            if (isArriveCurTarget) {
                Vec3.copy(moveValue, toTargetDistVector);
                const diffValue = moveValueDist - toTargetDist;
                elapsedTime = Math.max(0, (diffValue / moveValueDist) * elapsedTime);
            }

            Vec3.add(curPos, curPos, moveValue);

            // If reached the target, move to the next path
            if (isArriveCurTarget) {
                Vec3.copy(curPos, targetPos);
                this._paths.shift();
            }
            // If not reached, exit the loop
            else
            {
                elapsedTime = 0;
            }
        }

        this._cachedNode.setWorldPosition(curPos);
    }

    /**
     * Update the actor's movement per frame.
     * @returns `true` if movement continues, `false` if path is finished.
     */
    updatePlayMove(): boolean {
        if (this._paths.length === 0) {
            return true;
        }

        const targetPos = this._paths[0];
        const curPos = this._cachedNode.getWorldPosition();

        const moveDistVector = Vec3.subtract(new Vec3(), targetPos, curPos);
        const curMoveDir = Vec3.normalize(new Vec3(), moveDistVector);
        const moveValue = Vec3.multiplyScalar(new Vec3(), curMoveDir, this._moveSpeed * (1 / 60)); // Assuming 60 FPS

        if (moveValue.length() >= moveDistVector.length()) {
            this._cachedNode.setWorldPosition(targetPos);
            this._paths.shift();
            return this._paths.length <= 0;
        } else {
            Vec3.add(curPos, curPos, moveValue);
            this._cachedNode.setWorldPosition(curPos);
            return false;
        }
    }
}
