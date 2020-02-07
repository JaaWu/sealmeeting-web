(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common;

  function getMethods() {
    return {

    };
  }

  components.fileMessage = function (resolve) {
    var options = {
      name: 'file-message',
      template: '#rong-template-file-message',
      props: ['message'],
      computed: {
        content: function () {
          var content = this.message.content || {};
          return content.content || '';
        }
      },
      mounted: function () {

      },
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);