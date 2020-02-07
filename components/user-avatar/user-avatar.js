(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common,
    ENUM = RongMeeting.ENUM,
    RoleENUM = ENUM.Role;

  function getMethods() {
    return {

    };
  }

  components.userAvatar = function (resolve) {
    var options = {
      name: 'user-avatar',
      template: '#rong-template-useravatar',
      props: ['user'],
      data: function () {
        return {};
      },
      computed: {
        displayName: function () {
          var user = this.user;
          var name = common.getUserName(user);
          var nameLength = name.length;
          return name[nameLength - 1];
        },
        roleName: function () {
          var role = this.user.role;
          return RoleENUM[role];
        }
      },
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);