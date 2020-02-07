(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common;

  var RongIMEmoji = dependencies.RongIMEmoji;

  function getMethods() {
    return {
      getNodeHtml: function (node) {
        return node.outerHTML;
      }
    };
  }

  components.emojiPanel = function (resolve) {
    var options = {
      name: 'rong-class-emoji-panel',
      template: '#rong-template-emoji-panel',
      props: ['setEmoji', 'hide'],
      data: function () {
        return {
          emojiList: []
        }
      },
      mounted: function () {
        var list = RongIMEmoji.list;
        this.emojiList = list;
      },
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue,
  RongIMEmoji: window.RongIMLib.RongIMEmoji
}, window.RongMeeting.components);