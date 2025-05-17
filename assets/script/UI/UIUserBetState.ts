import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIUserBetState')
export class UIUserBetState extends Component {

    @property(ProgressBar)
    private leftProgressBar: ProgressBar;

    @property(ProgressBar)
    private rightProgressBar: ProgressBar;

    @property(Label)
    private leftPercentLabel: Label;

    @property(Label)
    private rightPercentLabel: Label;

    private leftStartFloatValue : number;
    private leftTargetFloatValue : number;
    private rightStartFloatValue : number;
    private rightTargetFloatValue : number;

    private leftStartIntValue : number = 0;
    private leftTargetIntValue : number = 0;
    private rightStartIntValue : number = 0;
    private rightTargetIntValue : number = 0;

    private isUpdateDelta : number = 0;

    private lastLeftValue: number = 0;
    private lastRightValue: number = 0;

    onLoad() {
        this.leftPercentLabel.string = "0%";
        this.rightPercentLabel.string = "0%";
    }

    update(deltaTime: number) {
        if (this.isUpdateDelta > 0) {
            this.isUpdateDelta -= deltaTime;
    
            if(this.isUpdateDelta < 0)
                this.isUpdateDelta = 0;
            else if(this.isUpdateDelta > 1)
                this.isUpdateDelta = 1;

            const t = 1.0 - this.isUpdateDelta;            
    
            // Update progress bars
            this.leftProgressBar.progress = this.lerp(this.leftStartFloatValue, this.leftTargetFloatValue, t);
            this.rightProgressBar.progress = this.lerp(this.rightStartFloatValue, this.rightTargetFloatValue, t);
    
            // Update left label only if value changes
            const leftResultValue = Math.round(this.lerp(this.leftStartIntValue, this.leftTargetIntValue, t));
            if (this.lastLeftValue !== leftResultValue) {
                this.leftPercentLabel.string = `${leftResultValue}%`;
                this.lastLeftValue = leftResultValue;
            }
    
            // Update right label only if value changes
            const rightResultValue = Math.round(this.lerp(this.rightStartIntValue, this.rightTargetIntValue, t));

            // if(rightResultValue < 0 || rightResultValue > 100 || leftResultValue < 0 || leftResultValue > 100 )
            // {
            //     let st = "aa";
            //     st = "33";
            // }

            if (this.lastRightValue !== rightResultValue) {
                this.rightPercentLabel.string = `${rightResultValue}%`;
                this.lastRightValue = rightResultValue;
            }
        }
    }

    public setPercent(leftValue: number, rightValue: number) {
        
        this.leftStartFloatValue = this.leftProgressBar.progress;
        this.leftTargetFloatValue = leftValue / 100;
        
        this.rightStartFloatValue = this.rightProgressBar.progress;
        this.rightTargetFloatValue = rightValue / 100;
        

        this.leftStartIntValue = this.lastLeftValue;
        this.leftTargetIntValue = leftValue;

        this.rightStartIntValue = this.lastRightValue;
        this.rightTargetIntValue = rightValue;
        

        this.isUpdateDelta = 1.0;
    }

    public init()
    {
        this.leftProgressBar.progress = 0;
        this.rightProgressBar.progress = 0;
    }

    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }
}