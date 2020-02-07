(function (RongMeeting, dependencies) {
  'use strict';
  var win = dependencies.win;

  /* 空函数 */
  function noop() {}

  function isNull(c) {
    return c === null || c === undefined || c === 'null' || c === 'undefined' || c === '';
  }

  /* 是否为字符串 */
  function isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
  }

  /* 是否为对象 */
  function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  /* 是否为数组 */
  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }
  /* 是否为空对象 */
  function isObjectEmpty(obj) {
    var result = true;
    if (isObject(obj)) {
      var keys = Object.keys(obj);
      result = !keys.length;
    }
    if (isString(obj)) {
      result = (obj.length === 0);
    }
    return result;
  }

  /* 模板替换引擎 */
  function tplEngine(temp, data, regexp) {
    var replaceAction = function (object) {
      return temp.replace(regexp || (/{([^}]+)}/g), function (match, name) {
        if (match.charAt(0) === '\\') return match.slice(1);
        return (object[name] !== undefined) ? object[name] : '{' + name + '}';
      });
    };
    if (!(Object.prototype.toString.call(data) === '[object Array]')) data = [data];
    var ret = [];
    for (var i = 0, j = data.length; i < j; i++) {
      ret.push(replaceAction(data[i]));
    }
    return ret.join('');
  }

  function encodeHtmlStr(str) {
    if (!isString(str)) {
      return str;
    }
    var replaceRule = [{
      symbol: '&',
      html: '&amp;'
    },
    // 下述方法有问题,字符串中如有空格,会多加空格
    // white-space: pre-wrap; 能实现同样效果,并支持ie9, 故注释掉
    // {
    //     symbol: '[\\u0020]',
    //     html: '&nbsp;\u0020'
    // },
    {
      symbol: '[\\u0009]',
      html: '&nbsp;&nbsp;&nbsp;&nbsp;\u0020'
    }, {
      symbol: '<',
      html: '&lt;'
    }, {
      symbol: '>',
      html: '&gt;'
    }, {
      symbol: '\'',
      html: '&#39;'
    }, {
      symbol: '\\n\\r',
      html: '<br/>'
    }, {
      symbol: '\\r\\n',
      html: '<br/>'
    }, {
      symbol: '\\n',
      html: '<br/>'
    }];
    for (var i = 0, len = replaceRule.length; i < len; i += 1) {
      var rule = replaceRule[i];
      var regExp = new RegExp(rule.symbol, 'g');
      str = str.replace(regExp, rule.html);
    }
    return str;
  }

  /**
   * http 请求
   * @param {object} option 
   * @param {object} option.url 地址
   * @param {object} option.queryStrings
   * @param {object} option.headers
   * @param {object} option.body
   * @param {object} option.isSync
   */
  function ajax(option) {
    var xhr = new win.XMLHttpRequest();
    var method = option.method || 'GET';
    var url = option.url;
    var isSync = option.isSync;
    var queryStrings = option.queryStrings || {};
    var tpl = '{key}={value}', strings = [];
    for (var key in queryStrings) {
      var value = queryStrings[key];
      var str = tplEngine(tpl, {
        key: key,
        value: value
      });
      strings.push(str);
    }
    queryStrings = strings.join('&');
    var urlTpl = '{url}?{queryString}';
    url = tplEngine(urlTpl, {
      url: url,
      queryString: queryStrings
    });
    xhr.open(method, url, !isSync);

    var headers = option.headers || {};
    for (var name in headers) {
      var header = headers[name];
      xhr.setRequestHeader(name, header);
    }

    var isSuccess = function (xhr) {
      return /^(200|202|10000)$/.test(xhr.status);
    };
    var success = option.success || noop;
    var fail = option.fail || noop;
    var onLoad = function () {
      var result = xhr.responseText;
      if (isSuccess(xhr)) {
        success(result);
      } else {
        fail(result);
      }
    }
    if ('onload' in xhr) {
      xhr.onload = onLoad;
    } else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          onLoad();
        }
      };
    }
    xhr.onerror = function (result) {
      fail(result);
    };

    xhr.send(option.body);
  }

  /* 事件处理器 */
  function EventEmitter() {
    var events = {};

    var on = function (name, event) {
      var currentEventList = events[name] || [];
      currentEventList.push(event);
      events[name] = currentEventList;
    };

    var off = function (name, event) {
      if (!event) {
        delete events[name];
      } else {
        var currentEventList = events[name];
        currentEventList && currentEventList.forEach(function (currentEvent) {
          if (currentEvent === event) {
            var index = currentEventList.indexOf(currentEvent);
            currentEventList.splice(index, 1);
          }
        });
      }
    };

    var emit = function (name, data) {
      let currentEventList = events[name] || [];
      currentEventList.forEach(function (event) {
        event(data);
      });
    };

    var clear = function () {
      events = {};
    };

    return {
      on: on,
      off: off,
      emit: emit,
      clear: clear
    };
  }

  function Timer() {
    function startTimeout(context) {
      context.timeout = setTimeout(function () {
        context.time ++;
        startTimeout(context);
      }, 1000);
    }
    function start() {
      startTimeout(this);
    }
    function stop() {
      clearTimeout(this.timeout);
    }
    function end() {
      this.stop();
      this.time = 0;
    }
    return function () {
      this.time = 0;
      this.timeout = null;
      this.start = start;
      this.stop = stop;
      this.end = end;

      return this;
    };
  }

  function CountDown() {
    var destroy = function () {
      clearTimeout(this.timeout);
    };
    return function (timeout, callback) {
      callback = callback || noop;
      this.destroy = destroy;
      this.timeout = setTimeout(callback, timeout);
    };
  }

  function timeToFormat(times) {
    var result = '00:00:00';
    var hour, minute, second
    if (times > 0) {
      hour = Math.floor(times / 3600);
      if (hour < 10) {
        hour = '0' + hour;
      }
      minute = Math.floor((times - 3600 * hour) / 60);
      if (minute < 10) {
        minute = '0' + minute;
      }

      second = Math.floor((times - 3600 * hour - 60 * minute) % 60);
      if (second < 10) {
        second = '0' + second;
      }
      result = hour + ':' + minute + ':' + second;
    }
    return result;
  }

  function uploadFile(url, file, token, callbacks) {
    var form = new win.FormData();
    form.append('file', file);
    form.append('token', token);
    var xhr = new XMLHttpRequest();
    xhr.open('post', url, true);
    xhr.onload = callbacks.onComplete;
    xhr.onerror = callbacks.onError;
    xhr.upload.onprogress = callbacks.onProgress;
    xhr.upload.onloadstart = callbacks.onLoadStart;
    xhr.send(form);
  }

  function loadFileBase64(file, opts) {
    opts = opts || {};
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
    var img = new Image();
    var URL = win.URL || win.webkitURL;
    var blob = URL.createObjectURL(file);
    var scale = opts.scale || 0.1;
    return new win.Promise(function (resolve, reject) {
      img.onload = function () {
        URL.revokeObjectURL(file);
        var width = img.width * scale;
        var height = img.height * scale;
        if (width < 50) {
          width = 50;
          height = img.height * (50 / img.width);
        } else if (height < 50) {
          height = 50;
          width = img.width * (50 / img.height);
        }
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);
        try {
          var base64 = canvas.toDataURL('image/jpeg');
          var reg = new RegExp('^data:image/[^;]+;base64,');
          base64 = base64.replace(reg, '');
          resolve(base64);
        } catch (e) {
          reject(e);
          throw new Error(e);
        }
      };
      img.src = blob;
    });
  }

  function closest(el, selector) {
    var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
      if (matchesSelector.call(el, selector)) {
        break;
      }
      el = el.parentElement;
    }
    return el;
  }

  function loadIframe(url) {
    return new win.Promise(function (resolve) {
      var iframe = document.createElement('iframe');
      iframe.src = url;
      if (iframe.attachEvent) {
        iframe.attachEvent('onload', function () {
          resolve(iframe);
        });
      } else {
        iframe.onload = function () {
          resolve(iframe);
        };
      }
      document.body.appendChild(iframe);
    });
  }

  function parseObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function entryFullScreen(el) {
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen ||
      el.mozRequestFullScreen || el.msRequestFullScreen;
    rfs.call(el);
  }

  function quitFullScreen() {
    var el = win.document;
    var cfs = el.exitFullscreen || el.webkitExitFullscreen ||
      el.mozCancelFullScreen;
    cfs.call(el);
  }

  function getCenterPosition() {
    return {
      top: '50%',
      left: '50%',
      // transform: 'translate(-50%, -50%)'
    };
  }

  function download(url) {
    win.open(url);
  }

  function setAllMute(isMute) {
    var muteMe = function (elem) {
      elem.muted = true;
      // elem.pause();
    };
    var unMuteMe = function (elem) {
      var selfVideoClassName = RongMeeting.instance.selfVideoClassName
      if (elem.className.indexOf(selfVideoClassName) === -1) {
        elem.muted = false;
      }
      // elem.play();
    };
    var videos = document.querySelectorAll('video');
    var audios = document.querySelectorAll('audio');
    [].forEach.call(videos, function (video) {
      isMute ? muteMe(video) : unMuteMe(video);
    });
    [].forEach.call(audios, function (audio) {
      isMute ? muteMe(audio) : unMuteMe(audio);
    });
  }

  function include(list, value) {
    return list.indexOf(value) !== -1;
  }

  function getThumbnailByVideo(video) {
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      imgHeight = video.videoHeight,
      imgWidth = video.videoWidth;
    ctx.drawImage(video, 0, 0, imgWidth, imgHeight);
    return canvas.toDataURL('image/png');
  }

  function getAttributeNames(el) {
    var attributes = el.attributes;
    var attrNameList = [];
    for (var i = 0; i < attributes.length; i++) {
      var attrName = attributes[i];
      attrNameList.push(attrName.name);
    }
    return attrNameList;
  }

  function getBrowser() {
    var userAgent = win.navigator.userAgent;
    var version;
    var type;

    /* 记录各浏览器名字和匹配条件 */
    var condition = {
      IE: /rv:([\d.]+)\) like Gecko|MSIE ([\d.]+)/,
      Edge: /Edge\/([\d.]+)/,
      Firefox: /Firefox\/([\d.]+)/,
      Opera: /(?:OPERA|OPR).([\d.]+)/,
      WeChat: /MicroMessenger/i,
      QQBrowser: /QQBrowser\/([\d.]+)/,
      Chrome: /Chrome\/([\d.]+)/,
      Safari: /Version\/([\d.]+).*Safari/,
      iOSChrome: /Mobile\/([\d.]+).*Safari/
    };

    for (var key in condition) {
      if (!condition.hasOwnProperty(key)) continue;
      var browserContent;
      if (browserContent = userAgent.match(condition[key])) {
        type = key;
        version = browserContent[1] || browserContent[2];
        break;
      }
    }
    return {
      type: type ? type : 'UnKonw',
      version: version ? version : 'UnKonw'
    };
  }

  function getBrowserType() {
    var BrowserType = RongMeeting.ENUM.BrowserType;
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == 'ipad';
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
    var bIsMidp = sUserAgent.match(/midp/i) == 'midp';
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
    var bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
    var bIsAndroid = sUserAgent.match(/android/i) == 'android';
    var bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
    var bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';
    var isPhone = bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
    return isPhone ? BrowserType.MOBILE : BrowserType.PC;
  }

  function formatUrl(url) {
    if (!url) {
      url = win.location.href;
    }
    var obj = {};
    var arr1 = url.split('?');
    arr1 = arr1[1];
    if (!arr1 || arr1.indexOf('&') === -1) {
      return {};
    }

    if (arr1 && arr1.indexOf('#') !== -1) {
      arr1 = arr1.split('#')[0];
    }

    var arr2 = arr1.split('&');
    for (var i = 0; i < arr2.length; i++) {
      var res = arr2[i].split('=');
      obj[res[0]] = res[1];
    }
    return obj;
  }

  function copyToClipBoard(content) {
    var common = RongMeeting.common;
    var btn = document.createElement('button');
    btn.id = 'copyBtn';
    btn.setAttribute('data-clipboard-text', content);
    btn.style.display = 'none';
    document.body.appendChild(btn);
    var clipboard = new win.ClipboardJS('#copyBtn');
    clipboard.on('success', function (e) {
      e.clearSelection();
    });
    clipboard.on('error', function (e) {
      common.console.error({ CopyErrorAction: e.action });
      common.console.error({ CopyErrorTrigger: e.trigger });
    });
    document.getElementById('copyBtn').click();
    document.body.removeChild(btn);
  }

  function setCopyById(id) {
    var common = RongMeeting.common;
    var clipboard = new win.ClipboardJS('#' + id);
    clipboard.on('success', function (e) {
      e.clearSelection();
    });
    clipboard.on('error', function (e) {
      common.console.error({ CopyErrorAction: e.action });
      common.console.error({ CopyErrorTrigger: e.trigger });
    });
  }

  function getEmailUrl(name, roomId, url) {
    url = win.encodeURIComponent(url);
    var emailTpl = 'mailto:?subject={subject}&body={content}';
    var subject = 'SealMeeting 会议邀请';
    var content = '{name} 邀请你加入 SealMeeting 视频会议:%0d%0a会议 ID: {roomId}%0d%0a会议链接: {url}%0d%0a%0d%0a点击会议链接立即加入会议。';
    content = tplEngine(content, {
      name: name,
      roomId: roomId,
      url: url
    });
    var email = tplEngine(emailTpl, {
      subject: subject,
      content: content
    });
    return email;
  }

  function sendEmail(name, roomId, url) {
    url = win.encodeURIComponent(url);
    var emailTpl = 'mailto:?subject={subject}&body={content}';
    var subject = 'SealMeeting 会议邀请';
    var content = '{name} 邀请你加入 SealMeeting 视频会议:%0d%0a会议 ID: {roomId}%0d%0a会议链接: {url}%0d%0a%0d%0a点击会议链接立即加入会议。';
    content = tplEngine(content, {
      name: name,
      roomId: roomId,
      url: url
    });
    var email = tplEngine(emailTpl, {
      subject: subject,
      content: content
    });
    win.open(email);
  }

  function generateName() {
    var date = new win.Date(),
      dateFormat = [date.getHours(), date.getMinutes(), date.getSeconds() ];
    dateFormat = dateFormat.map(function (time) {
      time = time + '';
      if (time.length === 1) {
        time = '0' + time;
      }
      return time;
    });
    dateFormat = dateFormat.join('');
    return '成员' + dateFormat;
  }

  function isIOSPlatform() {
    var u = navigator.userAgent;
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return isIOS;
  }

  function reverseArray(array) {
    var newArr = [];
    for (var i = array.length - 1; i >= 0; i--) {
      newArr.push(array[i]);
    }
    return newArr;
  }

  RongMeeting = RongMeeting || {};
  RongMeeting.utils = {
    noop: noop,
    isNull: isNull,
    extend: Object.assign,
    isString: isString,
    isObject: isObject,
    isArray: isArray,
    isObjectEmpty: isObjectEmpty,
    tplEngine: tplEngine,
    ajax: ajax,
    EventEmitter: EventEmitter(),
    Timer: Timer(),
    CountDown: CountDown(),
    timeToFormat: timeToFormat,
    uploadFile: uploadFile,
    loadFileBase64: loadFileBase64,
    closest: closest,
    loadIframe: loadIframe,
    parseObject: parseObject,
    entryFullScreen: entryFullScreen,
    quitFullScreen: quitFullScreen,
    getCenterPosition: getCenterPosition,
    download: download,
    setAllMute: setAllMute,
    include: include,
    getThumbnailByVideo: getThumbnailByVideo,
    encodeHtmlStr: encodeHtmlStr,
    getAttributeNames: getAttributeNames,
    getBrowser: getBrowser,
    getBrowserType: getBrowserType,
    formatUrl: formatUrl,
    copyToClipBoard: copyToClipBoard,
    setCopyById: setCopyById,
    sendEmail: sendEmail,
    getEmailUrl: getEmailUrl,
    generateName: generateName,
    isIOSPlatform: isIOSPlatform,
    reverseArray: reverseArray
  };
})(window.RongMeeting, {
  win: window
});