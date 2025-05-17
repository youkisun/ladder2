import { _decorator, Component, Director, director, Node, UITransform, view, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoResizeUITransform')
export class AutoResizeUITransform extends Component {

    @property
    private maxWidth: number = 1920;


    private targetWidgets: Widget[] = [];
    private targetTransform: UITransform;
    private hasUpdated = false;


    onLoad() {
        this.targetTransform = this.node.getComponent(UITransform);
        let allWidgets = this.node.getComponentsInChildren(Widget);
        this.targetWidgets = allWidgets.filter(widget => widget.target === this.node);
        window.addEventListener('resize', this.updateSize.bind(this));
        this.updateSize();
    }

    private updateSize() {
        if (!this.node) return;
        const designResolution = view.getDesignResolutionSize();
        const screenRatio = view.getFrameSize().width / view.getFrameSize().height;

        // Only Fit Height is enabled, so the height is fixed → calculate the width based on the ratio
        const actualWidth = designResolution.height * screenRatio;

        if (this.targetTransform)
            this.targetTransform.width = actualWidth <= this.maxWidth ? actualWidth : this.maxWidth;

        for (let i = 0; i < this.targetWidgets.length; i++)
            this.targetWidgets[i].updateAlignment();


    }
}