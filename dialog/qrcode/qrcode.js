(function (RongMeeting, dependencies) {
  'use strict';
  var common = RongMeeting.common;
  var win = dependencies.win;

  function removeSelf(context) {
    if (context.isShow) {
      context.isShow = false;
      var parent = context.$el.parentElement;
      parent.removeChild(context.$el);
    }
  }

  var dialog = function (meetingUrl) {
    return common.mountDialog({
      name: 'QrCode',
      template: '#rong-template-dialog-qrcode',
      data: function () {
        return {
          isShow: true
        };
      },
      computed: {
      },
      mounted: function () {
        var context = this;
        context.$nextTick(function () {
          var qrcode = new win.QRCode('qrcode', {
            width: 150,
            height: 150,
            correctLevel: win.QRCode.CorrectLevel.H
          });
          var text = meetingUrl || context.meetingUrl;
          console.log(text);
          qrcode.makeCode(text);
        });
      },
      methods: {
        cancel: function () {
          removeSelf(this);
        },
        destroy: function () {
          this.cancel();
        }
      }
    });
  };

  RongMeeting.dialog.shareQRCode = dialog;

})(window.RongMeeting, {
  win: window
});