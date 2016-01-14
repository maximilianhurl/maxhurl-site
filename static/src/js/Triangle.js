import Matter from './matter-edited';

// Matter.js module aliases
const Bodies = Matter.Bodies,
    Vertices = Matter.Vertices;

export default class Triangle {
  constructor(OPTS, SHAPEWIDTH, HEIGHT, YPOS, SHAPEOFFSET, LEFTSIDE=false) {

    this.SHAPEWIDTH = SHAPEWIDTH;
    this.OPTS = OPTS;
    this.SHAPEOFFSET = SHAPEOFFSET;
    this.HEIGHT = HEIGHT;
    this.SHAPEOFFSET = SHAPEOFFSET;
    this.LEFTSIDE = LEFTSIDE;
    this.YPOS = YPOS;
  }

  generate() {

    let body;

    if (this.LEFTSIDE) {
      //left side triangle
      const vertices = this.getLeftVertices(this.SHAPEWIDTH, this.HEIGHT, this.SHAPEWIDTH);
      body = Bodies.fromVertices(0, this.YPOS, vertices, this.OPTS)
    } else {
      //right side triangle
      const vertices = this.getRightVertices(this.SHAPEWIDTH, this.HEIGHT);
      body = Bodies.fromVertices(this.SHAPEOFFSET, this.YPOS + (this.SHAPEWIDTH/2), vertices, this.OPTS)
    }

    return body;
  }

  calculateSlopeYoffset(width, angle=27) {
    return parseInt(Math.tan(angle * Math.PI / 180) * width);
  }

  getLeftVertices(width, height) {
    const slopePosition = this.calculateSlopeYoffset(width);
    return Vertices.create([
      {x: 0, y: 0},
      {x:width, y:slopePosition},
      {x:width, y:height >  this.SHAPEWIDTH ? Math.max(height - slopePosition, slopePosition): slopePosition},
      {x: 0, y:height},
    ]);
  }

  getRightVertices(width, height) {
    const slopePosition = this.calculateSlopeYoffset(width);
    const bottomEdge = height + -slopePosition;
    return Vertices.create([
      {x: 0, y: 0},
      {x:width, y:-slopePosition},
      {x:width, y:bottomEdge},
      {x: 0, y:Math.max(bottomEdge - slopePosition, 2)},
    ]);
  }
}