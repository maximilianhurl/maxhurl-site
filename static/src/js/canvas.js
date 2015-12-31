import decomp from 'poly-decomp';
import CanvasManager from './CanvasManager';

window.decomp = decomp;  // used internally by matter.js

window.setupCanvas = (triangeCount, containerId) => {
  const canvasManager = new CanvasManager(triangeCount, containerId);
  canvasManager.render();
}
