# WebGPU入门

随着WebGPU日益成熟，本季度将赢来WebGPU正式版本的发布。关注WebGPU开发的小伙伴也越来越多。笔者也希望边学边记录分享给大家。


## WebGPU 简介

由W3C组织定义的一个新的API标准，用于在Web上使用Javascript来控制GPU计算和绘制。该标准获得了目前所有主流厂商的支持，由大家一起参与WebGPU的发展。有望成为一个全平台支持的标准。

WebGPU拟补了过去WebGL的各种不足和背负的各种历史包袱，其主要接入现代图形API（Direct3D、Vulkman、Metal）。总之相比WebGL，其会更快、更强、更灵活，更符合Web现代的开发标准。


## WebGL与WebGPU的那些事儿

WebGL相当于是在使用十几年前的OpenGL框架体系。而OpenGL本身就已经非常古老，有将近30年历史了。WebGL仅仅只实现了OpenGL ES 2.0和3.0的标准，已经无法满足现代GPU框架体系，也无法满足现在高性能的计算和渲染需求。苹果公司在2018年宣布抛弃OpenGL整个框架。在2015年前后，苹果、微软、Khronos分别推出了基于全新GPU框架的Metal（2014年）、Direct3D 12（2015年）、Vulkan（2016年），现在三者被大家统称为为现代图形学API。W3C在制定新的Web图形学标准也完全参考了新的三个图形学API，抛弃了OpenGL的整个框架。

- WebGL1.0标准，2011 年定制，基于OpenGL ES2.0在Web上的实现
    - OpenGL ES2.0是OpenGL 2.0在移动端的具体实现
    - 相当于WebGL对标的是2004年的OpenGL的标准
- WebGL2.0标准，对标OpenGL 3.2 在2009年的实现

> [了解WebGPU发展历程 @Intel 邵嘉炜](https://www.bilibili.com/video/BV12i4y1d7KQ?spm_id_from=333.337.search-card.all.click)


## WebGPU支持现状

- Chrome Google 基于 Dawn 实现，v94-101 版本已经提供桌面端支持
- FireFox Mozilla 基于 gfx-rs 实现，Nightly Build版本支持桌面端和Android端
- Safari Apple 基于 WebKit 实现，开发者预览版支持IOS、Mac


## 开发需求

- 开发工具
    - [Chrome Canary](https://www.google.cn/intl/zh-CN/chrome/canary/)支持最新的 WebGPU API
    - [Visual Studio Code](https://code.visualstudio.com/) 对 WebGPU 相关生态支持比较完善
    - [Vite](https://vitejs.dev/) 速度上较快的编译、打包工具
- 语言
    - TypeScript 利用其类型特性来检查代码是否使用正确，节省找文档时间
    - WGSL WebGPU 新的着色器语言
    - HTML/CSS
- 环境
    - Node.js
    - npm或yarn
    - CMD/Terminal


## 工程搭建

- `yarn create vite` 创建一个项目，根据提示输入`项目名称`并选择项目模版`vanilla-ts`
- `cd 项目名称` 进入到项目目录
- `yarn` 安装依赖
- `yarn add @webgpu/types -D` 安装webgpu的类型支持
- 在 `tsconfig.json` 配置文件中为 `compilerOptions` 增加 `"types": ["vite/client", "@webgpu/types"]`
- `yarn run dev` 启动项目，根据提示在浏览器访问预览地址

> 接下来所有的代码操作入口将从 `src/main.ts` 开始


## 判断浏览器是否支持WebGPU

```typescript
// 判断WebGPU是否可用，根据定义
const gpu = navigator.gpu;
if(gpu === undefined){
    throw new Error("浏览器不支持WebGPU");
};
```