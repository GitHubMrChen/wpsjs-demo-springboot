var hostName = window.location.hostname // ip
var hostAddr = window.location.host // ip + 端口
if (hostName == 'localhost' || hostName == '127.0.0.1') { // 如果是本地测试环境使用该条件
    hostAddr = '127.0.0.1:8888'
}
var wpsPlugin = {"name":"wpsjs-demo","addonType":"wps","online":"true","url":"http://" + hostAddr + "/jsplugindir/"};
/**
 * 此方法是根据wps_sdk.js做的调用方法封装
 * 可参照此定义
 * @param {*} funcs         这是在WPS加载项内部定义的方法，采用JSON格式（先方法名，再参数）
 * @param {*} front         控制着通过页面执行WPS加载项方法，WPS的界面是否在执行时在前台显示
 * @param {*} jsPluginsXml  指定一个新的WPS加载项配置文件的地址
 */
var bUseHttps = false;
function _WpsInvoke(funcs, front, jsPluginsXml) {
    WpsAddonMgr.getAllConfig(function(res) {
        console.log('------ WpsAddonMgr.getAllConfig ------')
        console.log(res)
        WpsAddonMgr.enable(wpsPlugin, function(ret) {
            console.log('------ WpsAddonMgr.enable -------')
            console.log(ret)
            _executeInvoke(funcs, front, jsPluginsXml)
        })
    })
}

function _executeInvoke(funcs, front, jsPluginsXml) {
    // 发起调用
    var info = {};
    info.funcs = funcs;
    var func = bUseHttps ? WpsInvoke.InvokeAsHttps : WpsInvoke.InvokeAsHttp
    func(WpsInvoke.ClientType.wps, // 组件类型
        wpsPlugin.name, // 插件名，与wps客户端加载的加载的插件名对应
        "InvokeFromSystemDemo", // 插件方法入口，与wps客户端加载的加载的插件代码对应，详细见插件代码
        funcs, // 传递给插件的数据
        function (result) { // 调用回调，status为0为成功，其他是错误
            console.log('------  WpsInvoke.InvokeAsHttp  ------')
            console.log(result)
            if (result.status) {
                if (bUseHttps && result.status == 100) {
                    WpsInvoke.AuthHttpesCert('请在稍后打开的网页中，点击"高级" => "继续前往"，完成授权。')
                    return;
                }
                alert(result.message)
            } else {
                WpsInvoke.RegWebNotify('wps', wpsPlugin.name, function (messageText) {
                    console.log('------  WpsInvoke.RegWebNotify  ------')
                    console.log(messageText)
                })
            }
        },
        front,
        jsPluginsXml)
}
/**
 * 该方法封装了发送给WPS客户端的请求，不需要用户去实现
 * 接收消息：WpsInvoke.RegWebNotify（type，name,callback）
 * WPS客户端返回消息： wps.OAAssist.WebNotify（message）
 * @param {*} type 加载项对应的插件类型
 * @param {*} name 加载项对应的名字
 * @param {func} callback 接收到WPS客户端的消息后的回调函数
 */
// WpsInvoke.RegWebNotify(WpsInvoke.ClientType.wps, "WpsOAAssist",handleOaMessage)

function handleOaMessage(data){
    data=typeof (data) == 'object' ? data : JSON.parse(data)
    var type=data.type;
    switch(type) {
        case "executeFunc1":
            handleOaFunc1(data.message);
            break;
        case "executeFunc2":
            handleOaFunc2(data.message + data.msgInfoStr);
            break;
        default:
            alert(data.messageData)
    }
}
function handleOaFunc1(message) {
    alert("我是函数handleOaFunc1，我接收到的参数是：" + message)
}
function handleOaFunc2(message) {
    alert("我是函数handleOaFunc2，我接收到的参数是：" + message)
    var span = window.parent.document.getElementById("webnotifyspan")
    span.innerHTML = message
}

/**
 * 这是页面中针对代码显示的变量定义，开发者无需关心
 */
var _wps = {}

function GetDemoPath(fileName) {

    var url = document.location.host;
    return document.location.protocol + "//" + url + "/file/" + fileName;
}

function GetUploadPath() {
    var url = document.location.host;
    return document.location.protocol + "//" + url + "/Upload";
}

function GetDemoPngPath() {
    var url = document.location.toString();
    url = decodeURI(url);
    if (url.indexOf("/") != -1) {
        url = url.substring(0, url.lastIndexOf("/"));
    }
    if (url.length !== 0)
        url = url.concat("/WPS.png");

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    if (url.startsWith("file:///"))
        url = url.substr("file:///".length);
    return url;
}

function openDoc() {

    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    var uploadPath = prompt("请输入文档上传路径:", GetUploadPath())
    var uploadFieldName = prompt("请输入文档上传到业务系统时自定义字段：", "自定义字段")
    var backupPath = prompt("请输入文档备份路径:")

    _WpsInvoke([{
        "OpenDoc": {
            "docId": "123", // 文档ID
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "uploadFieldName": uploadFieldName,
            "picPath": GetDemoPngPath(),
            "copyUrl": backupPath,
            "userName": "东方不败"
        }
    }]) // OpenDoc方法对应于OA助手dispatcher支持的方法名
}

function onlineEditDoc() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    var uploadPath = prompt("请输入文档上传路径:", GetUploadPath())
    var uploadFieldName = prompt("请输入文档上传到业务系统时自定义字段：", "自定义字段")
    _WpsInvoke([{
        "OnlineEditDoc": {
            "docId": "123", // 文档ID
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "uploadFieldName": uploadFieldName,
            "buttonGroups": "btnSaveAsFile,btnImportDoc,btnPageSetup,btnInsertDate,btnSelectBookmark", //屏蔽功能按钮
            "userName": "东方不败"
        }
    }]) // onlineEditDoc方法对应于OA助手dispatcher支持的方法名
}

function openRevision() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    var uploadPath = prompt("请输入文档上传路径:")
    _WpsInvoke([{
        "OpenDoc": {
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "userName": '王五', //用户名
            "revisionCtrl": {
                "bOpenRevision": true,
                "bShowRevision": true
            }
        }
    }])
}

function closeRevision() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    var uploadPath = prompt("请输入文档上传路径:")
    _WpsInvoke([{
        "OpenDoc": {
            "docId": "123", // 文档ID
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "userName": '王五', //用户名
            "revisionCtrl": {
                "bOpenRevision": false,
                "bShowRevision": false
            }
        }
    }])
}

function protectOpen() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    var uploadPath = prompt("请输入文档上传路径:")
    _WpsInvoke([{
        "OpenDoc": {
            "docId": "123", // 文档ID
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "openType": { //文档打开方式
                // 文档保护类型，-1：不启用保护模式，0：只允许对现有内容进行修订，
                // 1：只允许添加批注，2：只允许修改窗体域(禁止拷贝功能)，3：只读
                "protectType": 3,
                "password": "123456"
            }
        }
    }])
}

function openWithPassWd() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：")
    var docPassword = prompt("请输入文档打开密码:")
    var uploadPath = prompt("请输入文档上传路径:")
    _WpsInvoke([{
        "OpenDoc": {
            "docId": "123", // 文档ID
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "docPassword": {
                "docPassword": docPassword // 文档密码
            }
        }
    }])
}

function insertRedHeader() {
    var filePath = prompt("请输入打开文件路径，如果为空则对活动文档套红：", GetDemoPath("样章.docx"))
    var templateURL = prompt("请输入红头模板路径（本地或是url）:", GetDemoPath("红头文件.docx"))
    if (filePath != '' && filePath != null) {
        _WpsInvoke([{
            "OnlineEditDoc": {
                "docId": "123", // 文档ID
                "fileName": filePath,
                "insertFileUrl": templateURL,
                "bkInsertFile": 'Content', //红头模板中填充正文的位置书签名
                "buttonGroups": "btnSaveAsFile,btnImportDoc,btnPageSetup,btnInsertDate,btnSelectBookmark" //屏蔽功能按钮
            }
        }])
    } else {
        _WpsInvoke([{
            "InsertRedHead": {
                "insertFileUrl": templateURL,
                "bkInsertFile": 'Content' //红头模板中填充正文的位置书签名
            }
        }])
    }
}

function fillTemplate() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章2.docx"))
    var templatePath = prompt("请输入需要填充的数据的请求地址:", document.location.protocol + "//" + document.location.host + "/getTemplateData")

    _WpsInvoke([{
        "OpenDoc": {
            "docId": "c2de1fcd1d3e4ac0b3cda1392c36c9", // 文档ID
            "fileName": filePath,
            "templateDataUrl": templatePath
        }
    }]) // OpenDoc方法对应于OA助手dispatcher支持的方法名
}

function convertDoc() {
    var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    var uploadPath = prompt("请输入文档转换后上传路径:", GetUploadPath())

    _WpsInvoke([{
        "OpenDoc": {
            "docId": "123", // 文档ID
            "uploadPath": uploadPath, // 保存文档上传路径
            "fileName": filePath,
            "suffix": ".pdf",
            "uploadWithAppendPath": "1" //与suffix配置使用，传入标志位即可
        }
    }]) // OpenDoc方法对应于OA助手dispatcher支持的方法名
}

function taskPaneBookMark() {
    var filePath = prompt("请输入打开带书签文件路径（本地或是url）：", GetDemoPath("样章.docx"))
    _WpsInvoke([{
        "taskPaneBookMark": {
            "fileName": filePath,
            "userName": "东方不败"
        }
    }]) // taskPaneBookMark方法对应于OA助手dispatcher支持的方法名
}

function exitWPS() {
    _WpsInvoke([{
        "ExitWPS": {}
    }],true)
}

function getDocStatus() {
    _WpsInvoke([{
        "GetDocStatus": {}
    }],
    false)
}

//----公文写作的相关方法 这些都必须是在有「公文写作」组件的版本中运行 Start--------
/**
 * 判断当前OS是否是Linux系统
 *
 * @returns
 */
function checkOSisLinux() {
    if (detectOS() == "Linux") {
        return true
    } else {
        alert("此方法仅在WPS Linux特定版本支持")
    }
}
/**
 * 新建一个使用公文写作打开的公文
 *
 */
function newOfficialDocument() {
    if (checkOSisLinux()) {
        _WpsInvoke([{
            "NewOfficialDocument": {
                "isOfficialDocument": true
            }
        }]) // NewOfficialDocument方法对应于OA助手dispatcher支持的方法名
    }
}

/**
 * 打开一个使用公文写作打开的公文
 */
function openOfficialDocument() {
    if (checkOSisLinux()) {
        var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("公文样章.wps"))
        var uploadPath = prompt("请输入文档上传路径:", GetUploadPath())
        var uploadFieldName = prompt("请输入文档上传到业务系统时自定义字段：", "自定义字段")
        var backupPath = prompt("请输入文档备份路径:")
        _WpsInvoke([{
            "OpenDoc": {
                "docId": "123", // 文档ID
                "uploadPath": uploadPath, // 保存文档上传路径
                "fileName": filePath,
                "uploadFieldName": uploadFieldName,
                "picPath": GetDemoPngPath(),
                "copyUrl": backupPath,
                "userName": "东方不败"
            }
        }]) // OpenDoc方法对应于OA助手dispatcher支持的方法名
    }
}

/**
 * 在线不落地打开一个使用公文写作打开的公文
 */
function onlineEditOfficialDocument() {
    if (checkOSisLinux()) {
        var filePath = prompt("请输入打开文件路径（本地或是url）：", GetDemoPath("公文样章.wps"))
        var uploadPath = prompt("请输入文档上传路径:", GetUploadPath())
        var uploadFieldName = prompt("请输入文档上传到业务系统时自定义字段：", "自定义字段")
        _WpsInvoke([{
            "OnlineEditDoc": {
                "docId": "123", // 文档ID
                "uploadPath": uploadPath, // 保存文档上传路径
                "fileName": filePath,
                "uploadFieldName": uploadFieldName,
                "buttonGroups": "btnSaveAsFile,btnImportDoc,btnPageSetup,btnInsertDate,btnSelectBookmark", //屏蔽功能按钮
                "userName": "东方不败"
            }
        }]) // onlineEditDoc方法对应于OA助手dispatcher支持的方法名
    }
}

/** 
 * 这是HTML页面上的按钮赋予事件的实现，开发者无需关心，使用自己习惯的方式做开发即可
 */
window.onload = function () {
    var btns = document.getElementsByClassName("btn");

    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function (event) {
            document.getElementById("blockFunc").style.visibility = "visible";
            var btn2 = document.getElementById("demoBtn");
            btn2.innerText = this.innerText;
            document.getElementById("codeDes").innerText = _wps[this.id].detail.toString()
            document.getElementById("code").innerText = _wps[this.id].code.toString()
            var onBtnAction = _wps[this.id].action

            // document.getElementById("demoBtn").onclick = onBtnAction //IE不支持箭头函数，改为通用写法
            document.getElementById("demoBtn").onclick = function () { //IE不支持箭头函数，改为通用写法
                //之下动作是做了对Node服务的判断和oem.ini的设置
                var xhr = new WpsInvoke.CreateXHR();
                xhr.onload = function () {
                    onBtnAction()
                }
                xhr.onerror = function () {
                    alert("请确认本地服务端(StartupServer.js)是启动状态")
                    return
                }
                xhr.open('get', 'http://127.0.0.1:3888/FileList', true)
                xhr.send()
            }

            hljs.highlightBlock(document.getElementById("code"));
        }
    }
}
/**
 * 检查操作系统
 *
 * @returns Win10 | Win7 | WinVista | Win2003 | WinXP | Win2000 | Linux | Unix | Mac
 */
function detectOS() {
    var sUserAgent = navigator.userAgent;
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "Mac";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux) return "Linux";
    if (isWin) {
        var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
        if (isWin2K) return "Win2000";
        var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
        if (isWinXP) return "WinXP";
        var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
        if (isWin2003) return "Win2003";
        var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
        if (isWinVista) return "WinVista";
        var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
        if (isWin7) return "Win7";
        var isWin10 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 10") > -1;
        if (isWin10) return "Win10";
    }
    return "other";
}