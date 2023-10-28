import { mat4, Mat4, vec3, Vec3 } from "wgpu-matrix";
import { INSTANCE } from "../cad";
import { MaterialName } from "../materials/material";
import { RenderMesh } from "../render/renderMesh";
import { RenderID } from "../scene/scene";
import { BoundingBox } from "./boundingBox";
import { Geometry } from "./geometry";
import { MeshBoundingBoxHeirarchy } from "./meshBoundingBoxHeirarchy";
import { Ray } from "./ray";



export class Mesh extends Geometry {


  private renderMesh: RenderID;
  private boundingBoxHeirarchy: MeshBoundingBoxHeirarchy;

  constructor(
    parent: Geometry | null,
    private verts: Vec3[],
    private normals: Vec3[],
    private indices: number[],
    model?: Mat4,
    material: MaterialName | null = null
  ) {
    super(parent, model, material);

    const vertexBuffer: number[] = [];
    for (let i = 0; i < verts.length; i++) {
      vertexBuffer.push(...verts[i], 1, ...normals[i], 0);
    }
    this.renderMesh = INSTANCE.getScene().addRenderMesh(new RenderMesh(
      this,
      new Float32Array(vertexBuffer),
      new Int32Array(this.indices),
      this.getModel()
    ));
    this.boundingBoxHeirarchy = new MeshBoundingBoxHeirarchy(this.verts, this.indices);
  }

  public intersect(ray: Ray): number | null {
    const objectSpaceRay: Ray = Ray.transform(ray, mat4.inverse(this.getModel()));
    return this.boundingBoxHeirarchy.intersect(objectSpaceRay, this.verts);
  }

  public destroy(): void {
    INSTANCE.getScene().removeMesh(this.renderMesh);
  }

  public getBoundingBox(): BoundingBox {
    const bb: BoundingBox = new BoundingBox();
    const model: Mat4 = this.getModel();
    this.verts.forEach((vert: Vec3) => {
      bb.addVec3(vec3.transformMat4(vert, model));
    });
    return bb;
  }

}

