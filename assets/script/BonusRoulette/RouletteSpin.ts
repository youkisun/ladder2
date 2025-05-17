import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameAudioManger } from '../Main/GameAudioManger';
const { ccclass, property } = _decorator;

@ccclass('RouletteSpin')
export class RouletteSpin extends Component {

    @property(Node)
    private rotationNode: Node;

    private _currentAngle: number = 0;
    private _spinTimeElapsed: number = 0;
    private _targetAngle: number = 0;
    private _isSpinning: boolean = false;

    private _totalRotation: number = 0;

    @property
    public spinDuration: number = 5;

    @property
    public speed: number = 5;

    public onSpinFinishEvent: () => void;

    start() {
    }

    update(dt: number) {
        if (this._isSpinning) {
            this._spinTimeElapsed += dt;

            if (this._spinTimeElapsed <= this.spinDuration) {
                const progress = this._spinTimeElapsed / this.spinDuration;
                const easedProgress = this.easeOutQuart(0, 1, progress);

                this._currentAngle = this.lerp(0, this._totalRotation, easedProgress);
                this.rotationNode.eulerAngles = new Vec3(0, 0, this._currentAngle);
            } else {
                this._isSpinning = false;
                this._currentAngle = this._totalRotation;
                this.rotationNode.eulerAngles = new Vec3(0, 0, this._currentAngle);

                this.onSpinFinishEvent();
                //GameAudioManger.getDefaultInstance().stopSound("roulletPlay");
            }
        }
    }

    public startSpin(targetAngle: number) {
        if (!this._isSpinning) {
            this._targetAngle = targetAngle;
            this._spinTimeElapsed = 0;
            this._isSpinning = true;
            
            GameAudioManger.getDefaultInstance().playSound("roulletPlay");
            this._totalRotation = (360 * this.speed) + this._targetAngle;
        }
    }

    private easeOutQuart(start: number, end: number, value: number): number {
        value--;
        end -= start;
        return -end * (value * value * value * value - 1) + start;
    }

    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }
}
