(function (RongMeeting) {
  
  var components = RongMeeting.components;

  RongMeeting.routes = {
    maps: [
      {
        path: '/login',
        name: 'login',
        component: components.login
      },
      {
        path: '/class',
        name: 'class',
        component: components.class
      },
      {
        path: '/mobile-quick',
        name: 'mobile-quick',
        component: components.mobileQuick
      },
      {
        path: '*',
        redirect: '/login'
      }
    ]
  };
  
})(window.RongMeeting);