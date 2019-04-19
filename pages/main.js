(function (RongClass, dependencies) {
  'use strict';

  var Vue = dependencies.Vue;
  var VueRouter = dependencies.VueRouter;
  var routes = RongClass.routes;

  var utils = RongClass.utils,
    ENUM = RongClass.ENUM;
  var browserType = utils.getBrowserType(),
    isMobile = browserType === ENUM.BrowserType.MOBILE;

  function getRouter() {
    var ignoreAuthRoutes = ['login'];
    var router = new VueRouter({
      routes: routes.maps
    });
    router.beforeEach(function (to, from, next) {
      var toName = to.name;
      var instance = RongClass.instance || {};
      var auth = instance.auth;

      var meetingData = utils.formatUrl();
      var hasMeetingId = !!meetingData.mId;
      if (toName === 'login' && to.params.force) {
        return next();
      }
      if (hasMeetingId) {
        if (toName !== 'mobile-quick' && isMobile) {
          return next({ name: 'mobile-quick' });
        }
      }
      if (toName !== 'mobile-quick' && ignoreAuthRoutes.indexOf(toName) === -1 && !auth) {
        return next({ name: 'login' });
      }
      next();
    });
    return router;
  }

  function init(config) {
    var rongClass = new Vue({
      el: config.el,
      router: getRouter(),
      data: function () {
        return {
          isMuted: false,
          isMobile: isMobile
        };
      },
      mixins: [
        RongClass.mixins.locale
      ],
      computed: {
      },
      methods: {
        setMute: function (isMute) {
          this.isMuted = isMute;
        },
        fullClick: function (event) {
          this.$emit('fullClick', event);
        }
      }
    });

    RongClass.instance = rongClass;
  }

  RongClass.init = init;

})(window.RongClass, {
  Vue: window.Vue,
  VueRouter: window.VueRouter
});