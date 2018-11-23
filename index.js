// 一个小命令行工具 使用ejs模板快速生成代码块插入到指定位置

const fs = require('fs');
const path = require('path');
const ejs = require('ejs')

// 输出文件配置项 
const config = {
    outputPath: '',
    outputName: ''
}

// 模板内容配置  参数可以从命令行获取

const name = 'test' // 文件名
const pkgname = 'zhanghaoyu 00' // 文件名

// 模板内容  可以自定义
let entry = "./page_templates/[name].js.ejs";
const template = fs.readFileSync(entry, "utf-8");


let result = ejs.render(template, {
    pkgname: pkgname
})

// 创建文件夹
if (!fs.existsSync("dist")) {
    fs.mkdirSync("./dist/")
    console.log('创建文件夹')
}

// 写入文件内容
let output = "./dist/[name].js".replace("[name]", name);
// fs.writeFileSync(output, result)

// test 修改文件内容
// const modifyJS = fs.readFileSync('./modify.js', "utf-8");
// const index = modifyJS.lastIndexOf(']')
// _modifyJS = modifyJS.substring(0, index)
// console.log(index)
// fs.writeFileSync('./modify.js', _modifyJS +
//     `
// , {
//     a: 3,
//     name: '333'
// }]

// export default data;
// `)

// test 修改文件内容
const modifyJS = fs.readFileSync('./menu.js', "utf-8");
const index = modifyJS.lastIndexOf(']')
const index1 = modifyJS.lastIndexOf(',]')
_modifyJS = modifyJS.substring(0, index)
console.log(index, index1)
fs.writeFileSync('./menu.js', _modifyJS +
    `
, {
    a: 3,
    name: '333'
}]

export default data;
`)

/*// 同步创建多层文件夹
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        console.log(path.dirname(dirname))
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

mkdirsSync('hello/a/b/c/d.js')
// 写入文件
fs.writeFileSync("hello/a/b/c/d.js/[name].js", 'result')
// 删除文件
fs.unlink("hello/a/b/c/d.js/[name].js", () => {
    console.log('删除成功')
});*/