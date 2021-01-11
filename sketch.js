
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

  plot = new Plot(unitCircle.x + unitCircle.radius + 75, unitCircle.y + unitCircle.radius, width/2, unitCircle.dia);
  
  frameRate(60);
}

let max = 0;
function draw() {
  background("#f8f9fa");
  smooth();

  unitCircle.show();

  plot.argX = unitCircle.currentAngle;
  plot.argY = unitCircle.currentMagnitude;

  console.log(plot.argY);

  // TODO: scale max of y axis automatically based on poles closest to unit circle
  //  plot.maxArgY = 

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

    this.argX    = 0; // actual values
    this.argY    = 0;

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
    this.x = x;
    this.y = y;
    this.dia = dia;
    this.radius = this.dia / 2;
    this.currentAngle = 0; // radians

    this.movingPoint = new Point(this.x + this.radius, this.y + 0);

    this.poleArray = [];
    this.zeroArray = [];

    this.poleDistances = [];
    this.zeroDistances = [];

    this.denominator = 0;
    this.numerator   = 0;
    
    this.currentMagnitude = 0;
    this.magResponse = {frequency: [], magnitude: []};

    this.colors = {
      circle: "#343a40",
      axes:   "#dee2e6",
      color1: "#ff6b6b",
      color2: "#339af0",
      mix:    0,
    };
  }

  show () {

    this.showAxes();
    this.showUnitCircle();

    if (this.currentAngle >= TWO_PI) {

      this.currentAngle = 0;

      this.magResponse.frequency.length = 0;
      this.magResponse.magnitude.length = 0;

    }

    this.calcMovingPointPos(this.currentAngle);

    this.calcDistancesAndDrawLines();

    this.showMovingPoint();
    this.showZeros();
    this.showPoles();

    this.calcMagResponse();
    
  }

  showMovingPoint () {

    fill (this.colors.mix);
    this.movingPoint.show();

  }

  avgArray (arr) {

    let avg = 0;
    for (let i = 0; i < arr.length; i++) {
      avg += arr[i];
    }
    
    return avg;
  }

  showUnitCircle () {
    noFill();
    stroke(this.colors.circle)
    circle(this.x, this.y, this.dia);
  }

  showAxes () {

    let overshoot = 1.382;
    let halfLine  = this.radius * overshoot;

    stroke(this.colors.axes);
    line(this.x, this.y + halfLine, this.x, this.y - halfLine);
    line(this.x + halfLine, this.y, this.x - halfLine, this.y);

  }

  calcMagResponse () {

    this.numerator   = this.zeroDistances[0];
    this.denominator = this.poleDistances[0];

    for (let i = 1; i < this.zeroDistances.length; i++) {
      this.numerator *= this.zeroDistances[i];
    }

    for (let i = 1; i < this.poleDistances.length; i++) {
      this.denominator *= this.poleDistances[i];
    }

    this.currentMagnitude = this.numerator / this.denominator;

    this.magResponse.frequency.push(this.currentAngle);
    this.magResponse.magnitude.push(this.currentMagnitude);

  }

  calcMovingPointPos () {
    this.movingPoint.x = this.x + this.radius * cos(this.currentAngle);
    this.movingPoint.y = this.y - this.radius * sin(this.currentAngle);
  }

  calcDistancesAndDrawLines (drawLines = true) {

    for (let i = 0; i < this.poleArray.length; i++) {

      if(drawLines) {
        stroke(this.colors.color1);
        line(this.movingPoint.x, this.movingPoint.y, this.poleArray[i].x, this.poleArray[i].y);
      }

      this.poleDistances[i] = sqrt(this.magSq(this.movingPoint.x - this.poleArray[i].x, this.movingPoint.y - this.poleArray[i].y));
    }

    for (let i = 0; i < this.zeroArray.length; i++) {

      if(drawLines) {
        stroke(this.colors.color2);
        line(this.movingPoint.x, this.movingPoint.y, this.zeroArray[i].x, this.zeroArray[i].y);
      }

      this.zeroDistances[i] = sqrt(this.magSq(this.movingPoint.x - this.zeroArray[i].x, this.movingPoint.y - this.zeroArray[i].y));
    }

  }

  showPoles () {
    this.poleArray.forEach(pole => pole.show());
  }

  showZeros () {
    this.zeroArray.forEach(zero => zero.show());
  }

  // turn into one function
  addPole(real, imag) {
    //if (this.magSq(real, imag) <= 1) {
      this.poleArray.push(new PoleZero(this.x + this.radius * real, this.y - this.radius * imag, "p"));
    //}
  }

  addZero(real, imag) {
    //if (this.magSq(real, imag) <= 1) {
      this.zeroArray.push(new PoleZero(this.x + this.radius * real, this.y - this.radius * imag, "z"));
    //}
  }

  magSq (x, y) {
    return x*x + y*y;
  }

}


class PoleZero {

  constructor (x, y, type = "p", dia = 10) {
    this.x      = x;
    this.y      = y;
    this.dia = dia;
    this.rad = this.dia / 2;

    this.type = type;
  }

  show () {

    if (this.type == "p") {
      this.showCross();
    } else {
      this.showCircle();
    }

  }

  showCross () {
    line(this.x - this.rad, this.y - this.rad, this.x + this.rad, this.y + this.rad);
    line(this.x - this.rad, this.y + this.rad, this.x + this.rad, this.y - this.rad);
  }

  showCircle () {
    noFill();
    circle(this.x, this.y, this.dia);
  }
}


class Point {

  constructor (x, y, dia = 16) {
    this.x      = x;
    this.y      = y;
    this.dia = dia;
  }

  show () {
    circle(this.x, this.y, this.dia);
  }

}

function toRGB (color) {

  return [red(color), green(color), blue(color)];

}

function mouseClicked () {

  unitCircle.zeroArray.push(new PoleZero(
    mouseX, mouseY, "z"));

}
