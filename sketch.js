"use strict"

let unitCircle; 
let angle = 0;

let plot;

function setup() {
  createCanvas(900, 700);

  unitCircle = new UnitCircle (0.236*width, height/2, width*0.236);

  // Integrator
  unitCircle.addZero(0, 0);
  unitCircle.addPole(1, 0);


  // Comb Filter
  let N = 5;
  for (let i = 0; i < N; i++) {

    let deltaPhi = TWO_PI / (N);
    unitCircle.addZero( cos(deltaPhi * i), sin(deltaPhi * i));
    unitCircle.addPole(0, 0);
  }

  // MAV Filter
  /*
  let N = 4;
  for (let i = 0; i < N+1; i++) {

    let deltaPhi = TWO_PI / (N+1);

    unitCircle.addZero( cos(deltaPhi * i), sin(deltaPhi * i));
  }

  for (let i = 0; i < N; i++) {
    unitCircle.addPole(0, 0);
  }

  */

  // LP
  /*for (let i = 0; i < 2; i++) {
    unitCircle.addPole(0, 0);
  }

  for (let i = 0; i < 2; i++) {
    unitCircle.addZero(2.4, 1.34 * pow(-1,i));
    unitCircle.addZero(2.4, 1.34 * pow(-1,i));
    unitCircle.addZero(-0.988, 0.15555 * pow(-1,i));
    unitCircle.addZero(-0.8224, 0.5689 * pow(-1,i));
    unitCircle.addZero(-0.91, 0.421 * pow(-1,i));
    unitCircle.addZero(0.318, 0.1772* pow(-1,i));
  }*/

  plot = new Plot(unitCircle.x + unitCircle.radius + 75, unitCircle.y + unitCircle.radius, width/2, unitCircle.dia);
  
  frameRate(60);
}

let max = 0;
function draw() {
  background("#f8f9fa");
  smooth();

  unitCircle.show();

  plot.argX = unitCircle.currentAngle;
  plot.argY = unitCircle.calculator.currentMagnitude;

  console.log(plot.argY);

  if (plot.argY > max) {
    max = plot.argY;
    plot.maxArgY = plot.argY;
  }

  plot.show();

  unitCircle.currentAngle += 0.05;

}

class Plot {
  constructor (ox, oy, width = 160, height = 100) {
    this.ox = ox;
    this.oy = oy;

    this.width  = width;
    this.height = height;

    this.xFromOrigin = 0; // for plotting
    this.yFromOrigin = 0;

    this.argX = 0; // actual values
    this.argY = 0;

    this.previousValues = {xs: [], ys: []};

    this.maxArgX = TWO_PI;
    this.maxArgY = 10;

    this.colors = {
      axes:   "#adb5bd",
      points: "#ffe066",
    };
  }

  show () {

    this.showXAxis();
    this.showYAxis();

    this.xFromOrigin = this.calcX(this.argX);
    this.yFromOrigin = this.calcY(this.argY);

    this.showArgX();
    this.showArgY();

    this.showPoint(this.xFromOrigin, this.yFromOrigin);

    this.showPointLine();
    this.showPreviousPoints();

    this.updatePreviousValues();

  }

  updatePreviousValues() {

    if (this.xFromOrigin >= (this.ox + this.width)) {
      this.previousValues.xs.length = 0;
      this.previousValues.ys.length = 0;
    }

    this.previousValues.xs.push(this.argX);
    this.previousValues.ys.push(this.argY);

  }

  showPreviousPoints () {
    fill(this.colors.points);
    stroke(this.colors.points);
    for(let i = 0; i < this.previousValues.xs.length; i++) {
      circle(this.ox + this.calcX(this.previousValues.xs[i]), this.oy - this.calcY(this.previousValues.ys[i]), 10);
    }
  }

  showPoint (x, y) {
    circle(this.ox + x, this.oy - y, 20);
  }

  showPointLine () {
    line(this.ox + this.xFromOrigin, this.oy, this.ox + this.xFromOrigin, this.oy - this.yFromOrigin);
    line(this.ox, this.oy - this.yFromOrigin, this.ox + this.xFromOrigin, this.oy - this.yFromOrigin);
  }

  calcX (x) {
    return (this.width * x) / this.maxArgX;
  }

  calcY (y) {
    return (this.height * y) / this.maxArgY;
  }

  showArgX () {
    circle(this.ox + this.xFromOrigin, this.oy, 30);
  }

  showArgY () {
    circle(this.ox, this.oy - this.yFromOrigin, 30);
  }

  showXAxis () {
    stroke(this.colors.axes);
    line(this.ox, this.oy, this.ox + this.width, this.oy);
  }

  showYAxis () {
    stroke(this.colors.axes);
    line(this.ox, this.oy, this.ox, this.oy - this.height);
  }

}

class UnitCircle {

  constructor (x, y, dia = 100) {
    this.x            = x;
    this.y            = y;
    this.dia          = dia;
    this.radius       = this.dia / 2;
    this.currentAngle = 0; // rad

    this.poleArray = [];
    this.zeroArray = [];

    this.movingPoint = new PointOnCircle(this.x, this.y, this.radius);

    this.calculator  = new UnitCircleCalculator(this);

    this.colors = {
      circle: "#343a40",
      axes:   "#dee2e6",
      poles:  "#ff6b6b",
      zeroes: "#339af0",
    };
  }

  show () {
    this.showAxes();
    this.showUnitCircle();
    this.showZeros();
    this.showPoles();
    this.showMovingPoint();
    this.showDistanceLines();

    this.calculator.calcMagResponse();

    this.resetOnCompletedRound();
  }

  resetOnCompletedRound () {
    if (this.currentAngle >= TWO_PI) {

      this.currentAngle = 0;

      this.calculator.magResponse.frequency.length = 0;
      this.calculator.magResponse.magnitude.length = 0;
    }
  }

  showMovingPoint () {
    fill (this.colors.circle);
    this.movingPoint.show(this.currentAngle);
  }

  showUnitCircle () {
    noFill();
    stroke(this.colors.circle)
    circle(this.x, this.y, this.dia);
  }

  showDistanceLines () {
    this.poleArray.forEach(pole => {
      this.movingPoint.connectionLineTo(pole, this.colors.poles);
    });

    this.zeroArray.forEach(zero => {
      this.movingPoint.connectionLineTo(zero, this.colors.zeroes);
    });
  }

  showAxes () {
    let overshoot = 1.382;
    let halfLine  = this.radius * overshoot;

    stroke(this.colors.axes);
    line(this.x, this.y + halfLine, this.x, this.y - halfLine);
    line(this.x + halfLine, this.y, this.x - halfLine, this.y);
  }

  showPoles () {
    this.poleArray.forEach(pole => pole.show());
  }

  showZeros () {
    this.zeroArray.forEach(zero => zero.show());
  }

  addPole(real, imag) {
    this.poleArray.push(new Pole(this._xFromReal(real), this._yFromImag(imag)));
  }

  addZero(real, imag) {
    this.zeroArray.push(new Zero(this._xFromReal(real), this._yFromImag(imag)));
  }

  _xFromReal (real) {
    return this.x + this.radius * real;
  }

  _yFromImag (imag) {
    return this.y - this.radius * imag;
  }
}

class UnitCircleCalculator {

  constructor (unitCircle) {
    this.unitCircle = unitCircle;

    this.currentMagnitude;

    this.magResponse = {
      frequency: [],
      magnitude: []
    };

  }

  calcMagResponse () {

    this.numerator   = 1;
    this.denominator = 1;

    this.unitCircle.zeroArray.forEach(zero => {
      this.numerator *= this.unitCircle.movingPoint.distanceTo(zero);
    });

    this.unitCircle.poleArray.forEach(pole => {
      this.denominator *= this.unitCircle.movingPoint.distanceTo(pole);
    });

    this.currentMagnitude = this.numerator / this.denominator;

    this.magResponse.frequency.push(this.unitCircle.currentAngle);
    this.magResponse.magnitude.push(this.currentMagnitude);

  }

}

/*============================================================*/

class Point {

  constructor (x, y, dia = 16, hexColor = "#000000") {
    this.x         = x;
    this.y         = y;
    this.dia       = dia;
    this.rad       = dia / 2;
    this.hexColor  = hexColor;
  }

  show () {
    circle(this.x, this.y, this.dia);
  }

  connectionLineTo (point2, lineColor = "#ff6b6b") {
    stroke(lineColor);
    line(this.x, this.y, point2.x, point2.y);
  }

  distanceTo (point2) {
    return sqrt(this._magSq(this.x - point2.x, this.y - point2.y));
  }

  _magSq (x, y) {
    return x*x + y*y;
  }

}

class Pole extends Point {

  constructor (x, y, hexColor = "#ff6b6b", dia) {
    super(x, y, dia, hexColor);
  }

  // cross
  show() {
    stroke(this.hexColor);
    line(this.x - this.rad, this.y - this.rad, this.x + this.rad, this.y + this.rad);
    line(this.x - this.rad, this.y + this.rad, this.x + this.rad, this.y - this.rad);
  }

}

class Zero extends Point {

  constructor (x, y, hexColor = "#339af0", dia) {
    super(x, y, dia, hexColor);
  }

  // empty circle
  show() {
    stroke(this.hexColor);
    noFill();
    super.show();
  }

}

class PointOnCircle extends Point {

  constructor (circleX, circleY, circleRadius, hexColor, dia) {
    super(circleX + circleRadius, circleY, dia, hexColor);

    this.circleX      = circleX;
    this.circleY      = circleY;
    this.circleRadius = circleRadius;
  }

  show (angle = 0) { // rad
    this.x = this.circleX + this.circleRadius * cos(angle);
    this.y = this.circleY - this.circleRadius * sin(angle);
    super.show();
  }

}
