(function (RongMeeting, dependencies, components) {
  'use strict';

  var common = RongMeeting.common,
    utils = RongMeeting.utils,
    server = RongMeeting.dataModel.server,
    emitter = utils.EventEmitter,
    dialog = RongMeeting.dialog,
    MaxPersonCount = RongMeeting.setting.class.maxPersonCount;

  var ENUM = RongMeeting.ENUM,
    RoleENUM = ENUM.Role,
    Event = ENUM.Event,
    DeviceControlType = ENUM.DeviceControlType;
  
  function isPersonFull(userList) {
    var newList = userList.filter(function (user) {
      return user.role !== RoleENUM.AUDIENCE;
    });
    return newList.length >= MaxPersonCount;
  }

  /**
   * 同意列席发言(用户为主持人时)
   */
  function approveSpeech(context, user, ticket) {
    var locale = RongMeeting.instance.locale;
    server.approveSpeech(ticket).then(function () {
      common.console.log('同意列席升级成功');
      // return changeRole(user, RoleENUM.STUDENT);
    }).catch(function (error) {
      common.console.error('同意失败');
      if (error.errCode === ENUM.SpecialErrorCode.ERR_OVER_MAX_COUNT) {
        return applyDegrade(context, user, ticket);
      }
      var errorText = locale.errorCode[error.errCode] || error.errDetail;
      dialog.confirm({
        content: errorText
      });
    });
  }
  
  /**
   * 拒绝列席发言(用户为主持人时)
   */
  function rejectSpeech(ticket) {
    var locale = RongMeeting.instance.locale;
    server.rejectSpeech(ticket).then(function () {
      common.console.log('拒绝列席升级成功');
    }).catch(function (error) {
      common.console.error('拒绝失败');
      var errorText = locale.errorCode[error.errCode] || error.errDetail;
      dialog.confirm({
        content: errorText
      });
    });
  }

  function degradePerson(userList, callbacks) {
    callbacks = callbacks || utils.noop;
    dialog.degrade({
      userList: userList,
      confirmed: function (result) {
        callbacks(null, result);
      },
      failed: callbacks
    })
  }

  function applyDegrade(context, user, ticket) {
    var userName = common.getUserName(user),
      content = '{userName} 申请发言, 但非列席名额已满, 请降级一名成员或拒绝发言申请';
    
    content = utils.tplEngine(content, {
      userName: userName
    });
    
    var degraded = function (err) {
      if (err) {
        common.console.warn('降级成员失败');
      } else {
        approveSpeech(context, user, ticket);
      }
    };
    
    dialog.apply({
      content: content,
      degraded: function () {
        degradePerson(context.userList, degraded);
      },
      rejected: function () {
        rejectSpeech(ticket);
      }
    });
  }

  function approveUpgrade(ticket) {
    var locale = RongMeeting.instance.locale;
    server.approveUpgrade(ticket).then(function () {
      // do nothing
    }).catch(function (error) {
      common.console.error('同意升级邀请失败');
      var errorText = locale.errorCode[error.errCode] || error.errDetail;
      dialog.confirm({
        content: errorText
      });
    });
  }

  function rejectUpgrade(ticket) {
    var locale = RongMeeting.instance.locale;
    server.rejectUpgrade(ticket).then(function () {
      // do nothing
    }).catch(function (error) {
      common.console.error('拒绝升级邀请失败');
      var errorText = locale.errorCode[error.errCode] || error.errDetail;
      dialog.confirm({
        content: errorText
      });
    });
  }

  function approveControlDevice(ticket) {
    var locale = RongMeeting.instance.locale;
    server.approveOpenDevice(ticket).then(function () {
      // do nothing
    }).catch(function (error) {
      common.console.error('同意更改设备失败');
      var errorText = locale.errorCode[error.errCode] || error.errDetail;
      dialog.confirm({
        content: errorText
      });
    });
  }

  function rejectControlDevice(ticket) {
    var locale = RongMeeting.instance.locale;
    server.rejectOpenDevice(ticket).then(function () {
      // do nothing
    }).catch(function (error) {
      common.console.error('拒绝更改设备失败');
      var errorText = locale.errorCode[error.errCode] || error.errDetail;
      dialog.confirm({
        content: errorText
      });
    });
  }

  function watchInviteUpgrade() {
    emitter.on(Event.USER_INVITE_UPGRADE, function (content) {
      var ticket = content.ticket;
      content.opUser.role = RoleENUM.ASSISTANT;
      common.callDialog(content.opUser, '主持人邀请您升级为参会人', {
        onAccepted: function () {
          approveUpgrade(ticket);
        },
        onRejected: function () {
          rejectUpgrade(ticket);
        }
      });
    });
  }

  function watchControlDevice() {
    emitter.on(Event.USER_INVITE_CONTROL_DEVICE, function (content) {
      var ticket = content.ticket;
      var text = '主持人邀请您打开{type}';
      var typeText = content.type === DeviceControlType.MICRO ? '麦克风' : '摄像头';
      text = utils.tplEngine(text, { type: typeText });
      content.opUser.role = RoleENUM.ASSISTANT;
      common.callDialog(content.opUser, text, {
        onAccepted: function () {
          approveControlDevice(ticket);
        },
        onRejected: function () {
          rejectControlDevice(ticket);
        }
      });
    });
  }

  /**
  * 监听列席申请发言(用户为主持人时)
  */
  function watchApplySpeech(context) {
    emitter.on(Event.USER_APPLY_SPEECH, function (content) {
      var ticket = content.ticket,
        reqUser = content.reqUser,
        userName = common.getUserName(reqUser),
        userList = context.userList;
      common.callDialog(reqUser, userName + ' 请求发言', {
        onAccepted: function () {
          if (isPersonFull(userList)) {
            applyDegrade(context, reqUser, ticket);
          } else {
            approveSpeech(context, reqUser, ticket);
          }
        },
        onRejected: function () {
          rejectSpeech(ticket);
        }
      });
    });
  }

  function getMethods() {
    return {
      isShowRole: function (user) {
        var role = user.role;
        var showList = [RoleENUM.ASSISTANT, RoleENUM.TEACHER];
        return showList.indexOf(role) !== -1;
      },
      getRoleName: function (user) {
        var role = user.role;
        var roleName = RoleENUM[role];
        return this.locale.class[roleName];
      },
      setSpeechApplying: function (enable) {
        this.isSpeechApplying = enable;
      }
    };
  }
  
  components.userList = function (resolve) {
    var options = {
      name: 'user-list',
      template: '#rong-template-userlist',
      props: ['userList', 'loginUser'],
      data: function () {
        return {
          isSpeechApplying: false
        };
      },
      computed: {
        sortedUserList: function () {
          var userList = this.userList;
          var loginUser = this.loginUser;
          userList = userList.map(function (user) {
            user.isUpgradeInviting = false;
            return user;
          });
          return common.sortByRole(userList, loginUser.userId);
        }
      },
      components: {
        'user-avatar': components.userAvatar,
        'user-opt': components.userOpt
      },
      mounted: function () {
        watchApplySpeech(this);
        watchInviteUpgrade(this);
        watchControlDevice(this);
      },
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue,
  win: window
}, window.RongMeeting.components);