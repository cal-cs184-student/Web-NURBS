import { INSTANCE } from "../../cad";
import { Intersection } from "../../geometry/intersection";
import { Curve } from "../../geometry/nurbs/curve";
import { Command } from "../command";

enum BlendCurvesCommandMode {
  SelectCurve1,
  SelectCurve2,
  Menu,
  AdjustEnd1,
  AdjustEnd2,
}

export class BlendCurvesCommand extends Command {

  private finished: boolean;
  private mode: BlendCurvesCommandMode;
  private curve: Curve | null;

  constructor() {
    super();
    this.finished = false;
    this.mode = BlendCurvesCommandMode.SelectCurve1;
    this.curve = null;
  }

  handleInputString(input: string): void {
    throw new Error("Method not implemented.");
  }

  handleClickResult(input: Intersection): void {
    throw new Error("Method not implemented.");
  }

  handleClick(): void {
    throw new Error("Method not implemented.");
  }

  handleMouseMove(): void {
    throw new Error("Method not implemented.");
  }

  getInstructions(): string {
    switch (this.mode) {
      case BlendCurvesCommandMode.SelectCurve1:
        return "0:Exit  Select first curve to blend.  $";
      case BlendCurvesCommandMode.SelectCurve2:
        return "0:Exit  Select second curve to blend.  $";
      case BlendCurvesCommandMode.Menu:
        return "0:Exit  1:FlipCurve1  2:FlipCurve2  3:AdjustEnd1  4:AdjustEnd2  $";
      case BlendCurvesCommandMode.AdjustEnd1:
        return "0:Exit  Click to place control point.  $";
      case BlendCurvesCommandMode.AdjustEnd2:
        return "0:Exit  Click to place control point.  $";
      default:
        throw new Error("case not implemented");
    }
  }

  isFinished(): boolean {
    return this.finished;
  }

  private done(): void {
    this.finished = true;
    if (this.curve) {
      INSTANCE.getScene().addGeometry(this.curve);
    }
  }

}
