(function (RongMeeting, dependencies, components) {
  'use strict';
  var common = RongMeeting.common,
    dataModel = RongMeeting.dataModel,
    rtcServer = dataModel.rtc,
    Role = RongMeeting.ENUM.Role,
    // RTCTag = RongMeeting.ENUM.RTCTag,
    dialog = RongMeeting.dialog;

  function getMethods() {
    return {
      
    };
  }

  components.rtc = function (resolve) {
    var options = {
      name: 'rong-rtc',
      template: '#rong-template-rtc',
      props: ['userList', 'loginUser', 'hungup', 'classInfo'],
      data: function () {
        return {
        };
      },
      computed: {
        // student or assistant
        showUserList: function () {
          var loginUser = this.loginUser;
          var userList = this.userList.filter(function (user) {
            return user.role !== Role.AUDIENCE && user.userId !== loginUser.userId;
          });
          var loginUserId = this.loginUser.userId;
          return common.sortByRoleInVideo(userList, loginUserId);
        },
        teacher: function () {
          var teacherList = this.userList.filter(function (user) {
            return user.role === Role.TEACHER;
          });
          var teacherCount = teacherList.length;
          var teacher = teacherCount ? teacherList[teacherCount - 1] : null;
          return teacher;
        },
        title: function () {
          var showUserList = this.showUserList;
          var promp = '滑动查看更多成员';
          return showUserList.length > 3 ? promp : '';
        }
      },
      components: {
        'rtc-user': components.rtcUser,
        'self-rtc-operate': components.selfRTCOperate
      },
      watch: {
        'loginUser.role': function (newRole, oldRole) {
          if (newRole === Role.AUDIENCE) {
            rtcServer.unPublishSelf();
          }
          if (oldRole === Role.AUDIENCE) {
            var classInfo = this.classInfo;
            // var loginUser = classInfo.loginUser;
            // var streamInfo = loginUser[RTCTag.RTC];
            var resolution = classInfo.resolution;
            rtcServer.publishSelfForce(resolution, true, true);
          }
        }
      },
      mounted: function () {
        var classInfo = this.classInfo,
          isAudience = classInfo.isAudience,
          resolution = classInfo.resolution,
          videoEnable = classInfo.videoEnable,
          audioEnable = true;

        !isAudience && rtcServer.publishSelf(resolution, videoEnable, audioEnable)
          .catch(function (error) {
            dialog.confirm({
              content: error
            });
            common.console.error(error);
          });
      },
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);