<template>
  <div id="app">
    <a-progress
      :stroke-color="{
        from: '#108ee9',
        to: '#87d068'
      }"
      :percent="precentNum"
      status="active"
      class="progress"
      :showInfo="false"
    />
    <a-layout id="components-layout-demo-custom-trigger" v-if="current">
      <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
        <h1 class="logo" :class="{ 'logo-hide': collapsed }">TYList</h1>
        <a-menu
          theme="dark"
          mode="inline"
          :forceSubMenuRender="true"
          :default-selected-keys="[current]"
          :selected-keys="[current]"
          @click="handleClick"
          :defaultOpenKeys="subMenu"
          @openChange="openMenu"
        >
          <a-menu-item key="/" :disabled="isCurrent('/')">
            <a-icon type="appstore" />
            <span>首页</span>
          </a-menu-item>
          <a-menu-item key="user" :disabled="isCurrent('user')">
            <a-icon type="user" />
            <span>账号</span>
          </a-menu-item>
          <a-sub-menu key="sub-list" @titleClick="subClick">
            <span slot="title">
              <a-icon type="unordered-list" />
              <span>列表</span>
            </span>
            <a-menu-item key="list" :disabled="isCurrent('list')">
              <a-icon type="cloud" />
              <span>个人云</span>
            </a-menu-item>
            <a-menu-item key="fylist" :disabled="isCurrent('fylist')">
              <a-icon type="cloud-server" />
              <span>家庭云</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item key="share" :disabled="isCurrent('share')">
            <a-icon type="share-alt" />
            <span>分享管理</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding: 0;display:flex;align-items:center;">
          <a-icon
            class="trigger"
            :type="collapsed ? 'menu-unfold' : 'menu-fold'"
            @click="() => (collapsed = !collapsed)"
          />
          <a-layout style="flex:initial;padding:14px 0 14px 24px;background: white">
            <breadcrumb :labels="labels" @clickBreadcrumb="clickBreadcrumb" />
          </a-layout>
        </a-layout-header>
        <tags
          :panes="panes"
          :watchKey="watchKey"
          @removePanesItem="removePanesItem"
          @changeMenu="changeMenu"
        />
        <a-layout-content
          :style="{
            padding: '24px',
            background: '#fff',
            minHeight: '280px',
            minWidth: '1131px',
            overflow: 'auto'
          }"
        >
          <transition name="slide-fade" @afterLeave="afterLeave">
            <keep-alive>
              <router-view @ChangeBreadcrumb="ChangeBreadcrumb" :e="e" />
            </keep-alive>
          </transition>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
  import breadcrumb from '@/components/widget/breadcrumb'
  import { Common } from 'mixins'
  import tags from 'widget/tags'
  export default {
    mixins: [Common],
    data() {
      return {
        precentNum: 0,
        panes: [],
        watchKey: null,
        collapsed: false,
        current: '',
        e: null,
        labels: [
          {
            breadcrumbName: '首页',
            path: '/'
          }
        ],
        dictionary: [
          { '/': '首页' },
          { user: '账号' },
          { list: '个人云' },
          { fylist: '家庭云' },
          { share: '分享管理' }
        ],
        subMenu: []
      }
    },
    mounted() {
      let current = this.formatCookie('route')
      this.current = current ? current : '/'
      this.subMenu = JSON.parse(localStorage.getItem('openSubMenu'))
      this.$router.replace(this.current)
      this.panes = [
        {
          key: 1,
          title: `${this.dictionary.find(item => item[this.current])[this.current]}`,
          link: this.current
        }
      ]
      setTimeout(this.afterLeave, 500)
    },
    components: { breadcrumb, tags },
    methods: {
      changeMenu(selected) {
        let select = this.panes.find(item => item.key === selected)
        this.current = select.link
      },
      openMenu(openKeys) {
        localStorage.setItem(`openSubMenu`, JSON.stringify(openKeys))
      },
      subClick({ key }) {},
      afterLeave() {
        let progressbg = document.querySelector('.progress .ant-progress-bg'),
          progress = document.querySelector('.progress')
        // if (window.time) {
        clearInterval(window.time)
        window.num = 100
        progressbg.style.width = 100 + '%'
        setTimeout(() => {
          progress.style.opacity = 0
        }, 300)
        // }
      },
      clickBreadcrumb(e) {
        this.e = e
      },
      removePanesItem(panes) {
        this.panes = panes
      },
      handleClick({ key }) {
        this.current = key
        document.cookie = `route=${key}`

        this.$router.push(
          key,
          onComplete => {},
          onAbort => {}
        )

        let keys = []
        this.panes.forEach(item => {
          keys.push(item.key)
        })
        let select = this.dictionary.find(item => item[key]),
          is = this.panes.find(item => item.title === select[key]),
          max = (keys.length && Math.max(...keys)) || 0
        if (!is) {
          this.panes.push({
            key: max + 1,
            title: select[key],
            link: Object.keys(select)[0]
          })
        } else {
          this.watchKey = is.key
        }
      },
      isCurrent(key) {
        return this.current === key
      },
      ChangeBreadcrumb(routers) {
        this.labels = routers
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .slide-fade-enter,.slide-fade-leave-to
    transform translateX(40px)
    opacity 0
  .slide-fade-enter-active
    transition all .45s
    transition-delay .3s
  .slide-fade-leave-active
    transition all .3s
  #components-layout-demo-custom-trigger
    >>> .ant-menu-item-disabled
      opacity 1
  .logo-hide
    opacity 0
  #components-layout-demo-custom-trigger
    height 100vh
  #components-layout-demo-custom-trigger .trigger {
    font-size: 18px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }

  #components-layout-demo-custom-trigger .trigger:hover {
    color: #1890ff;
  }

  #components-layout-demo-custom-trigger .logo {
    height: 32px;
    margin: 16px;
    text-align center
    color white
    font-size 25px
    white-space nowrap
    transition opacity .3s
  }
  .progress
    position fixed
    top -9px
    z-index 9
    left 0
    width 100vw
    transition opacity  1s
</style>
