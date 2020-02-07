(function (RongMeeting, dependencies, components) {
  'use strict';
  var win = dependencies.win;
  var common = RongMeeting.common,
    utils = RongMeeting.utils;

  var webLinkTpl = RongMeeting.setting.webLink.tpl;

  function getMethods() {
    return {
      copyShareUrl: function () {
        utils.copyToClipBoard(this.meetingUrl);
        common.toast('邀请信息已复制');
      },
      sendEmail: function () {
        var auth = RongMeeting.instance.auth || {};
        var userName = auth.loginUser.userName;
        var roomId = auth.roomId;
        utils.sendEmail(userName, roomId, this.meetingUrl);
      },
      showQRCode: function () {
        RongMeeting.dialog.shareQRCode(this.meetingUrl);
      }
    };
  }

  components.share = function (resolve) {
    var options = {
      name: 'share',
      template: '#rong-template-share',
      data: function () {
        return {
        };
      },
      computed: {
        emailUrl: function () {
          var auth = RongMeeting.instance.auth || {};
          var userName = auth.loginUser.userName;
          var roomId = auth.roomId;
          return utils.getEmailUrl(userName, roomId, this.meetingUrl);
        },
        meetingUrl: function () {
          var classInfo = RongMeeting.instance.auth,
            location = win.location,
            url = location.origin + location.pathname,
            password = classInfo.password || '',
            encode = classInfo.encode || 1,
            locale = classInfo.locale || 'zh-cn';
          return utils.tplEngine(webLinkTpl, {
            url: url,
            mId: classInfo.roomId,
            p: password,
            encode: encode,
            locale: locale
          });
        }
      },
      mixins: [
      ],
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue,
  win: window
}, window.RongMeeting.components);