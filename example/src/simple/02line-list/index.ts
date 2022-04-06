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
            entryPoint:'main'
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
            topology:'line-list'
        }
    });
    return {pipeline};
};

const draw = (device:GPUDevice, pipeline:GPURenderPipeline, context:GPUCanvasContext)=>{

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

    // 由于这个例子中的pipeline是写死的数据，都不需要再引用其它外部数据了，所以这里也不再需要设置其它资源
    // 可以直接调用 renderPass 中的 draw API直接运行管线就可以了
    // 这里是画一个三角形，有三个顶点，也就是说期望 vertex shader 运行三次，输出三个顶点信息。所以这里传入 3 即可
    // 对应的也就是 pipeline 中的 vertex shader 会被并行运行三次
    renderPass.draw(3);

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
    canvas.width = 800;
    canvas.height = 800;
    oApp?.appendChild(canvas);

    const {device, context, format} = await initWebGPU(canvas);
    const {pipeline} = await initPipeline(device,format);
    draw(device, pipeline, context);
};

export default fun;