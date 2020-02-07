(function (RongMeeting, dependencies, components) {
  'use strict';
  var win = dependencies.win;
  var common = RongMeeting.common,
    utils = RongMeeting.utils;
  var mobileLink = RongMeeting.setting.mobileLink,
    installUrl = mobileLink.installUrl;
  var browserName = utils.getBrowser().type;
  var supportBrowserList = [
    'Chrome',
    'Safari',
    'iOSChrome'
  ];
  var meetingData = utils.formatUrl();

  components.mobileQuick = function (resolve) {
    var options = {
      name: 'mobile-quick',
      template: '#rong-template-mobile-quick',
      data: function () {
        return {
          meetingId: meetingData.mId,
          password: meetingData.p,
          encode: meetingData.encode,
          locale: meetingData.locale
        };
      },
      computed: {
        isCanStart: function () {
          var isIOS = this.isIOS;
          return supportBrowserList.indexOf(browserName) !== -1 && isIOS;
        },
        isIOS: function () {
          return utils.isIOSPlatform();
        },
        isWeChat: function () {
          return browserName === 'WeChat';
        },
        installUrl: function () {
          return installUrl;
        }
      },
      methods: {
        copy: function () {
          utils.copyToClipBoard(this.meetingUrl);
          RongMeeting.dialog.mobileToast({
            content: '已复制会议链接',
            destroyTimeout: 2000,
            autoDestroy: true
          });
        },
        startMeeting: function () {
          var context = this;
          var linkUrl = context.mobileLinkUrl;
          var start = +new Date();
          context.$nextTick(function () {
            win.location.href = linkUrl;
            setTimeout(() => {
              var now = +new Date();
              if (now - start < 2100) {
                win.location.href = context.installUrl;
              }
            }, 2000);
          });
        }
      },
      mounted: function () {
        if (this.isCanStart) {
          this.startMeeting();
        }
      }
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue,
  win: window
}, window.RongMeeting.components);