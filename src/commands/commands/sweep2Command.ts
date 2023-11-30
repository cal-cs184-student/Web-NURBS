import { INSTANCE } from "../../cad";
import { Intersection } from "../../geometry/intersection";
import { Curve } from "../../geometry/nurbs/curve";
import { Surface } from "../../geometry/nurbs/surface";
import { Clicker } from "../clicker";
import { Command } from "../command";

enum Sweep2CommandMode {
  SelectPipe1,
  SelectPipe2,
  SelectCrossSection1,
  SelectCrossSection2,
  Preview,
}

export class Sweep2Command extends Command {

  private finished: boolean = false;
  private clicker: Clicker = new Clicker();
  private mode: Sweep2CommandMode = Sweep2CommandMode.SelectPipe1;
  private surface: Surface | null = null;
  private pipe1: Curve | null = null;
  private pipe2: Curve | null = null;
  private crossSection1: Curve | null = null;
  private crossSection2: Curve | null = null;
  private preserveHeight: boolean = false;

  constructor() {
    super();
    INSTANCE.getSelector().reset();
  }

  handleInputString(input: string): void {
    if (input == "0") {
      this.surface?.delete();
      this.surface = null;
      this.done();
    }
    if (this.mode === Sweep2CommandMode.Preview) {

    }
  }

  handleClickResult(intersection: Intersection): void {
    switch (this.mode) {
      case Sweep2CommandMode.SelectPipe1:
        this.pipe1 = <Curve>intersection.geometry;
        this.pipe1.select();
        this.mode = Sweep2CommandMode.SelectPipe2;
        break;
      case Sweep2CommandMode.SelectPipe2:
        this.pipe2 = <Curve>intersection.geometry;
        this.pipe2.select();
        this.mode = Sweep2CommandMode.SelectCrossSection1;
        break;
      case Sweep2CommandMode.SelectCrossSection1:
        this.crossSection1 = <Curve>intersection.geometry;
        this.crossSection1.select();
        this.mode = Sweep2CommandMode.SelectCrossSection2;
        break;
      case Sweep2CommandMode.SelectCrossSection2:
        this.crossSection2 = <Curve>intersection.geometry;
        this.crossSection2.select();
        this.generateSurface();
        break;
      default:
        throw new Error("case not handled");
    }
    this.clicker.reset();
  }

  handleClick(): void {
    this.clicker.click(["curve"]);
  }

  handleMouseMove(): void {
    this.clicker.onMouseMove(["curve"]);
  }

  getInstructions(): string {
    switch (this.mode) {
      case Sweep2CommandMode.SelectPipe1:
        return "0:Exit  Select pipe 1.  $";
      case Sweep2CommandMode.SelectPipe2:
        return "0:Exit  Select pipe 2.  $";
      case Sweep2CommandMode.SelectCrossSection1:
        return "0:Exit  Select cross section 1.  $";
      case Sweep2CommandMode.SelectCrossSection2:
        return "0:Exit  Select cross section 2.  $";
      case Sweep2CommandMode.Preview:
        return `0:Exit  1:PreserveHeight(${this.preserveHeight ? "True" : "False"})  $`;
      default:
        throw new Error("case not handled");
    }
  }

  isFinished(): boolean {
    return this.finished;
  }

  private generateSurface(): void {
    this.surface?.delete();
    // Match degrees


    // Align directions


    // duplicate curve1 controls across pipes 


    // duplicate curve2 controls accross pipes 


    // lerp controls


    // loft

  }

  private done(): void {
    this.finished = true;
    this.clicker.destroy();
    this.pipe1?.unSelect();
    this.pipe2?.unSelect();
    this.crossSection1?.unSelect();
    this.crossSection2?.unSelect();
    if (this.surface) {
      INSTANCE.getScene().addGeometry(this.surface);
    }
  }

}
