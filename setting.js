(function (win) {
  var setting = {
    version: '1.0.1',
    lang: 'zh',
    server: 'https://api-xxxx/api', // SealMeeting Server 地址
    im: {
      appKey: 'xxeekbzig32',
      // navi: 'https://navqa.cn.ronghub.com', // navi 地址, 私有云可不填
      // api: '',
      // protobuf: '',
      reconnectUrl: 'cdn.ronghub.com/RongIMLib-2.2.6.min.js' // 重连地址
    },
    emoji: {
      size: 16 // emoji 字体大小
      // url: ''
    },
    upload: {
      url: 'https://upload.qiniu.com' // 上传文件地址
    },
    rtc: {
      resolution: { // 分辨率选项
        list: [
          { width: 320, height: 240 },
          { width: 640, height: 480 },
          { width: 1280, height: 720 }
        ],
        default: { width: 640, height: 480 }
      },
      screenPluginPath: 'assets/plugin/screenshare-addon.zip' // 屏幕共享插件地址
    },
    class: {
      appleySpeechWaitTime: 30000,
      toastTime: 30000,
      maxPersonCount: 16
    },
    mobileLink: {
      tpl: 'sealmeeting://rongcloud/seal/link?site_url={url}?mId={mId}&p={p}&encode={encode}&locale={locale}', // 移动端一键开启地址
      installUrl: 'itms-services://?action=xxxx&url=https://cdn.xxxx.com/app_sealmeeting.plist' // 移动端安装地址
    },
    webLink: {
      tpl: '{url}?mId={mId}&p={p}&encode={encode}&locale={locale}' // web 一键会议地址
    },
    isDebug: true
  };

  win.RongMeeting = win.RongMeeting || {
    locale: {},
    components: {},
    dialog: {},
    setting: setting
  };
  
})(window);
