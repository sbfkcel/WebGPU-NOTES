import "./style.css"

(async()=>{
    // 处理默认页面路径
    if(location.pathname === '/'){
        location.pathname = "/01";
    };

    // 生成菜单
    const oMenu = document.getElementById('menu');
    const menuList = [
        {
            name:"01 检查是否支持WebGPU",
            path:'/01'
        },
        {
            name:"02 绘制三角形",
            path:'/02'
        },
        {
            name:"02 理解point-list",
            path:'/02point-list'
        },
        {
            name:"02 理解line-list",
            path:'/02line-list'
        },
        {
            name:"02 理解line-strip",
            path:'/02line-strip'
        },
        {
            name:"02 理解triangle-list",
            path:'/02triangle-list'
        },
        {
            name:"02 理解triangle-strip",
            path:'/02triangle-strip'
        },
        {
            name:"03 动态资源绑定",
            path:'/03'
        },
        {
            name:"03 理解参数精细拆分01",
            path:'/03attributes-01'
        },
        {
            name:"03 理解参数精细拆分02",
            path:'/03attributes-02'
        }
    ];
    menuList.forEach(item => {
        let link = document.createElement('a');
        link.innerHTML = item.name;
        link.href = item.path;
        if(location.pathname === item.path){
            link.className = 'current';
        };
        oMenu?.appendChild(link);
    });

    // 根据路径加载对应模块
    const moduleName = location.pathname.slice(1);
    let module = (await import(`./simple/${moduleName}/index.ts`)).default;
    module().then((...args: any) => {
        console.log("运行成功");
    }).catch((err:Error) => {
        throw err;
    });
})()