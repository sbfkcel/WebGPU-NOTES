// 以纯文本的形式引入 ?raw 非标准定义，这里使用到了vite的一些特性
import vertex from "./shaders/triangle.vert.wgsl?raw";
import frag from "./shaders/red.frag.wgsl?raw";

/**
 * 初始化WebGPU
 * @param canvas 
 * @returns object
 */
const initWebGPU = async (canvas:HTMLCanvasElement)=>{
    if(!navigator.gpu){
        throw new Error("不支持WebGPU");
    };

    // 根据定义adapter是浏览器对WebGPU的抽象代理，并不能拿它去操作GPU进行绘制或计算
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference:'high-performance'
    });

    if(!adapter){
        throw new Error("获取WebGPU抽象代理失败");
    };

    // 打印当前浏览器支持的额外扩展功能
    adapter.features.forEach(item => {
        console.log("当前浏览器支持的扩展功能",item);
    });

    // 需要从adpater中请求一个具体的逻辑实例，该实例则是可以被JS控制来操作GPU的具体对象了
    const device = await adapter?.requestDevice({
        // 可选参数，添加要申请的功能
        requiredFeatures:['texture-compression-bc'],

        // 可选参数，修改允许的Buffer最大值为浏览器允许的最大值
        requiredLimits:{
            maxStorageBufferBindingSize:adapter.limits.maxStorageBufferBindingSize
        }
    });

    console.log("adapter 和 device",adapter,device);

    // 继续配置画布，获得一个可以被JS操作的基于WebGPU的逻辑画布
    const context = canvas.getContext('webgpu');
    if(!context){
        throw new Error("获取WebGPU逻辑画布失败");
    };

    // WebGPU支持非常多的颜色格式，一般直接通过API来获取浏览器默认的颜色选项即可
    const format = context.getPreferredFormat(adapter);

    // 一般情况下是 'bgra8unorm'，简单来说就是常用的0-255的rgba排列方式，只不过都将数据以0-1的小数作为表示
    console.log("浏览器首选格式",format)

    // 对画布进行配置
    context.configure({
        // 必选参数
        device,

        // 必选参数，WebGPU支持非常多的颜色格式，通常推荐使用API来获取当前首选的格式比较稳妥
        format,

        // 可选参数，通常情况下，不会直接使用canvas的默认大小，而是会根据canvas实际大小来进行设置
        size:[
            canvas.clientWidth * window.devicePixelRatio,
            canvas.clientHeight * window.devicePixelRatio
        ],

        // 可选参数，Chrome 102开始默认为 'opaque' 即不透明选项 
        compositingAlphaMode:'opaque'
    });

    return {adapter, device, context, format};
};

/**
 * 初始化渲染管线
 * @param device 
 * @param format 
 */
const initPipeline = async (device:GPUDevice, format:GPUTextureFormat)=>{
    // 声明顶点数据
    const vertexData = new Float32Array([
        // xyz
        0,0.5,0,
        -0.5,-0.5,0,
        0.5,-0.5,0
    ]);

    // 在GPU中创建一个Buffer
    const vertexBuffer = device.createBuffer({
        // buffer字节大小，Float32Array一个数字占4个字节，所以是 9*4。也可直接调用 byteLength 获取
        size:vertexData.byteLength,
        // 设置 Buffer 用途，这里选择为 VERTEX 即可
        usage:GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    // 创建顶点着色器
    const vertexShader = device.createShaderModule({
        code: vertex
    });
    // 创建片元着色器
    const fragmentShader = device.createShaderModule({
        code: frag
    });
    // 创建渲染管线(通常情况下会需要创建多个渲染管线，可能需要用到的 Buffer、Group、贴图等)
    const pipeline = await device.createRenderPipelineAsync({
        vertex:{
            // 传入顶点着色器程序
            module: vertexShader,

            // 告诉管线该Shader程序的入口函数是什么
            entryPoint:'main',
            
            // 该参数表明 pipeline 可以传入几个顶点数据。目前的 WebGPU 最多支持8个，这里的数量要和 setVertexBuffer() 的个数相对应
            buffers:[{
                // 也就是传入的vertex buffer要以多大的数据量作为切分成为一个顶点数据传入 vertex shader
                // 这里的三角形以每三个数据作为一个顶点，所以对应的就是以3数字分为一个切分
                arrayStride:3 * 4,
            
                // 通过设置attributes可以对参数进行精细的划分，可以将xy、z或是x、y、z拆开传入
                // 实际场景中可能包括 position、uv、normal 等信息，可以分开传入，也可以混合在一个 buffer 里传入
                attributes:[
                    // 传入xy坐标
                    {
                        // 与 shader 中接收参数对应，这里为 0 ,在 shader 中则用 @location(0) 接收
                        shaderLocation:0,
                        // 为 0 即从头开始
                        offset:0,
                        // 标示参数的长度大小，这里只是xy，所以是 float32x2
                        format:'float32x2'
                    },
                    // 只传入z坐标
                    {
                        // 与 shader 中接收参数对应，这里为 1 ,在 shader 中则用 @location(1) 接收
                        shaderLocation:1,
                        // 为 2 即从第三个开始
                        offset:2*4,
                        // 标示参数的长度大小，这里只是z，所以是 float32
                        format:'float32'
                    }
                ]
            }]
        },
        fragment:{
            // 传入片元着色器程序
            module: fragmentShader,

            // 告诉管线该Shader程序的入口函数是什么
            entryPoint:'main',

            // 表明输出的颜色格式是什么。因为片元着色器输出的是每个像素点的颜色，WebGPU又支持很多的颜色格式。
            // 所以这里需要告诉GPU管线，在对应的Shader中使用的到底是哪种颜色格式，并且这种格式要跟设置画面的格式能够匹配，否则将无法正常显示
            targets:[{format}]
        },

        // 绘图方式，默认：triangle-list 
        primitive:{
            topology:'triangle-list'
        }
    });

    // 将 CPU 的中数据写入到 GPU 中，将 JS 中的 TypedArray 直接拷贝给 GPUBuffer
    device.queue.writeBuffer(vertexBuffer,0*4,vertexData);

    // 声明颜色（RGBA相对应的0~1数值）
    const colorData = new Float32Array([1,1,0,1]);

    // 创建在CPU中存储颜色的Buffer
    const colorBuffer = device.createBuffer({
        // RGBA颜色即 4*4
        size:colorData.byteLength,
        // 这里不再是顶点数据，而是作为通用buffer，在WebGPU中有两种数据
        // - UNIFORM 适合一般只读的小数据，最大64KB，在Shader中只可读，不能修改
        // - STORAGE 可以非常大，最大支持2GB，在Shader中可修改
        usage:GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    
    // 将颜色数据写入到GPU中
    device.queue.writeBuffer(colorBuffer,0,colorData);

    // 创建一个 group
    const group = device.createBindGroup({
        // 用来说明绑定到 pipeline 的位置布局，由于目前只有一个 group ，所以使用 0 位置的布局即可
        layout:pipeline.getBindGroupLayout(0),
        // 它是一个数组，可以添加多个资源（如果有多个资源可依次传入）
        entries:[
            {
                // 每个资源要指定绑定的位置，这里只有一个 buffer，所以位置是 0
                binding:0,
                // 指明具体用到了哪个资源，将 colorBuffer 传入即可
                resource:{
                    buffer:colorBuffer
                }
            }
        ]
    });

    const colorObj = {colorData,colorBuffer,group};
    const vertexObj = {vertexData,vertexBuffer,vertexCount:3};
    return {pipeline,vertexObj,colorObj};
};

const draw = (device:GPUDevice, pipeline:GPURenderPipeline, context:GPUCanvasContext, vertexObj:any, colorObj:any)=>{

    // 创建一个encoder对象
    const encoder = device.createCommandEncoder();

    // 这里 pass 或者通道的概念类似于图层
    const renderPass = encoder.beginRenderPass({
        colorAttachments:[{
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            storeOp: 'store',
            clearValue: {r:0,g:0,b:0,a:1}
        }]
    });
    renderPass.setPipeline(pipeline);

    // 向第 0 个通道中设置 vertexBuffer 数据
    renderPass.setVertexBuffer(0, vertexObj.vertexBuffer);

    // 将 group 绑定到对应的 pipeline 上。注意：位置要和 group 中设置的 layout 一致
    renderPass.setBindGroup(0,colorObj.group);
    
    // 设置 pipeline 中的 vertex shader 会被并行的次数
    renderPass.draw(vertexObj.vertexCount);

    // 结束通道录制
    renderPass.end();

    // 结束录制，得到buffer
    const buffer = encoder.finish();

    // 提交buffer 到 GPU
    device.queue.submit([buffer]);
};

const fun = async()=>{
    // 创建canvas对象将添加到浏览器中
    const oApp = document.getElementById('app');
    const canvas = document.createElement('canvas');
    const operate = document.createElement('div');
    canvas.width = 800;
    canvas.height = 800;
    operate.id = 'operate';
    oApp?.appendChild(canvas);
    oApp?.appendChild(operate);

    const {device, context, format} = await initWebGPU(canvas);
    const {pipeline, vertexObj, colorObj} = await initPipeline(device,format);

    // 颜色控制
    const color = document.createElement('input');
    color.type = 'color';
    color.value = '#ffff00';
    operate?.appendChild(color);
    color.addEventListener('input',(e)=>{
        const color = (e.target as HTMLInputElement).value;
        const r = +('0x'+color.slice(1,3)) / 255;
        const g = +('0x'+color.slice(3,5)) / 255;
        const b = +('0x'+color.slice(5,7)) / 255;
        console.log("颜色",color,r,g,b);
        colorObj.colorData[0] = r;
        colorObj.colorData[1] = g;
        colorObj.colorData[2] = b;
        // 将新的数据写入到 vertexBuffer 中并重新绘制当前图形
        device.queue.writeBuffer(colorObj.colorBuffer,0,colorObj.colorData);
        draw(device, pipeline, context, vertexObj, colorObj);
    });

    // 位置控制
    const range = document.createElement('input');
    range.type = 'range';
    range.setAttribute('min','-0.5');
    range.setAttribute('step','0.0001');
    range.setAttribute('max','0.5');
    operate?.appendChild(range);
    range.addEventListener('input',(e)=>{
        const value = +(e.target as HTMLInputElement).value;
        console.log("位置",value);
        vertexObj.vertexData[0] = 0 + value;
        vertexObj.vertexData[3] = -0.5 + value;
        vertexObj.vertexData[6] = 0.5 + value;
        // 将新的数据写入到 vertexBuffer 中并重新绘制当前图形
        device.queue.writeBuffer(vertexObj.vertexBuffer,0,vertexObj.vertexData);
        draw(device, pipeline, context, vertexObj, colorObj);
    });
    
    draw(device, pipeline, context, vertexObj, colorObj);
};

export default fun;