(function (RongMeeting) {
  'use strict';
  var utils = RongMeeting.utils,
    server = RongMeeting.dataModel.server,
    dialog = RongMeeting.dialog;

  var removeSelf = function (context) {
    context.isShow = false;
    var parent = context.$el.parentElement;
    parent.removeChild(context.$el);
  };

  RongMeeting.dialog.createWB = function (options) {
    var common = RongMeeting.common;

    options = options || {};
    var success = options.success || utils.noop;

    common.mountDialog({
      name: 'create-wb',
      template: '#rong-template-dialog-create-wb',
      data: function () {
        return {
          isShow: true
        };
      },
      // mounted: mounted,
      methods: {
        cancel: function () {
          removeSelf(this);
        },
        createBlankWb: function () {
          var context = this;
          server.createWhiteboard().then(function (whiteboardId) {
            success(whiteboardId);
            removeSelf(context);
          }).catch(function (error) {
            removeSelf(context);
            var errorText = context.locale.errorCode[error.errCode] || error.errDetail;
            dialog.confirm({
              content: errorText
            });
            common.console.log('创建白板失败');
          });
        }
      }
    });
  };

})(window.RongMeeting);