(function (RongClass, dependencies) {
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
      elem.muted = false;
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
    var BrowserType = RongClass.ENUM.BrowserType;
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
    var common = RongClass.common;
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
    var common = RongClass.common;
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
    var familyNames = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟黄穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁锺徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄麹家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫甯仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊澹台公冶宗政濮阳淳于单于太叔申屠公孙仲孙轩辕令狐锺离宇文长孙慕容鲜于闾丘司徒司空亓官司寇仉督子车颛孙端木巫马公西漆雕乐壤驷公良拓跋夹谷宰父穀梁晋楚闫法汝鄢涂钦段干百里东郭南门呼延归海羊舌微生岳帅缑亢况後有琴梁丘左丘东门西门商牟佘佴伯赏南宫墨哈谯笪年爱阳佟'
    familyName = familyNames.split('');
    var givenNames = '卓喆 杰晖 腾琛 运安 福远 升佳 加胤 谷栋 佑锦 佳寅 坤琛 翰凯 运嘉 晓振 勇中 加佳 芃奇 星沛 凡祜 天驰  博涛 寅柏 锟鹤 福栋 远恒 强辰 骞驰 枫濡 良材 允勇 加奇 鸿海 家权 峰杰 翰驰 升钊 安中 喆康 允睿 栋寅  暄祯 晖杰 尧钊 谷权 祥礼 翰槐 日辰 良韦 桓仕 潍林 诚琛 芃澄 起强 谷康 吉允 晓鹏 侠振 韦杰 文良 斌日  沛沛 欣祜 轩帝 尧阳 禄皓 德皓 腾博 涛鸿 凯锦 海德 起钊 奇鑫 沛翰 槐锦 晨福 峰权 成星 钊贤 潍祯 炳祯  帆祜 睿皓 佑仕 坤起 郁坤 斌蔓 辞杰 材潍 逸杞 仕天 良晖 俊斌 林然 睿年 彬振 文哲 辰卓 琛鸿 锐平 辰初  海杞 嘉荣 梓仕 日潍 弘禄 槐阳 锦澄 炳腾 楷康 福骞 锦良 阳坤 轩运 家帝 杞远 彬楷 泽杰 谛卓 德铭 信烁  桓枫 凯祯 裕骞 宇贤 运材 振驰 勇家 帆成 良中 畅翰 安暄 年祯 邦远 平振 远升 博乘 权浩 翰欣 祯澄 仕驰  嘉峰 加暄 轩桓 伟震 荣槐 福涛 宇康 星星 祜乘 哲梓 皓福 浩郁 远晖 俊平 升翱 俊暄 逸坤 奇禧 炳延 芃裕  鹏梁 皓强 礼华 阳延 贤良 卓禧 琛睿 锟华 升禧 信祯 梁锦 贤寅 辰龙 仕坤 安皓 翱良 康禄 辰锦 中铭 中澄  佑林 诚日 枫良 鸿奇 起信 涛杰 烁远 宇晓 帆芃 平浩 濡谛 翱谛 恒伟 骏安 辞禄 泽寅 枫延 柏泽 宇祥 加彬  乘弘 坤震 奇骏 濡晖 年帝 帆睿 晨晨 祜宇 允辰 信斌 琛哲 禧恒 琛韦 韦骏 郁信 德琛 日锟 铭谛 瑞乘 喆瑞  逸沛 梓翰 鸿升 凡哲 祯喆 杞骏 钊日 晓锋 皓凡 宇卓 辰中 家天 祥禄 盛晓 奇祯 恒彬 仕家 仕起 皓骞 良德  瑶家 瑶丽 茹鸿 寒杉 莉梦 昕雯 阳玥 玉茹 橘珊 灵桃 淑蕾 柔克 香颖 香歆 呈璐 惠嘉 妍颖 芙璐 雅楠 灵欢  娅涵 惠舒 雨娅 媛优 桂娜 栀碧 雨彤 玉珍 琬珊 静洁 楠馨 采锦 月雪 雯珊 香珠 依鹤 杉薇 嘉漫 露雪 薇洁  颖怡 灵依 霞冰 珊栀 芙华 心珍 珠惠 克岚 栀香 彤冰 钰淑 菡帆 曼曼 妮桃 祥倩 珠初 灵洁 彬倩 莉依 桃锦  采颖 凡淑 菡华 林玥 弦碧 娅彩 柔彬 嘉珍 晨娅 香春 曦雨 寒玲 依玲 沛玥 璐优 桐蓓 正珊 婧心 正娅 橘雪  瑶香 格钰 静漫 鑫珠 克媛 韵璟 琪玥 寒瑶 妮雯 采文 曼娜 雪花 优香 柔雅 雪紫 心曼 香茹 茜洲 橘雅 明静  雯杉 倩芸 鹤璇 昕倩 曼玲 瑶冬 妍薇 珊琛 雯琪 岚芙 莲珠 梓歆 沛岚 文露 雅雨 璟蕾 花漫 娅琬 璇格 梓钰  帆芙 芸妍 昕琬 彦娜 静旭 杉曼 寒珠 芝漫 彤晨 玉霞 敏妮 馨涵 漫怡 玉雯 莲梅 倩诗 雅馨 彤桂 涵梓 彩珊  文珊 珠芳 妍梦 舒玉 洁桃 颖娅 蔚桃 琳克 彤茹 珠月 玥杉 涵香 冬凌 梓花 静璐 菲妮 婧妮 梦昕 媛冰 格妍  莲心 欢珠 华花 倩珍 玲敏 芳函 梓芝 慧柔 茜欣 涵凡 昕娅 蔚珍 曼正 丽鹤 蓓雯 正芳 曼琬 桐采 雨雨 蓓俊  彩弦 芳正 馨云 楠莉 慧彦 妮薇 璇俊 函芝 芙文 慧茜 莉娅 岚桃 漫雨 茜雪 丽菡 梓梦 锦莉 嘉露 岚昭 娅芙  慧昕 娅桃 鑫香 萱钰 锦珠 怡凡 晨芙 茜玉 蓓帆 茜琳 韵芳 雯曼 芝格 栀瑶 玥敏 岚璟 依凡 洁采 紫枫 梦橘  桃娅 琳珊 梦漫 莲栀 梓娅 玲茜 婧帆 娜欢 格萱 彩昕 韵瑶 诗曼 洁春 蔚妮 柏菲 慧依 晨淑 霞杉 妮冬 楠玉 满 琳 锐 艺博 伟 辰硕 鸿轩 涵润 涵涵 兴 淳曦 雨微 钧涵 浩晏 芊语 乐怡 皓月 文田 文田 文田 禹勋 思卓 国珍 建 天佑 昕 玥婷 浩南 玥雯 天睿 雨辰 靖雯 镜雯 翠楠 镜文 静文 静雯 楠 之骏 子骏 九雏 韬茫 麒鄄 丹 椒勃 泊君 诗议 思馨 誉涵 思思 梦菲 贤博 博琨 复贤 博贤 博毅 博逸 肇博 博儒 傲野 韬韧 傲瑜 傲璇 傲煦 傲昭 韬博 傲琬 傲玥 傲熙 傲漾 傲泠 傲琪 傲钰 傲珂 傲珺 傲瑾 傲琇 君晗 君煦 令煦 令璟 君玥 君熙 君汐 君若 君瑾 君皓 君 珺瑾 文正 傲 傲珣 傲沛 傲汐 傲暄 傲天 傲宸 傲辰 傲玖 志文 傲君 引引 恒昊 耀丹 羽诺 柳诺 易卓 庆和 博宇 继豪 琛杰 沐晴 泽林 琪欧 语萱 又亿 乙苈 梓涛 双富 慧慧 宇涵 崇晟 博韬 淑玲 凯琪 金玲 炣萱 茹涵 茹晞 邵远 少杰 梓萌 乐 晗昱 子萌 健 瑞健 振俨 浩宇 景彤 辰熙 浩淼 逸凡 荣琪 忆晓 思瑶 泽铭 志源 子腾 依然 春凤 熠涵 耀夫 耀弟 庆宇 庆涵 庆超 仪涵 典国 庸淏 庸灏 庸濠 庆通 庸浩 庆松 庆煜 庆 庸泽 庆烁 庆柯 嘉宝 婉婷 炜涵 奕涵 猛 帅军 步伊 绮梦 锡傲 梓芊 玲菊 玲颖 玲嘉 玲琳 玲睿 芳源 芳菲 翰 梓琼 璟雯 凡祯 浩阳 浩晨 静 鸿煊 鸿炫 子涵 道义 睿静 志轩 紫绮 惜春 宇鑫 佳睿 睿鑫 梓皓 书诚 梓浩 浩喆 书芳 一翔 一帆 曦晨 书琴 思颖 钧涵 雅萱 志鹏 璐焓 艺诺 梓炜 艺 燚洲 溢烊 溢阳 一煜 煜一 煜洲 熠洋 熠洲 子曦 一洲 子龙 子旭 燚 玮祯 维彬 祥博 祥闻 祥贵 柄祥 鑫祥 柯鑫 轲鑫 可鑫';
    givenNames = givenNames.split(' ');
    givenNames = givenNames.filter(function (name) {
      return name !== '';
    });

    var familyLength = familyNames.length - 1;
    var i = Math.round(Math.random() * familyLength)
    var familyName = familyNames[i];

    var givenLength = givenNames.length - 1;
    var j = Math.round(Math.random() * givenLength)
    var givenName = givenNames[j];

    var name = familyName + givenName;
    return name;
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

  RongClass = RongClass || {};
  RongClass.utils = {
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
})(window.RongClass, {
  win: window
});