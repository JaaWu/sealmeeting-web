(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common,
    ENUM = RongMeeting.ENUM,
    utils = RongMeeting.utils,
    DisplayType = ENUM.DisplayType,
    RoleENUM = ENUM.Role;

  components.resourceList = function (resolve) {
    var options = {
      name: 'recentShare',
      template: '#rong-template-resource-list',
      props: ['whiteboardList', 'assistant', 'teacher', 'displayRecent'],
      data: function () {
        return {
        };
      },
      computed: {
        displayedUser: function () {
          return this.teacher || this.assistant;
        },
        displayTeacher: function () {
          return this.teacher;
        },
        displayAssistant: function () {
          return this.assistant;
        },
        displayedWhiteboardList: function () {
          return utils.reverseArray(this.whiteboardList);
        }
      },
      components: {
        'rtc-user': components.rtcUser
      },
      mounted: function () {
      },
      methods: {
        displayUser: function (user) {
          user = user || this.displayedUser;
          var role = user.role;
          var displayType = role === RoleENUM.TEACHER ? DisplayType.TEACHER : DisplayType.ASSISTANT;
          this.displayRecent({
            type: displayType,
            userId: common.getUserId(user)
          });
        },
        displayWB: function (wb) {
          this.displayRecent({
            type: DisplayType.WHITEBOARD,
            uri: wb.whiteboardId
          });
        },
        getDisplayName: function (index) {
          var length = this.displayedWhiteboardList.length;
          return length - index;
        }
      }
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);