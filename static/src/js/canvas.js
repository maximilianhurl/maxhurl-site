import decomp from 'poly-decomp';
import CanvasManager from './CanvasManager';

window.decomp = decomp;  // used internally by matter.js

window.setupCanvas = (canvasContainerId, contentContainerId, contentPadding) => {
  const canvasManager = new CanvasManager(canvasContainerId, contentContainerId, contentPadding);
  canvasManager.render();
}
