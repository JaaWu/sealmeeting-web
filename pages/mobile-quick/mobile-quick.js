(function (RongClass, dependencies, components) {
  'use strict';
  var common = RongClass.common,
    utils = RongClass.utils;
  var mobileLink = RongClass.setting.mobileLink,
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
        installUrl: function () {
          return installUrl;
        }
      },
      components: {
      },
      destroyed: function () {
      },
      mounted: function () {
        var context = this;
        context.$nextTick(function () {
          var copyBtn = context.$refs.copyBtn;
          copyBtn && utils.setCopyById(copyBtn.id);
        });
      },
      methods: {
        
      }
    };
    common.component(options, resolve);
  };

})(window.RongClass, {
  Vue: window.Vue,
  win: window
}, window.RongClass.components);