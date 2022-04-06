// 判断是否支持WebGPU
const fun = async()=>{
    const gpu = navigator.gpu;
    if(gpu === undefined){
        throw new Error("浏览器不支持WebGPU");
    };
  
    const oApp = document.getElementById('app');
    if(oApp){
        oApp.innerHTML = "恭喜，浏览器支持WebGPU";
    };
};

export default fun;