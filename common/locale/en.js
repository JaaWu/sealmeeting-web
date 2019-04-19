(function (RongClass) {
  RongClass.locale = RongClass.locale || {};
  RongClass.locale.en = {
    login: {
      classId: '输入会议 ID',
      classEmptyError: '会议 ID 不能为空',
      classLengthError: '支持数字、字母和汉字, 最多 40 个字符',
      name: '输入姓名',
      nameEmptyError: '姓名不能为空',
      nameLengthError: '支持汉字、字母和数字, 最多 10 个字符',
      listener: '列席',
      closeVideo: '加入时关闭视频',
      join: '加入会议',
      resolution: '分辨率'
    },
    errorCode: {
      /* 应用自定义错误码提示 */
      '-1000': '连接聊天室失败',
      '-1001': '获取 IM Token 失败',
      '-2000': '获取本地视频失败'
    }
  };
})(window.RongClass);