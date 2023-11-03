import { vec3, Vec3 } from "wgpu-matrix";
import { ObjectID } from "../scene/scene";
import { BoundingBox } from "./boundingBox";
import { Intersection } from "./intersection";
import { Lines } from "./lines";
import { Ray } from "./ray";

enum Axis {
  X = 0,
  Y = 1,
  Z = 2
}

class LineBoundingBoxHeirarchyNode {

  private indices!: number[] | null;
  private child1!: LineBoundingBoxHeirarchyNode | null;
  private child2!: LineBoundingBoxHeirarchyNode | null;
  private boundingBox!: BoundingBox;
  private axis!: Axis;

  constructor(
    private id: ObjectID,
    verts: Vec3[],
    indices: number[],
    private depth: number = 0
  ) {
    this.setup(verts, indices);
  }

  private setup(verts: Vec3[], indices: number[]): void {
    this.axis = this.depth % 3;
    this.boundingBox = new BoundingBox();
    var average: Vec3 = vec3.create(0, 0, 0);
    for (let index of indices) {
      this.boundingBox.addVec3(verts[index]);
      average = vec3.add(average, verts[index]);
    }
    average = vec3.scale(average, 1 / indices.length);

    if (indices.length / 2 <= LineBoundingBoxHeirarchy.MAX_LINES_PER_LEAF) {
      // leaf
      this.indices = indices;
      this.child1 = null;
      this.child2 = null;
    } else {
      // non leaf
      this.indices = null;

      var child1Indices: number[] = [];
      var child2Indices: number[] = [];


      for (let i = 0; i < indices.length; i += 2) {
        const lineCenter = vec3.scale(
          vec3.add(
            verts[indices[i]],
            verts[indices[i + 1]]
          ), 0.5);
        if (lineCenter[this.axis] < average[this.axis]) {
          child1Indices.push(indices[i], indices[i + 1]);
        } else {
          child2Indices.push(indices[i], indices[i + 1]);
        }
      }

      this.child1 = new LineBoundingBoxHeirarchyNode(this.id, verts, child1Indices, this.depth + 1);
      this.child2 = new LineBoundingBoxHeirarchyNode(this.id, verts, child2Indices, this.depth + 1);
    }
  }

  public almostIntersect(ray: Ray, verts: Vec3[], pixels: number): Intersection | null {

    if (ray.almostIntersectBoundingBox(this.boundingBox, pixels) === null) return null;

    if (this.isLeaf()) {
      // time, dist
      var res: [number, number, Vec3] | null = null;
      for (let i = 0; i < this.indices!.length; i += 2) {
        var t: [number, number, Vec3] | null = ray.almostIntersectLine(verts[this.indices![i]], verts[this.indices![i + 1]], pixels);
        if (t !== null) {
          if (res === null) res = t;
          else res = (res[0] < t[0]) ? res : t;
        }
      }
      if (res === null) return null;
      return new Intersection(res[0], "line", this.id, res[2], res[1]);
    } else {
      const t1 = this.child1!.almostIntersect(ray, verts, pixels);
      const t2 = this.child2!.almostIntersect(ray, verts, pixels);
      if (t1 === null) return t2;
      if (t2 === null) return t1;
      return (t1.time < t2.time) ? t1 : t2;
    }
  }

  public isLeaf(): boolean {
    return this.indices !== null;
  }

  public print(): void {
    let str: string = "";
    for (let i = 0; i < this.depth; i++) str += "->";
    if (this.indices) str += `${this.indices.length / 2}lines`;
    else str += "node";
    console.log(str);
    this.child1?.print();
    this.child2?.print();
  }

}

export class LineBoundingBoxHeirarchy {

  public static readonly MAX_LINES_PER_LEAF = 5;

  private root: LineBoundingBoxHeirarchyNode;

  constructor(id: ObjectID, verts: Vec3[], indices: number[]) {
    // remove degenerate edges, they can cause infinite loop.
    let reducedIndices: number[] = [];
    for (let i = 0; i < indices.length; i += 2) {
      const a: Vec3 = verts[indices[i]];
      const b: Vec3 = verts[indices[i + 1]];
      if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) {
        reducedIndices.push(indices[i], indices[i + 1]);
      }
    }
    this.root = new LineBoundingBoxHeirarchyNode(id, verts, reducedIndices);
  }

  public print(): void {
    console.log("========Line-BBH========");
    this.root.print();
  }

  public almostIntersect(ray: Ray, verts: Vec3[], pixels: number): Intersection | null {
    return this.root.almostIntersect(ray, verts, pixels);
  }
}
