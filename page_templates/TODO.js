//待办事项：想要直接 启动整个应用 需要在以下js文件里边补充以下js
// 其中page12 分别代表folder的小写 和 pageName 的小写

// mock/api/user/menu.js
{
    'name': '新的页面12',
    'icon': 'hdd',
    'path': 'page12',
    'children': [{
        'name': '新的页面12',
        'path': 'page12'
    }]
}


// common/menu.js

{
    name: '新的页面12',
    icon: 'hdd',
    path: 'page12',
    children: [{
        name: '新的页面12',
        path: 'page12'
    }]
}

// common/router.js

'/page12': {
    component: dynamicWrapper(app, ['Page12/page12'], () =>
        import ('../routes/Page12/List'))
},
'/page12/page12': {
    component: dynamicWrapper(app, ['Page12/page12'], () =>
        import ('../routes/Page12/page12'))
}