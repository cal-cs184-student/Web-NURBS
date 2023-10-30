import { Mat4, mat4, Vec3 } from "wgpu-matrix"
import { INSTANCE } from "../cad"
import { Geometry } from "../geometry/geometry";

export class RenderPoints {

  private static readonly vertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 16,
    attributes: [
      { // location
        format: "float32x4",
        offset: 0,
        shaderLocation: 0,
      }
    ]
  };

  private bindGroup!: GPUBindGroup;

  private modelBuffer: GPUBuffer;

  private flags: Int32Array;
  private flagsBuffer: GPUBuffer;

  private vertexBuffer: GPUBuffer;
  private vertexCount: number;

  constructor(
    private parent: Geometry,
    points: Vec3[],
    private model: Mat4 = mat4.identity()
  ) {

    // vertex
    const verts: number[] = [];
    for (let i = 0; i < points.length; i++) verts.push(...points[i], 1);
    const vertexArray: Float32Array = new Float32Array(verts);
    this.vertexBuffer = INSTANCE.getRenderer().getDevice().createBuffer({
      label: "points vertex buffer",
      size: vertexArray.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    INSTANCE.getRenderer().getDevice().queue.writeBuffer(this.vertexBuffer, 0, vertexArray);
    this.vertexCount = vertexArray.length / 4;

    //mvp
    this.modelBuffer = INSTANCE.getRenderer().getDevice().createBuffer({
      label: "mvp",
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    //flags
    this.flagsBuffer = INSTANCE.getRenderer().getDevice().createBuffer({
      label: "render points flags buffer",
      size: 4,
      usage: GPUBufferUsage.UNIFORM
    });
    this.flags = new Int32Array([0]);

    this.update();
  }

  public draw(pass: GPURenderPassEncoder): void {
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(this.vertexCount);
  }

  public update(): void {
    this.updateFlags();
    this.updateModel();
    this.updateBindGroup();
  }

  private updateFlags(): void {
    INSTANCE.getRenderer().getDevice().queue.writeBuffer(this.flagsBuffer, 0, this.flags);
  }

  private updateModel(): void {
    INSTANCE.getRenderer().getDevice().queue.writeBuffer(this.modelBuffer, 0, <Float32Array>this.model);
  }

  private updateBindGroup(): void {
    this.bindGroup = INSTANCE.getRenderer().getDevice().createBindGroup({
      label: "points bind group",
      layout: INSTANCE.getRenderer().getBindGroupLayout(),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.modelBuffer },
        }, {
          binding: 1,
          resource: { buffer: this.parent.getColorBuffer() },
        }, {
          binding: 2,
          resource: { buffer: this.flagsBuffer }
        }
      ]
    });
  }

  public static getVertexBufferLayout(): GPUVertexBufferLayout {
    return RenderPoints.vertexBufferLayout;
  }

}
