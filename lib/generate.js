const fs = require('fs');
const os = require('os');
const path = require('path')
const ejs = require('ejs')
const mkdirpSync = require('fs-extra').mkdirpSync;
const chalk = require('chalk');

const logger = require('../lib/logger');
const config = require('./config'); //页面路径配置

module.exports = function(FolderName, pageName, chineseName, addModel) {
    // 生成模板对应的页面
    const pageFolderAbsolutePath = path.join(process.cwd(), config.pageRoot, FolderName);
    const modelsFolderAbsolutePath = path.join(process.cwd(), config.modelsRoot, FolderName);
    const servicesFolderAbsolutePath = path.join(process.cwd(), config.servicesRoot, FolderName);

    // 若该页面文件夹已经存在 提示重新输入,没有则新建
    if (fs.existsSync(pageFolderAbsolutePath)) {
        logger.error(`页面文件夹【${pageFolderAbsolutePath}】已经存在,请输入一个新页面文件夹`)
    }

    // 以第一个参数的名字创建页面文件夹
    mkdirpSync(pageFolderAbsolutePath);

    if (addModel) {
        // 创建models、services下的目录
        mkdirpSync(modelsFolderAbsolutePath);
        mkdirpSync(servicesFolderAbsolutePath);
    }


    const dvaTemplatePath = path.resolve(__dirname, '../page_templates')
    const dvaTpls = fs.readdirSync(dvaTemplatePath)
    for (var i in dvaTpls) {
        var output = (`${pageFolderAbsolutePath}/${dvaTpls[i]}`).replace("[name]", pageName).replace(".ejs", '');

        if (dvaTpls[i].indexOf('[models_name]') !== -1) {
            // models的输出 不需要添加models则跳出循环
            if (!addModel) continue
            output = (`${modelsFolderAbsolutePath}/${dvaTpls[i]}`).replace("[models_name]", pageName).replace(".ejs", '');
        } else if (dvaTpls[i].indexOf('[services_name]') !== -1) {
            // services的输出 不需要添services则跳出循环
            if (!addModel) continue
            output = (`${servicesFolderAbsolutePath}/${dvaTpls[i]}`).replace("[services_name]", pageName).replace(".ejs", '');
        }

        let entry = path.resolve(__dirname, `../page_templates/${dvaTpls[i]}`)
        const template = fs.readFileSync(entry, "utf-8");
        let result = ejs.render(template, {
            pageName: pageName,
            chineseName: chineseName,
            author: os.userInfo().username, //作者
            time: getTime() // 文件生成时间
        })

        fs.writeFileSync(output, result)
        // 输出创建成功的文件
        logger.success(`  🎉  成功创建【${output}】`)
    }

    if (!addModel) {
        generatePagedone(pageFolderAbsolutePath, FolderName, pageName)
    } else {
        generatePageAndModelsdone(pageFolderAbsolutePath, modelsFolderAbsolutePath, servicesFolderAbsolutePath, FolderName, pageName)
    }

}

function generatePagedone(pageFolderAbsolutePath, FolderName, pageName) {
    logger.tips()
    logger.tips(chalk.blue('  新增文件列表如下  👇   请刷新项目目录查看~'))
    logger.success(`
    .
    └── src
        └── routes
            └── ${FolderName}
                ├── List.js  
                ├── ${pageName}.js  
                └── ${pageName}.module.less
        `)
}

function generatePageAndModelsdone(pageFolderAbsolutePath, modelsFolderAbsolutePath, servicesFolderAbsolutePath, FolderName, pageName) {
    logger.tips()
    logger.tips(chalk.blue('  新增文件列表如下  👇   请刷新项目目录查看~'))
    logger.success(`
    .
    └── src
        ├── models
        │   └── ${FolderName}
        │       └── ddd.js
        ├── routes
        │   └── ${FolderName}
        │       ├── List.js
        │       ├── ${pageName}.js
        │       └── ${pageName}.module.less
        └── services
            └── ${FolderName}
                └── ddd.js
        `)
}

function getTime() {
    let date = new Date();
    let YYYY = date.getFullYear();
    let MM = date.getMonth() + 1;
    let DD = date.getDate();

    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();

    MM = MM < 10 ? ('0' + MM) : MM;
    DD = DD < 10 ? ('0' + DD) : DD;
    hh = hh < 10 ? ('0' + hh) : hh;
    mm = mm < 10 ? ('0' + mm) : mm;
    ss = ss < 10 ? ('0' + ss) : ss;

    return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss} `
}