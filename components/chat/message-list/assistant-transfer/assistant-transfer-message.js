(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common,
    server = RongMeeting.dataModel.server;

  components.assistantTransferMessage = function (resolve) {
    var options = {
      name: 'assistant-transfer-message',
      template: '#rong-template-assistant-transfer-message',
      props: ['message'],
      computed: {
        optUserName: function () {
          var message = this.message,
            content = message.content,
            toUserId = content.toUserId;
          var toUser = server.getUserById(toUserId);
          return common.getUserName(toUser);
        }
      },
      mounted: function () {

      }
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);