<template>
  <div class="index">
    <h1 class="ant-descriptions-title">项目进程占用信息</h1>
    <a-row :gutter="100">
      <a-col :span="6" class="desc">
        <a-card
          style="background-image:linear-gradient(to right, rgb(102, 229, 181), rgb(41, 224, 105));color:white;border-radius: 25px;"
          :loading="loading"
        >
          <p class="process-desc">内存分配大小</p>
          <p>{{ systemInfos && systemInfos.course.total }}</p>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card
          style="background-image:linear-gradient(to right, rgb(255, 118, 87), rgb(227, 74, 74));color:white;border-radius: 25px;"
          :loading="loading"
        >
          <p class="process-desc">内存使用情况</p>
          <p>{{ systemInfos && systemInfos.course.used }}</p>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card
          style="background-image:linear-gradient(to right, rgb(52, 181, 229), rgb(46, 132, 224));color:white;border-radius: 25px;"
          :loading="loading"
        >
          <p class="process-desc">驻留集大小</p>
          <p>{{ systemInfos && systemInfos.course.rss }}</p>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card
          style="background-image:linear-gradient(to right,rgb(93, 222, 222) , #e0da26);color:white;border-radius: 25px;"
          :loading="loading"
        >
          <p class="process-desc">V8内存使用情况</p>
          <p>{{ systemInfos && systemInfos.course.external }}</p>
        </a-card>
      </a-col>
    </a-row>
    <br />
    <a-skeleton active :paragraph="{ rows: 15, width: '50vw' }" :loading="loading" />
    <a-descriptions title="系统信息" layout="vertical" bordered v-if="!loading">
      <a-descriptions-item label="内存使用率" :span="1">
        <v-chart :options="polar" />
      </a-descriptions-item>
      <a-descriptions-item label="CPU各项数值" :span="2">
        <v-chart :options="option" />
      </a-descriptions-item>
      <a-descriptions-item label="主机名称" :span="1">
        {{ systemInfos.hostName }}
      </a-descriptions-item>
      <a-descriptions-item label="操作系统名" :span="2">
        {{ systemInfos.systemType }}
      </a-descriptions-item>
      <a-descriptions-item label="系统 CPU 架构" :span="1">
        {{ systemInfos.Architecture }}
      </a-descriptions-item>
      <a-descriptions-item label="操作系统的发行版本" :span="2">
        {{ systemInfos.version }}
      </a-descriptions-item>
      <a-descriptions-item label="运行时间" :span="1">
        {{ operationDate }}
      </a-descriptions-item>
      <a-descriptions-item label="根目录" :span="2">
        {{ systemInfos.cwd }}
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script>
  import { Common } from 'mixins'
  import 'echarts/map/js/world'
  export default {
    activated() {
      clearInterval(this.timer)
      this.$emit('ChangeBreadcrumb', this.routers)
      this.timer = setInterval(async () => {
        this.systemInfos = await (
          await fetch(`${this.$config.server}/systemInfo`, {
            headers: {
              Authorization: JSON.parse(localStorage.getItem('access'))
            }
          })
        ).json()
      }, this.Interval * 1000)
    },
    watch: {
      systemInfos: function(val, old) {
        this.refresh()
      }
    },
    deactivated() {
      clearInterval(this.timer)
    },
    async created() {
      try {
        this.systemInfos = await (
          await fetch(`${this.$config.server}/systemInfo`, {
            headers: {
              Authorization: JSON.parse(localStorage.getItem('access'))
            }
          })
        ).json()
        if (this.systemInfos.name === 'TokenExpiredError') throw new Error('认证已过期,请重新认证')
      } catch (error) {
        this.$message.error({ content: error.toString(), duration: 5 })
        return this.$router.push('auth')
      }
      this.polar.title.text = '内存总量: ' + this.formatFileSize(this.systemInfos.totalRAM)
      this.option.title.text = this.systemInfos.cpuInfo[0].model
    },
    mounted() {
      clearInterval(this.timer)
      this.timer = setInterval(async () => {
        this.systemInfos = await (
          await fetch(`${this.$config.server}/systemInfo`, {
            headers: {
              Authorization: JSON.parse(localStorage.getItem('access'))
            }
          })
        ).json()
      }, this.Interval * 1000)
    },
    data() {
      return {
        loading: true,
        systemInfos: null,
        Interval: 10,
        timer: null,
        routers: [
          {
            path: '/',
            breadcrumbName: '首页'
          }
        ],
        polar: {
          tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
          },
          title: {
            text: 'loading...',
            textStyle: {
              color: 'rgba(0, 0, 0, 0.45)',
              fontSize: 14
            }
          },
          series: [
            {
              name: '内存使用率',
              type: 'gauge',
              // center: ['20%', '50%'],
              radius: '40%',

              splitNumber: 10,
              axisLine: {
                lineStyle: {
                  color: [
                    [0, '#468EFD'],
                    [1, '#333']
                  ],
                  width: 8
                }
              },
              axisLabel: {
                show: false
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false
              },
              itemStyle: {
                show: false
              },
              detail: {
                formatter: function(value) {
                  if (value !== 0) {
                    var num = Math.round(value)
                    return parseInt(num).toFixed(0) + '%'
                  } else {
                    return 0
                  }
                },
                offsetCenter: [0, 82],
                textStyle: {
                  padding: [0, 0, 0, 0],
                  fontSize: 18,
                  fontWeight: '800',
                  color: '#468EFD'
                }
              },
              title: {
                //标题
                show: true,
                offsetCenter: [0, 46], // x, y，单位px
                textStyle: {
                  color: 'rgba(0,0,0,.5)',
                  fontSize: 12, //表盘上的标题文字大小
                  fontWeight: 400,
                  fontFamily: 'PingFangSC'
                }
              },
              data: [
                {
                  name: '内存使用率',
                  value: 100
                }
              ],
              pointer: {
                show: true,
                length: '75%',
                radius: '20%',
                width: 10 //指针粗细
              },
              animationDuration: 4000
            },
            {
              name: '外部刻度',
              type: 'gauge',
              //  center: ['20%', '50%'],
              radius: '50%',
              min: 0, //最小刻度
              max: 100, //最大刻度
              splitNumber: 20, //刻度数量
              startAngle: 225,
              endAngle: -45,
              axisLine: {
                show: true,
                lineStyle: {
                  width: 1
                }
              }, //仪表盘轴线
              axisLabel: {
                show: true,
                color: '#4d5bd1',
                distance: 25,
                formatter: function(v) {
                  switch (v + '') {
                    case '0':
                      return '0'
                    case '10':
                      return '10'
                    case '20':
                      return '20'
                    case '30':
                      return '30'
                    case '40':
                      return '40'
                    case '50':
                      return '50'
                    case '60':
                      return '60'
                    case '70':
                      return '70'
                    case '80':
                      return '80'
                    case '90':
                      return '90'
                    case '100':
                      return '100'
                  }
                }
              }, //刻度标签。
              axisTick: {
                show: true,
                splitNumber: 7,
                lineStyle: {
                  color: '#468EFD', //用颜色渐变函数不起作用
                  width: 1
                },
                length: -8
              }, //刻度样式
              splitLine: {
                show: true,
                length: -20,
                lineStyle: {
                  color: '#468EFD' //用颜色渐变函数不起作用
                }
              }, //分隔线样式
              detail: {
                show: false
              },
              pointer: {
                show: false
              }
            }
          ]
        },
        option: {
          title: {
            text: 'loading...',
            textStyle: {
              color: 'rgba(0, 0, 0, 0.45)',
              fontSize: 14
            }
          },
          tooltip: {},
          legend: {
            top: 35,
            itemWidth: 12,
            itemHeight: 12,
            data: ['loading...'],
            textStyle: {
              color: 'rgba(0,0,0,.5)'
            }
          },
          radar: {
            radius: '60%',
            splitNumber: 8,
            axisLine: {
              lineStyle: {
                color: 'rgba(0,0,0,.5)',
                opacity: 0.2
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0,0,0,.5)',
                opacity: 0.2
              }
            },
            splitArea: {
              areaStyle: {
                color: 'rgba(127,95,132,.3)',
                opacity: 1,
                shadowBlur: 45,
                shadowColor: 'rgba(0,0,0,.5)',
                shadowOffsetX: 0,
                shadowOffsetY: 15
              }
            },

            indicator: [
              {
                name: '用户模式'
              },
              {
                name: '良好模式'
              },
              {
                name: '系统模式'
              },
              {
                name: '空闲模式'
              },
              {
                name: '中断请求模式'
              }
            ]
          },
          series: [
            {
              type: 'radar',
              symbolSize: 0,
              areaStyle: {
                normal: {
                  shadowBlur: 13,
                  shadowColor: 'rgba(0,0,0,.2)',
                  shadowOffsetX: 0,
                  shadowOffsetY: 10,
                  opacity: 1
                }
              },
              data: [
                {
                  value: [5000, 7000, 12000, 11000, 15000, 14000],
                  name: 'loading...'
                }
              ]
            }
          ],
          color: [
            '#ef4b4c',
            '#b1eadb',
            '#9b59b6',
            '#f1c40f',
            '#546de5',
            '#786fa6',
            '#f78fb3',
            '#f7d794'
          ]
        }
      }
    },
    methods: {
      refresh() {
        if (!this.systemInfos) return this.$message.error({ content: '未知错误' })
        this.loading = false
        this.polar.series[0].data[0].value = this.systemInfos.usedRAN
        this.polar.series[0].axisLine.lineStyle.color[0][0] = this.systemInfos.usedRAN / 100
        let format = this.formatCpuData()
        this.option.series[0].data = format
        this.option.legend.data = format.map(item => item.name)
      },
      formatCpuData() {
        return this.systemInfos.cpuInfo.map((item, index) => {
          return {
            name: `${index + 1}核`,
            value: Object.keys(item.times).map(item2 => ~~(item.times[item2] / 1000 / 60))
          }
        })
      }
    },
    computed: {
      operationDate() {
        let minute = ~~(this.systemInfos.operation / 60),
          hours = ~~(minute / 60),
          day = ~~(hours / 24),
          month = ~~(day / 31),
          year = ~~(month / 12)
        return `${year ? year + '年' : ''}${month ? month + '月' : ''}${day ? day + '日' : ''}${
          hours ? hours + '时' : ''
        }${minute % 60}分`.replace(/\s/g, '')
      }
    },
    mixins: [Common]
  }
</script>

<style lang="stylus" scoped>
  .index
    overflow auto
    overflow-x: hidden;
  .echarts
    width: 800px;
    height: 500px;
  .process-desc
    font-size: 20px
    white-space nowrap
    p
      font-size 14px
</style>
