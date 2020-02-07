(function (RongMeeting, dependencies, components) {
  'use strict';
  var common = RongMeeting.common,
    utils = RongMeeting.utils,
    dataModel = RongMeeting.dataModel,
    rtcServer = dataModel.rtc,
    dialog = RongMeeting.dialog,
    server = dataModel.server;
  
  var ENUM = RongMeeting.ENUM,
    RTCTag = RongMeeting.ENUM.RTCTag,
    RTCKey = RTCTag.RTC,
    RoleENUM = ENUM.Role;

  function hideShareWhenFullClick(context) {
    var instance = RongMeeting.instance;
    instance.$on('fullClick', function (event) {
      var target = event.target;
      var notHideSelector = '.rong-user-operate-share';
      var inWrap = utils.closest(target, notHideSelector);
      if (!inWrap) {
        context.isShowShare = false;
      }
    });
  }

  function getMethods() {
    return {
      switchShare: function () {
        this.isShowShare = !this.isShowShare;
      },
      switchVolume: function () {
        var isMuted = !this.isMuted;
        var instance = RongMeeting.instance;
        utils.setAllMute(isMuted);
        instance.setMute(isMuted);
      },
      switchAudio: function () {
        var context = this;
        if (context.isDisabled) {
          return;
        }
        var isAudioOpenedNow = this.isAudioOpened;
        var audioEnable = !isAudioOpenedNow;
        var switchEvent = audioEnable ? rtcServer.openAudio : rtcServer.closeAudio;
        var loginUser = this.loginUser;
        server.syncMicroStatus(audioEnable).then(function () {
          return switchEvent(loginUser);
        }).catch(function (error) {
          var errorText = context.locale.errorCode[error.errCode] || error.errDetail;
          dialog.confirm({ content: errorText });
        });
      },
      switchVideo: function () {
        var context = this;
        if (context.isDisabled) {
          return;
        }
        var isVideoOpenedNow = this.isVideoOpened;
        var videoEnable = !isVideoOpenedNow;
        var switchEvent = videoEnable ? rtcServer.openVideo : rtcServer.closeVideo;
        var loginUser = this.loginUser;
        switchEvent(loginUser);
        server.syncCameraStatus(videoEnable).then(function () {
          return switchEvent(loginUser);
        }).catch(function (error) {
          var errorText = context.locale.errorCode[error.errCode] || error.errDetail;
          dialog.confirm({ content: errorText });
        });
      },
      confirmHungup: function () {
        var context = this;
        RongMeeting.dialog.confirm({
          content: '确定要退出会议吗 ?',
          confirmed: function () {
            context.hungup(true);
          }
        });
      }
    };
  }

  components.selfRTCOperate = function (resolve) {
    var options = {
      name: 'self-rtc-operate',
      template: '#rong-template-selfoperate',
      props: ['userList', 'loginUser', 'hungup'],
      data: function () {
        return {
          isShowShare: false
        };
      },
      computed: {
        isLoading: function () {
          var user = this.loginUser || {};
          return user.isLoading;
        },
        isAudioOpened: function () {
          var user = this.loginUser || {};
          var role = user.role;
          var rtcStream = user[RTCKey] || {};
          var isAudience = role === RoleENUM.AUDIENCE;
          return rtcStream.audio && !isAudience;
        },
        isVideoOpened: function () {
          var user = this.loginUser || {};
          var role = user.role;
          var rtcStream = user[RTCKey] || {};
          var isAudience = role === RoleENUM.AUDIENCE;
          return rtcStream.video && !isAudience;
        },
        isDisabled: function () {
          var user = this.loginUser;
          var isAudience = user.role === RoleENUM.AUDIENCE;
          return isAudience || this.isLoading;
        },
        isMuted: function () {
          var instance = RongMeeting.instance || {};
          return instance.isMuted;
        }
      },
      components: {
        'share': components.share
      },
      mounted: function () {
        hideShareWhenFullClick(this);
      },
      methods: getMethods()
    };
    common.component(options, resolve);
  };

})(window.RongMeeting, {
  Vue: window.Vue
}, window.RongMeeting.components);