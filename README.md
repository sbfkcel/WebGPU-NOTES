# WebGPU 学习笔记

## 将示例跑起来

```bash
# 下载或克隆本项目到本地磁盘

# 进入 example 目录
cd example

# 安装依赖
npm install

# 启动示例
npm run dev
```

## GPUAdapters
适配器，与GPU设备连接，管理资源和设备GPU队列。

## GPUDevice
设备，封装好的设备并提供设备相对应的功能，获取 `GPUDevice` 使用 `requestDevice` 方法。

## GPUQueues
队列，提供数据的写入、拷贝等操作方法，这包含：
- `writeBuffer`
- `writeTexture`
- `copyExternalImageToTexture`，将平台图像内容复制到目标纹理中
- `submit`，提交执行缓冲（提交的命令缓冲区不能再次使用）
- `onSubmittedWorkDone`，队列完成全部的提交后触发的 `Promise` 回执

## GPUBuffer
用于GPU操作的内存块，通过 `createBuffer()` 创建。

## GPUTexture
纹理或纹理视图，一张纹理由一个或多个纹理子资源组成。

## GPUCommandBuffer
命令缓冲区，即提交到 `GPUQueue` 执行的预先记录的GPU命令列表。

## GPURenderBundle
预先录制的命令包容器，命令包使用 `GPURenderBundleEncoder` 来编码，编码完成可通过 `GPURenderBundleEncoder.finnish` 方法来返回 `GPURenderBundle` 对象。

## GPUShaderModule
内部着色器模块对象的引用，使用 `device.createShaderModule` 方法来创建。

## GPUSampler
采样器，编码了变换和过滤信息，可以在着色器中使用这些信息来解释纹理资源数据。使用 `createSampler` 方法来创建。

## GPUBindGroup
定义一组要绑定在一起的资源，以及这些资源在着色器阶段的使用方式。使用 `device.createBindGroup` 方法来创建。

## GPURenderPipeline
一种管线，用于控制顶点和片段着色器阶段。可在 `GPURenderPassEndocer`、`GPURenderBundleEncoder` 中使用。

## GPUComputePipeline
一种控制计算着色器阶段的管线，可以在 `GPURenderPassEndocer` 中使用。
