import Matter from './matter-edited';
import _ from 'underscore';
import Visibility from 'visibilityjs';
import { randomItem } from './utils';
import $ from 'jquery';


// Matter.js module aliases
const Engine = Matter.Engine,
    World = Matter.World,
    Common = Matter.Common,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Vertices = Matter.Vertices,
    MouseConstraint = Matter.MouseConstraint;


export default class CanvasManager {
  constructor(canvasContainerId, contentContainerId) {

    this.TRIANGLECOUNT = $('section').length;
    this.INITIALWIDTH = 0;
    this.TOTALHEIGHT = 0;
    this.BALLWIDTH = 0;
    this.YOFFSET = 100;

    this.COLOURS = [
      '#b6dc62',
      '#575b5b',
      '#c44d58',
      '#4cc9c0'
    ];

    this.BGCOL = '#1e1f1f';

    //this.SPAWNTIME = 680;
    this.SPAWNTIME = 3000;

    this.engine = Engine.create(document.getElementById(canvasContainerId), {
        render: {
            options: {
                background: this.BGCOL,
                wireframeBackground: '#222',
                wireframes: false,
            }
        }
    });
  }

  setSizeOptions() {
    this.TOTALHEIGHT = 0;
    this.INITIALWIDTH = Math.min(500, document.documentElement.clientWidth);
    const clientWidth = this.INITIALWIDTH - ((this.INITIALWIDTH/100) * 16);
    this.BALLWIDTH = (clientWidth/100) * 5;
    this.SHAPEOFFSET = (this.INITIALWIDTH/100) * 26;
    this.SHAPEWIDTH = (this.INITIALWIDTH/100) * 74;
  }

  addBall() {
    const color = randomItem(this.COLOURS);
    let body = Bodies.circle(
      Common.random(this.SHAPEOFFSET, this.SHAPEWIDTH),
      Common.random(-50, -100),
      this.BALLWIDTH,
      {
        render: {
          fillStyle: color,
          strokeStyle: color
        }
      }
    );
    body.frictionAir = 0.01;
    body.friction = 0.01;
    World.add(this.engine.world, [body]);
  }

  removeShapes() {
    let toRemove = _.filter(this.engine.world.bodies, (body) => body.position.y > this.TOTALHEIGHT)
    if (toRemove.length) {
      World.remove(this.engine.world, toRemove);
    }
  }

  calculateSlopeYoffset(width, angle=27) {
    return parseInt(Math.tan(angle * Math.PI / 180) * width);
  }

  getLeftVertices(width, height) {
    const slopePosition = this.calculateSlopeYoffset(width);
    return Vertices.create([
      {x: 0, y: 0},
      {x:width, y:slopePosition},
      {x:width, y:height > this.SHAPEWIDTH ? height - slopePosition: slopePosition},
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

  positionTextSection(index, yPos, height) {
    $('section').eq(index).css({
      "margin-top": yPos,
      "height": height
    });
  }

  addTriangles() {

    const bodies = _.map(_.range(this.TRIANGLECOUNT), (index) => {

      let body;
      const opts = {
        isStatic: true,
        render: {
          fillStyle: this.COLOURS[index % 4],
          strokeStyle: this.BGCOL,
        }
      }

      const height = Math.max(this.SHAPEWIDTH, $('section div').eq(index).height() + 220)
      const yPos = Math.max(this.TOTALHEIGHT - this.SHAPEWIDTH/2, this.YOFFSET);

      if (index % 2) {
        //left side triangle
        const vertices = this.getLeftVertices(this.SHAPEWIDTH, height);
        body = Bodies.fromVertices(5, yPos, vertices, opts)
      } else {
        //right side triangle
        const vertices = this.getRightVertices(this.SHAPEWIDTH, height);
        body = Bodies.fromVertices(this.SHAPEOFFSET, yPos + (this.SHAPEWIDTH/2), vertices, opts)
      }

      //set size of section
      this.positionTextSection(index, yPos, height)

      if (index == 0) {
        this.TOTALHEIGHT += this.SHAPEWIDTH/2 + this.YOFFSET;
      }

      this.TOTALHEIGHT += height - (this.SHAPEWIDTH/2);

      return body;
    });

    World.add(this.engine.world, bodies);
  }


  addBorders() {
    //add invisible borders
    this.TOTALHEIGHT += this.SHAPEWIDTH/2;  //extend the scene a little

    const borderOpts = { isStatic: true, render: {fillStyle: 'transparent', strokeStyle: 'transparent'}};
    World.add(this.engine.world, [
      Bodies.rectangle(
        this.BALLWIDTH * 2.7, 0, 1, this.TOTALHEIGHT, borderOpts
      ),
      Bodies.rectangle(
        this.SHAPEWIDTH + this.BALLWIDTH * 2.7, 0, 1, this.TOTALHEIGHT, borderOpts
      ),
    ]);
  }

  updateScene() {
    //clear canvas
    World.clear(this.engine.world);
    Engine.clear(this.engine);
    var renderController = this.engine.render.controller;
    if (renderController.clear) {
      renderController.clear(enging.render);
    }

    //resize canvas
    this.setSizeOptions();

    const boundsMax = this.engine.world.bounds.max,
        renderOptions = this.engine.render.options,
        canvas = this.engine.render.canvas;

    //add background shapes
    this.addTriangles();
    this.addBorders();

    boundsMax.y = canvas.width = renderOptions.width = this.INITIALWIDTH;
    boundsMax.y = canvas.height = renderOptions.height = this.TOTALHEIGHT;

  }

  render() {
    // run the engine
    Engine.run(this.engine);

    // set initial size
    this.updateScene();

    //spawn and remove shapes
    Visibility.every(this.SPAWNTIME, () => {
      this.addBall();
      this.removeShapes();
    });

    window.onresize = () => this.updateScene();
  }
}