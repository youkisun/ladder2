import { _decorator, Component, Widget } from 'cc';
const { ccclass } = _decorator;

@ccclass('FixEditBoxAlignment')
export class FixEditBoxAlignment extends Component {
    onEnable() {
        window.addEventListener('resize', this.fixEditBoxAlignment.bind(this));
    }

    onDisable() {
        window.removeEventListener('resize', this.fixEditBoxAlignment.bind(this));
    }

    fixEditBoxAlignment() {
        this.scheduleOnce(() => {
            const widgets = this.node.getComponentsInChildren(Widget);
            widgets.forEach(widget => widget.updateAlignment());
        }, 0); // Execute in the next frame
    }
}
