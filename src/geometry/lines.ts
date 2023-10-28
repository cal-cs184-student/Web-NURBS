import { mat4, Mat4, vec3, Vec3 } from "wgpu-matrix";
import { INSTANCE } from "../cad";
import { MaterialName } from "../materials/material";
import { RenderLines } from "../render/renderLines";
import { RenderID } from "../scene/scene";
import { BoundingBox } from "./boundingBox";
import { Geometry } from "./geometry";
import { LineBoundingBoxHeirarchy } from "./lineBoundingBoxHeirarchy";
import { Ray } from "./ray";

export class Lines extends Geometry {

  private renderLines!: RenderID;
  private boundingBox!: BoundingBox;
  private boundingBoxHeirarchy!: LineBoundingBoxHeirarchy;

  constructor(
    private points: Vec3[],
    private indices: number[],
    parent: Geometry | null = null,
    model: Mat4 = mat4.identity(),
    material: MaterialName | null = null
  ) {
    super(parent, model, material);
    this.renderLines = 0;
    this.update();
  }

  public intersect(ray: Ray): number | null {
    return this.boundingBoxHeirarchy.almostIntersect(ray, this.points, 3);
  }

  public getBoundingBox(): BoundingBox {
    return this.boundingBox;
  }

  public getSegmentCount(): number {
    return this.indices.length / 2;
  }

  public delete(): void {
    INSTANCE.getScene().removeLines(this.renderLines);
  }

  private update(): void {
    if (this.renderLines) INSTANCE.getScene().removeLines(this.renderLines);
    const verts: number[] = [];
    for (let i = 0; i < this.points.length; i++) {
      verts.push(...this.points[i], 1.0);
    }
    this.renderLines = INSTANCE.getScene().addRenderLines(new RenderLines(
      new Float32Array(verts),
      new Int32Array(this.indices),
      this.getModel()));

    this.updateBoundingBox();
    this.boundingBoxHeirarchy = new LineBoundingBoxHeirarchy(this.points, this.indices);
  }

  private updateBoundingBox(): void {
    this.boundingBox = new BoundingBox();
    const model: Mat4 = this.getModel();
    this.points.forEach((point: Vec3) => {
      this.boundingBox.addVec3(vec3.transformMat4(point, model));
    });
  }
}
