import { Mat4, mat4, vec4, Vec4 } from "wgpu-matrix"
import { INSTANCE } from "../cad"
import { Geometry } from "../geometry/geometry";
import { Material, MaterialName } from "../materials/material";
import { swizzleYZ } from "../utils/math";

export class RenderLines {

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


  private vertexBuffer: GPUBuffer;
  private indexBuffer: GPUBuffer;
  private bindGroup!: GPUBindGroup;
  private mvp: Float32Array;
  private mvpBuffer: GPUBuffer;
  private indexCount: number;

  constructor(
    private parent: Geometry,
    vertices: Float32Array,
    indices: Int32Array,
    private model: Mat4 = mat4.identity(),
    private material: MaterialName = "default"
  ) {

    // vertex
    this.vertexBuffer = INSTANCE.getRenderer().getDevice().createBuffer({
      label: "vertex buffer",
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    INSTANCE.getRenderer().getDevice().queue.writeBuffer(this.vertexBuffer, 0, vertices);

    //index
    this.indexBuffer = INSTANCE.getRenderer().getDevice().createBuffer({
      label: "index buffer",
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    INSTANCE.getRenderer().getDevice().queue.writeBuffer(this.indexBuffer, 0, indices);
    this.indexCount = indices.length;

    //mvp
    this.mvpBuffer = INSTANCE.getRenderer().getDevice().createBuffer({
      label: "mvp",
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.mvp = new Float32Array(16);

  }

  public draw(pass: GPURenderPassEncoder): void {
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.setIndexBuffer(this.indexBuffer, "uint32");
    pass.drawIndexed(this.indexCount);
  }

  public update(): void {
    this.updateMVP();
    this.updateBindGroup();
  }

  private updateMVP(): void {
    mat4.mul(INSTANCE.getScene().getCamera().getViewProj(), this.model, this.mvp);
    INSTANCE.getRenderer().getDevice().queue.writeBuffer(this.mvpBuffer, 0, this.mvp);
  }

  private updateBindGroup(): void {
    const mat: Material = INSTANCE.getMaterialManager().getMaterial(this.material)!;
    this.bindGroup = INSTANCE.getRenderer().getDevice().createBindGroup({
      label: "bind group",
      layout: INSTANCE.getRenderer().getBindGroupLayout(),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.mvpBuffer },
        }, {
          binding: 1,
          resource: { buffer: this.parent.getColorBuffer() },
        }
      ]
    });
  }

  public static getVertexBufferLayout(): GPUVertexBufferLayout {
    return RenderLines.vertexBufferLayout;
  }

}
