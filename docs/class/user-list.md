## 用户列表

![image](../image/user-list.png)

### 文件位置

`UI 模板:` components/user-list/user-list.html

`逻辑操作:` components/user-list/user-list.js

### 子模块

`用户操作模块:` [user-opt](./user-opt.md)

> props

|  属性名      | 类型     | 说明     |
| :---------- | :------- | :------- |
| loginUser | Object |  登录用户 |
| userList |  Array | 房间人员列表 |

> data

|  属性名      | 类型     | 说明     |
| :---------- | :------- | :------- |
| isSpeechApplying | Boolean | 是否正在申请中 |

> computed

|  属性名      | 类型     | 说明     |
| :---------- | :------- | :------- |
| sortedUserList | Array | 根据角色排序后的用户列表 |

> methods

#### isShowRole

是否展示角色名(仅主持人、主讲人展示)

#### getRoleName

根据 user 获取角色名

#### watchApplySpeech

监听列席申请成为学员(仅当自己为主持人时触发)

#### watchInviteUpgrade

监听主持人邀请成为学院(仅当自己为列席时触发)

#### watchControlDevice

监听主持人邀请打开麦克风/摄像头

#### approveSpeech

同意列席发言(仅当自己为主持人时执行)

#### rejectSpeech

拒绝列席发言(仅当自己为主持人时执行)

#### degradePerson

降级参会人(仅当自己为主持人时执行)

#### applyDegrade

降级参会人弹框提示(仅当自己为主持人时执行)

#### approveUpgrade

同意主持人的升级邀请(仅当自己为列席时执行)

#### rejectUpgrade

拒绝主持人的升级邀请(仅当自己为列席时执行)

#### approveControlDevice

同意主持人打开自己的摄像头/麦克风(仅当自己为列席时执行)

#### rejectControlDevice

拒绝主持人打开自己的摄像头/麦克风(仅当自己为列席时执行)