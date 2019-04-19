## 用户操作

### 文件位置

`UI 模板:` components/user-list/user-opt/user-opt.html

`逻辑操作:` components/user-list/user-opt/user-opt.js

### 子模块

`用户操作模块:` 

> props

|  属性名      | 类型     | 说明     |
| :---------- | :------- | :------- |
| user |  Object | 操作用户 |
| loginUser | Object |  登录用户 |
| userList |  Array | 房间人员列表 |

> data

|  属性名      | 类型     | 说明     |
| :---------- | :------- | :------- |
| isUpgradeInviting | Boolean |  是否正在邀请列席升级 |
| isSpeechApplying |  Boolean | 是否正在申请发言 |

> computed

|  属性名      | 类型     | 说明     |
| :---------- | :------- | :------- |
| role | Number | 用户角色 |
| isLoginUser | Boolean | 是否为登录用户 |
| isCanSetAssistant | Boolean | 登录用户是否有转让主持人权限 |
| isCanSetTeacher | Boolean | 登录用户是否有设置主讲人权限 |
| isCanSetVideoAudio | Boolean | 登录用户是否有操作摄像头/麦克风权限 |
| isCanDowngrade | Boolean | 登录用户是否有降级参会人权限 |
| isCanUpgrade | Boolean | 登录用户是否有升级学员权限 |
| isVideoClosed | Boolean | 操作用户摄像头是否已关闭 |
| isAudioClosed | Boolean | 操作用户麦克风是否已关闭 |

> methods

##### setAssistant

转让主讲人(仅当自己为主持人时执行)

##### setTeacher

设置主讲人(仅当自己为主持人时执行)

##### setMicro

打开/关闭麦克风(仅当自己为主持人时执行)

##### setCamera

打开/关闭摄像头(仅当自己为主持人时执行)

##### downgrade

降级参会人(仅当自己为主持人时执行)

##### inviteUpgrade

邀请学员升级(仅当自己为主持人时执行)

##### watchInviteUpgradeResult

监听邀请学员升级结果(仅当自己为主持人时执行)

##### kick

踢人(仅当自己为主持人时执行)

##### applySpeech

申请发言(仅当自己为列席时执行)

##### watchApplySpeechResult

监听申请发言的结果(仅当自己为列席时执行)