import { _decorator, Component, Node, Vec3, v3, math, CCFloat } from 'cc';
import { GameRandom } from '../Utils/GameRandom';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

@ccclass('MovingSprite')
export class MovingSprite extends Component {
    @property(Node)
    private targetNode: Node = null;

    @property({ type: CCFloat, tooltip: "Movement speed (in seconds)" })
    private speed: number = 2.0;

    private elapsedTime: number = 0;
    private duration: number = 0;
    private startPos: Vec3;
    private controlPoint: Vec3;
    private endPos: Vec3;
    private isMoving: boolean = false;

    start() {
        
        this.moveToTarget();
    }

    private moveToTarget() {
        if (!this.targetNode) {
            Logger.error("Target node is not assigned!");
            return;
        }
    
        this.startPos = this.node.getWorldPosition();
        this.endPos = this.targetNode.getWorldPosition();
    
        // Calculate the distance
        const distance = Vec3.distance(this.startPos, this.endPos);
    
        // Calculate the movement direction vector (normalized)
        const direction = this.endPos.clone().subtract(this.startPos.clone()).normalize();
    
        // Calculate the perpendicular vector (to create a curve direction)
        let perpendicular = v3(-direction.y, direction.x, 0); // Get the perpendicular vector in 2D

        const random = new GameRandom();
        perpendicular = perpendicular.multiplyScalar(random.nextInRange(-600, 600)); // Adjust the magnitude
    
        // Calculate the control point for curved movement (midpoint of the movement direction + perpendicular vector)
        this.controlPoint = v3(
            (this.startPos.x + this.endPos.x) / 2 + perpendicular.x,
            (this.startPos.y + this.endPos.y) / 2 + perpendicular.y,
            0
        );
    
        // Movement duration = distance / speed
        this.duration = distance / this.speed;
        
        this.elapsedTime = 0;
        this.isMoving = true;
    }
    
    

    update(deltaTime: number) {
        if (!this.isMoving) return;

        this.elapsedTime += deltaTime;
        let t = this.elapsedTime / this.duration;
        if (t > 1) {
            t = 1;
            this.isMoving = false;
        }
        
        // Move along a Bezier curve
        const newPosition = this.getQuadraticBezierPoint(this.startPos, this.controlPoint, this.endPos, t);
        this.node.setWorldPosition(newPosition);
    }

    private getQuadraticBezierPoint(p0: Vec3, p1: Vec3, p2: Vec3, t: number): Vec3 {
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        return v3(x, y, 0);
    }
}
