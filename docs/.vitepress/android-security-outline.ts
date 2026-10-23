// Original outline order; ids match planning/android-security-source.md.
// Keep the overview and sidebar in this order. Detailed articles may cover several points.
export interface SecurityOutlineItem {
  id: number
  text: string
  link: string
  collapsed?: boolean
  items?: SecurityOutlineItem[]
}

export const androidSecurityOutline: SecurityOutlineItem[] = [
  {
    "id": 3,
    "text": "通用组件安全",
    "link": "/security/android/component-security.html",
    "collapsed": false,
    "items": [
      {
        "id": 6,
        "text": "Activity",
        "link": "/security/android/component-security.html#s6",
        "collapsed": false,
        "items": [
          {
            "id": 9,
            "text": "权限与属性设置",
            "link": "/security/android/component-security.html#s9"
          },
          {
            "id": 12,
            "text": "组件暴露",
            "link": "/security/android/component-security.html#s12"
          },
          {
            "id": 15,
            "text": "Intent 接收/发送安全",
            "link": "/security/android/component-security.html#s15"
          },
          {
            "id": 18,
            "text": "Scheme URL / intent-based URI 启动组件",
            "link": "/security/android/component-security.html#s18"
          },
          {
            "id": 21,
            "text": "安全键盘配置漏洞",
            "link": "/security/android/component-security.html#s21"
          }
        ]
      },
      {
        "id": 24,
        "text": "BroadcastReceiver",
        "link": "/security/android/component-security.html#s24",
        "collapsed": true,
        "items": [
          {
            "id": 27,
            "text": "动态广播组件暴露",
            "link": "/security/android/component-security.html#s27"
          },
          {
            "id": 30,
            "text": "静态广播组件暴露",
            "link": "/security/android/component-security.html#s30"
          },
          {
            "id": 33,
            "text": "Receiver 嗅探",
            "link": "/security/android/component-security.html#s33"
          },
          {
            "id": 36,
            "text": "粘性广播与敏感数据",
            "link": "/security/android/component-security.html#s36"
          }
        ]
      },
      {
        "id": 39,
        "text": "Service",
        "link": "/security/android/component-security.html#s39",
        "collapsed": true,
        "items": [
          {
            "id": 42,
            "text": "Service 组件暴露安全",
            "link": "/security/android/component-security.html#s42"
          },
          {
            "id": 45,
            "text": "Service 劫持",
            "link": "/security/android/component-security.html#s45"
          },
          {
            "id": 48,
            "text": "AIDL 接口安全",
            "link": "/security/android/component-security.html#s48"
          },
          {
            "id": 51,
            "text": "Messenger 服务安全",
            "link": "/security/android/component-security.html#s51"
          },
          {
            "id": 54,
            "text": "前台服务安全",
            "link": "/security/android/component-security.html#s54"
          }
        ]
      },
      {
        "id": 57,
        "text": "ContentProvider",
        "link": "/security/android/component-security.html#s57",
        "collapsed": true,
        "items": [
          {
            "id": 60,
            "text": "组件暴露安全",
            "link": "/security/android/component-security.html#s60"
          },
          {
            "id": 63,
            "text": "Provider 文件目录遍历漏洞",
            "link": "/security/android/component-security.html#s63"
          },
          {
            "id": 66,
            "text": "Provider uriPath 权限控制",
            "link": "/security/android/component-security.html#s66"
          },
          {
            "id": 69,
            "text": "SQL 注入",
            "link": "/security/android/component-security.html#s69"
          },
          {
            "id": 72,
            "text": "隐式 Intent 的 URI 操作权限",
            "link": "/security/android/component-security.html#s72"
          },
          {
            "id": 75,
            "text": "getType() 方法安全",
            "link": "/security/android/component-security.html#s75",
            "collapsed": true,
            "items": [
              {
                "id": 78,
                "text": "MIME 查询原理与权限边界",
                "link": "/security/android/component-security.html#s78"
              },
              {
                "id": 81,
                "text": "空 URI 与未定义 URI",
                "link": "/security/android/component-security.html#s81"
              }
            ]
          },
          {
            "id": 84,
            "text": "authority 劫持",
            "link": "/security/android/component-security.html#s84",
            "collapsed": true,
            "items": [
              {
                "id": 87,
                "text": "authority 唯一性与抢先安装",
                "link": "/security/android/component-security.html#s87"
              }
            ]
          },
          {
            "id": 90,
            "text": "FileProvider 共享目录范围",
            "link": "/security/android/component-security.html#s90",
            "collapsed": true,
            "items": [
              {
                "id": 93,
                "text": "共享范围过大的风险",
                "link": "/security/android/component-security.html#s93"
              },
              {
                "id": 96,
                "text": "共享路径最小化防护",
                "link": "/security/android/component-security.html#s96"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 99,
    "text": "配置安全",
    "link": "/security/android/configuration-security.html",
    "collapsed": true,
    "items": [
      {
        "id": 102,
        "text": "应用程序只申请必要的权限",
        "link": "/security/android/configuration-security.html#s102"
      },
      {
        "id": 105,
        "text": "应用的 UID 权限",
        "link": "/security/android/configuration-security.html#s105"
      },
      {
        "id": 108,
        "text": "sharedUserId 与 UID 共享",
        "link": "/security/android/configuration-security.html#s108"
      },
      {
        "id": 111,
        "text": "reboot 权限",
        "link": "/security/android/configuration-security.html#s111"
      },
      {
        "id": 114,
        "text": "release 配置：debuggable 与 allowBackup",
        "link": "/security/android/configuration-security.html#s114"
      },
      {
        "id": 117,
        "text": "自定义权限保护等级",
        "link": "/security/android/configuration-security.html#s117"
      },
      {
        "id": 120,
        "text": "私有组件的 taskAffinity 与 launchMode",
        "link": "/security/android/configuration-security.html#s120"
      },
      {
        "id": 123,
        "text": "自定义权限的系统命名空间",
        "link": "/security/android/configuration-security.html#s123"
      },
      {
        "id": 126,
        "text": "对外导出组件的访问权限",
        "link": "/security/android/configuration-security.html#s126"
      },
      {
        "id": 129,
        "text": "APK 暗码与隐藏入口",
        "link": "/security/android/configuration-security.html#s129"
      },
      {
        "id": 132,
        "text": "meta-data 中的敏感数据",
        "link": "/security/android/configuration-security.html#s132"
      },
      {
        "id": 135,
        "text": "应用状态与设备或账号关联",
        "link": "/security/android/configuration-security.html#s135"
      },
      {
        "id": 138,
        "text": "软件卸载后的残留信息检查",
        "link": "/security/android/configuration-security.html#s138"
      },
      {
        "id": 141,
        "text": "头像本地缓存的大小和有效性",
        "link": "/security/android/configuration-security.html#s141"
      },
      {
        "id": 144,
        "text": "META-INF 中的 APK、ODEX、SO",
        "link": "/security/android/configuration-security.html#s144"
      },
      {
        "id": 147,
        "text": "剪贴板安全使用",
        "link": "/security/android/configuration-security.html#s147"
      },
      {
        "id": 150,
        "text": "应用混淆规则增强",
        "link": "/security/android/configuration-security.html#s150"
      },
      {
        "id": 153,
        "text": "模拟位置检查",
        "link": "/security/android/configuration-security.html#s153"
      },
      {
        "id": 156,
        "text": "开发者选项与模拟位置应用检测",
        "link": "/security/android/configuration-security.html#s156"
      },
      {
        "id": 159,
        "text": "插件动态加载",
        "link": "/security/android/configuration-security.html#s159"
      }
    ]
  },
  {
    "id": 162,
    "text": "文件操作",
    "link": "/security/android/file-operations.html",
    "collapsed": true,
    "items": [
      {
        "id": 165,
        "text": "文件上传",
        "link": "/security/android/file-operations.html#s165"
      },
      {
        "id": 168,
        "text": "文件下载",
        "link": "/security/android/file-operations.html#s168"
      },
      {
        "id": 171,
        "text": "文件读写",
        "link": "/security/android/file-operations.html#s171"
      },
      {
        "id": 174,
        "text": "BitmapFactory 图片解析与 OOM",
        "link": "/security/android/file-operations.html#s174"
      }
    ]
  },
  {
    "id": 177,
    "text": "特殊函数",
    "link": "/security/android/special-functions.html",
    "collapsed": true,
    "items": [
      {
        "id": 180,
        "text": "命令执行安全",
        "link": "/security/android/special-functions.html#s180"
      },
      {
        "id": 183,
        "text": "解压安全",
        "link": "/security/android/special-functions.html#s183"
      },
      {
        "id": 186,
        "text": "getPathSegments 函数",
        "link": "/security/android/special-functions.html#s186"
      },
      {
        "id": 189,
        "text": "序列化安全",
        "link": "/security/android/special-functions.html#s189"
      },
      {
        "id": 192,
        "text": "JEXL 表达式注入",
        "link": "/security/android/special-functions.html#s192"
      },
      {
        "id": 195,
        "text": "TA 文件安全",
        "link": "/security/android/special-functions.html#s195"
      }
    ]
  },
  {
    "id": 198,
    "text": "Dos攻击",
    "link": "/security/android/dos-attacks.html",
    "collapsed": true,
    "items": [
      {
        "id": 201,
        "text": "Intent.setPackage 安全",
        "link": "/security/android/dos-attacks.html#s201"
      },
      {
        "id": 204,
        "text": "uri.getQueryParameter",
        "link": "/security/android/dos-attacks.html#s204"
      },
      {
        "id": 207,
        "text": "Fragment 框架注入（PreferenceActivity）",
        "link": "/security/android/dos-attacks.html#s207"
      },
      {
        "id": 210,
        "text": "Base64.decode 解码安全",
        "link": "/security/android/dos-attacks.html#s210"
      },
      {
        "id": 213,
        "text": "带 Flags 的 Intent 启动组件",
        "link": "/security/android/dos-attacks.html#s213",
        "collapsed": true,
        "items": [
          {
            "id": 216,
            "text": "URI 读写授权与 addFlags / setFlags",
            "link": "/security/android/dos-attacks.html#s216"
          },
          {
            "id": 219,
            "text": "URI 外部可控条件",
            "link": "/security/android/dos-attacks.html#s219"
          }
        ]
      },
      {
        "id": 222,
        "text": "getContentResolver() 安全",
        "link": "/security/android/dos-attacks.html#s222",
        "collapsed": true,
        "items": [
          {
            "id": 225,
            "text": "不可信 URI 的访问边界",
            "link": "/security/android/dos-attacks.html#s225"
          }
        ]
      },
      {
        "id": 228,
        "text": "EditText.setSelection() 光标定位",
        "link": "/security/android/dos-attacks.html#s228",
        "collapsed": true,
        "items": [
          {
            "id": 231,
            "text": "外部文本与 maxLength 条件",
            "link": "/security/android/dos-attacks.html#s231"
          }
        ]
      },
      {
        "id": 234,
        "text": "getPackageInfo 安全",
        "link": "/security/android/dos-attacks.html#s234",
        "collapsed": true,
        "items": [
          {
            "id": 237,
            "text": "Binder 事务预算、flags 与异常处理",
            "link": "/security/android/dos-attacks.html#s237"
          }
        ]
      },
      {
        "id": 240,
        "text": "URLDecoder.decode 解码安全",
        "link": "/security/android/dos-attacks.html#s240"
      }
    ]
  }
]
