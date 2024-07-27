import { WireSVG } from "./svg.js";

export class WireCatenary extends WireSVG {
  private readonly drop: number;
  private readonly tensionCoef: number;
  
  private readonly coefficients: { a: number, b: number, c: number } = { a: 0, b: 0, c: 0 };

  constructor({
    width,color,shadow,

    drop = 100,
    tensionCoef = 0.001
  }: {
    width?: number,
    color?: string,
    shadow?: string,

    drop?: number
    tensionCoef?: number
  }) {
    super({
      name: "catenary-wire",
      width,color,shadow
    });

    this.addInitParams({ drop, tensionCoef });

    this.drop = drop;
    this.tensionCoef = tensionCoef;

    this.createPathElement("shadow");
    this.createPathElement("path");
  }

  protected updateElementTransformations() {
    // calculate a/b/c values for ax^2 + bx + c of parabolic eq (parabola good approximation of catenary)
    let { x: x1, y: y1 } = this.point1.getPos();
    let { x: x3, y: y3 } = this.point2.getPos();

    const tensionLift = this.drop * Math.max(Math.min(this.tensionCoef * Math.abs(x3 - x1), 1), -1);
    const [x2,y2] = [ (x1+x3)/2, (y1+y3)/2 + this.drop - tensionLift];

    // simply draw vertical line
    if (x1 == x3) {
      this.drawVLineFallback(x1, y1, y2, y3);
      return;
    }

    if (x1 == 0) { // magic eq breaks if x1=0
      // assuming x1 != x3; swap to fix eq
      let temp = x3;
      let temp2 = y3;
      x3 = x1;
      x1 = temp;
      y3 = y1;
      y1 = temp2;
    }

    const [sqX1, sqX2, sqX3] = [ x1*x1, x2*x2, x3*x3 ];

    const mainDiv = (x1 - x2) * (x1 - x3) * (x2 - x3);
    this.coefficients.a = -(x1*(y2-y3)-x2*(y1-y3)+x3*(y1-y2))                                  /     mainDiv;
    this.coefficients.b = (sqX1*(y2-y3)-sqX2*(y1-y3)+sqX3*(y1-y2))                             /     mainDiv;
    this.coefficients.c = (sqX1*x2*y3*(x1-x2)-x2*sqX3*y1*(x1-x2)-x3*(x1-x3)*(sqX1*y2-sqX2*y1)) / (x1*mainDiv);

    this.drawParabola(x1,x3, y1,y3);
  }

  private drawParabola(
    x1: number,
    x3: number,
    y1: number,
    y3: number
  ) {
    let minY = Math.min(y1, y3);
    let maxY = Math.max(y1, y3)

    const { a,b,c } = this.coefficients;

    if (Math.abs(a) > 1e-10) {
      // extreme(ax^2 + bx + c) -> 2ax + b = 0 -> x = -b / 2a
      const x2 = -b / (2*a);
      const y2 = a*x2*x2 + b*x2 + c;
      minY = Math.min(minY, y2);
      maxY = Math.max(maxY, y2);
    }

    // https://math.stackexchange.com/questions/335226/convert-segment-of-parabola-to-quadratic-bezier-curve
    const p_Cx = (x1 + x3) / 2
    const p_Cy = y1 + (2*a*x1 + b) * (x3-x1) / 2;
    
    this.setSVGBounds([x1,x3], [minY, maxY]);

    const d = `M${x1} ${y1} Q${p_Cx} ${p_Cy} ${x3} ${y3}`; // use quadratic bezier curve to draw parabola, which used to estimate catenary
    this.wirePaths.get("shadow").setAttribute("d", d);
    this.wirePaths.get("path").setAttribute("d", d);
  }

  private drawVLineFallback(
    x: number,
    y1: number,
    y2: number,
    y3: number
  ) {
    const { minY, maxY } = this.setSVGBounds([x], [y1,y2,y3]);

    const d = `M${x} ${minY} L${x} ${maxY}`;
    this.wirePaths.get("shadow").setAttribute("d", d);
    this.wirePaths.get("path").setAttribute("d", d);
  }

  protected updateWireStyle() {
    this.wirePaths.get("shadow").setAttribute("stroke", this._shadow);
    this.wirePaths.get("path").setAttribute("stroke", this._color);
    
    this.wirePaths.get("shadow").style.strokeWidth = `${this._width + 1}px`;
    this.wirePaths.get("path").style.strokeWidth = `${this._width}px`;
  }
}