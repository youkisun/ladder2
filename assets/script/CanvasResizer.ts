import { _decorator, Component, Node, UITransform, view, screen, log } from 'cc';
import { Logger } from './Common/GameCommon';
const { ccclass, property } = _decorator;

@ccclass('CanvasResizer')
export class CanvasResizer extends Component {
    @property(Node)
    rootNode: Node = null!; // Top-level node of the UI

    onLoad() {
        this.resizeCanvas(); // Initial size adjustment

        // Register browser window resize event
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.onWindowResize.bind(this));
        }
    }

    onWindowResize() {
        log('Window resize detected');
        this.resizeCanvas();
    }

    resizeCanvas() {
        const frameSize = screen.windowSize; // Current device screen size
        const designResolution = view.getDesignResolutionSize(); // Canvas design resolution

        if (!this.rootNode) {
            Logger.error("Root node is not set!");
            return;
        }

        const uiTransform = this.rootNode.getComponent(UITransform);
        if (!uiTransform) {
            Logger.error("UITransform component not found on rootNode!");
            return;
        }

        // Calculate the ratio between the screen and Canvas resolution
        const scaleX = frameSize.width / designResolution.width;
        const scaleY = frameSize.height / designResolution.height;

        // Calculate the most suitable ratio
        const scale = Math.max(scaleX, scaleY);

        // Adjust UITransform size
        const newWidth = designResolution.width * scale;
        const newHeight = designResolution.height * scale;

        uiTransform.width = newWidth;
        uiTransform.height = newHeight;

        // Adjust scale
        this.rootNode.setScale(1, 0.5, 1);

        // Log output
        log(`Canvas resized: frameSize=${frameSize.width}x${frameSize.height}, designResolution=${designResolution.width}x${designResolution.height}, scale=${scale}`);
        log(`Updated dimensions: width=${uiTransform.width}, height=${uiTransform.height}`);
    }

    onDestroy() {
        // Unregister browser window resize event
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.onWindowResize.bind(this));
        }
    }
}
