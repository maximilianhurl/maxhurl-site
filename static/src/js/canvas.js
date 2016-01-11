import decomp from 'poly-decomp';
import CanvasManager from './CanvasManager';

window.decomp = decomp;  // used internally by matter.js

window.setupCanvas = (canvasContainerId, contentContainerId) => {
  const canvasManager = new CanvasManager(canvasContainerId, contentContainerId);
  canvasManager.render();
}
