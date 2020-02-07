(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common,
    utils = RongMeeting.utils;

  components.classInfo = function (resolve) {
    var options = {
      name: 'class-info',
      template: '#rong-template-classinfo',
      props: ['classInfo'],
      data: function () {
        return {
          timer: { time: 0 }
        }
      },
      computed: {
        formatedTime: function () {
          var time = this.timer.time;
          return utils.timeToFormat(time);
        },
        roomId: function () {
          var classInfo = this.classInfo || {};
          return classInfo.roomId;
        }
      },
      created: function () {
        this.timer = new utils.Timer();
        this.timer.start();
      },
      destroyed: function () {
        this.timer.end();
      }
    };
    common.component(options, resolve);
  };
  
})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);