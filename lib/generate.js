const fs = require('fs')
const os = require('os')
const path = require('path')
const ejs = require('ejs')
const fse = require('fs-extra')
const mkdirpSync = fse.mkdirpSync
const chalk = require('chalk')

const logger = require('../lib/logger')
const config = require('./config') // 页面路径配置

module.exports = function(FolderName, pageName, chineseName, addModel) {
  // 文件夹首字母大写
  var FolderName = FolderName.toLowerCase()
  FolderName = FolderName.substring(0, 1).toUpperCase() + FolderName.substring(1)
  // 页面全小写
  var pageName = pageName.toLowerCase()

  // 生成模板对应的页面
  const pageFolderAbsolutePath = path.join(process.cwd(), config.pageRoot, FolderName)
  const modelsFolderAbsolutePath = path.join(process.cwd(), config.modelsRoot, FolderName)
  const servicesFolderAbsolutePath = path.join(process.cwd(), config.servicesRoot, FolderName)
  const mockFolderAbsolutePath = path.join(process.cwd(), config.mockRoot)
  // 若该页面文件夹已经存在 提示重新输入,没有则新建
  if (fs.existsSync(pageFolderAbsolutePath)) {
    logger.error(`页面文件夹【${pageFolderAbsolutePath}】已经存在,请输入一个新页面文件夹`)
  }

  // 以第一个参数的名字创建页面文件夹
  mkdirpSync(pageFolderAbsolutePath)

  if (addModel) {
    // 创建models、services下的目录
    mkdirpSync(modelsFolderAbsolutePath)
    mkdirpSync(servicesFolderAbsolutePath)
  }

  const dvaTemplatePath = path.resolve(__dirname, '../page_templates')
  const dvaTpls = fs.readdirSync(dvaTemplatePath)


  for (var i in dvaTpls) {
    var output = (`${pageFolderAbsolutePath}/${dvaTpls[i]}`).replace('[name]', pageName).replace('.ejs', '')

    if (dvaTpls[i].indexOf('[models_name]') !== -1) {
      // models的输出 不需要添加models则跳出循环
      if (!addModel) continue
      output = (`${modelsFolderAbsolutePath}/${dvaTpls[i]}`).replace('[models_name]', pageName).replace('.ejs', '')
    } else if (dvaTpls[i].indexOf('[services_name]') !== -1) {
      // services的输出 不需要添services则跳出循环
      if (!addModel) continue
      output = (`${servicesFolderAbsolutePath}/${dvaTpls[i]}`).replace('[services_name]', pageName).replace('.ejs', '')
    } else if (dvaTpls[i] === 'mock') {
      // 增加mock 数据   拷贝到mock/api 下

      if (!addModel) continue
      const mockFolder = pageName

      // 判断是否存在mock/api/newpage文件夹
      const mockDest = path.join(mockFolderAbsolutePath, mockFolder)
      if (!fs.existsSync(mockDest)) {
        //   最终装mock数据的文件夹
        const mockFileFolder = path.join(mockFolderAbsolutePath, mockFolder, mockFolder)

        fse.copySync(path.resolve(__dirname, '../page_templates', 'mock'), mockFileFolder)
        const mockTpkPath = path.resolve(__dirname, '../page_templates/mock')
        const mockTpls = fs.readdirSync(mockTpkPath)
        for (var i in mockTpls) {
          logger.success(`  🎉  成功创建【${mockFileFolder}/${mockTpls[i]}】`)
        }

      } else {
        logger.tips(chalk.blue(`mock文件夹【${mockDest}】已经存在，不能重复创建`))
      }
      // 拷贝完成跳出循环
      continue
    }


    let entry = path.resolve(__dirname, `../page_templates/${dvaTpls[i]}`)
    const template = fs.readFileSync(entry, 'utf-8')

    let result = ejs.render(template, {
      FolderName: FolderName,
      pageName: pageName.toLowerCase(),
      chineseName: chineseName,
      author: os.userInfo().username, // 作者
      time: getTime() // 文件生成时间
    })

    fs.writeFileSync(output, result)
    // 输出创建成功的文件
    logger.success(`  🎉  成功创建【${output}】`)
  }
  // 自动配置路由 菜单
  generateMenuAndRouter(config, FolderName, pageName, chineseName)
  if (!addModel) {
    // generatePagedone(pageFolderAbsolutePath, FolderName, pageName)
  } else {
    // generatePageAndModelsdone(pageFolderAbsolutePath, modelsFolderAbsolutePath, servicesFolderAbsolutePath, FolderName, pageName)
  }
}

function getTime() {
  let date = new Date()
  let YYYY = date.getFullYear()
  let MM = date.getMonth() + 1
  let DD = date.getDate()

  let hh = date.getHours()
  let mm = date.getMinutes()
  let ss = date.getSeconds()

  MM = MM < 10 ? ('0' + MM) : MM
  DD = DD < 10 ? ('0' + DD) : DD
  hh = hh < 10 ? ('0' + hh) : hh
  mm = mm < 10 ? ('0' + mm) : mm
  ss = ss < 10 ? ('0' + ss) : ss

  return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss} `
}

function generateMenuAndRouter(config, FolderName, pageName, chineseName) {
  // 通过标记自动配置路由
  const replaceFlag = config.replaceFlag
  const menuAndRouterMap = [
    // mock/api/user/menu.js

    `
    ${replaceFlag}
    {
      'name': '${chineseName}',
      'icon': 'hdd',
      'path': '${FolderName.toLowerCase()}',
      'children': [{
        'name': '${chineseName}',
        'path': '${pageName}'
      }]
    },`,

    // src/common/menu.js

    `
    ${replaceFlag}
    {
      name: '${chineseName}',
      icon: 'hdd',
      path: '${FolderName.toLowerCase()}',
      children: [{
        name: '${chineseName}',
        path: '${pageName}'
      }]
    },`,

    // src/common/router.js

    `
    ${replaceFlag}
    '/${FolderName.toLowerCase()}': {
      component: dynamicWrapper(app, ['${FolderName}/${pageName}'], () =>
        import ('../routes/${FolderName}/List'))
    },
    '/${FolderName.toLowerCase()}/${pageName}': {
      component: dynamicWrapper(app, ['${FolderName}/${pageName}'], () =>
        import ('../routes/${FolderName}/${pageName}'))
    },`
  ]


  const mockMenuFilePath = path.join(process.cwd(), config.mockMenuFile)
  const commonMenuFilePath = path.join(process.cwd(), config.commonMenuFile)
  const mcommonRouterFilePath = path.join(process.cwd(), config.commonRouterFile)

  const filePathArr = [mockMenuFilePath, commonMenuFilePath, mcommonRouterFilePath]
  for (var i in filePathArr) {
    if (fs.existsSync(filePathArr[i])) {
      let sourceFile = fs.readFileSync(filePathArr[i], 'utf-8')
      let destFile = sourceFile.replace(config.replaceFlag, menuAndRouterMap[i])
      fs.writeFileSync(filePathArr[i], destFile)

    } else {
      logger.tips(chalk.blue(`项目目录确少文件【${filePathArr[i]}】无法自动创建路由表，请手动配置`))
    }
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