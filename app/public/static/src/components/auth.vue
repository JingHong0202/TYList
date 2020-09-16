<template>
  <div class="auth">
    <a-card
      style="width: 500px;border-radius:10px;padding: 20px;
    background: rgba(255,255,255,.7);"
    >
      <a-input-password placeholder="请输入令牌" v-model="accessToken">
        <a-icon slot="addonBefore" type="user" />
      </a-input-password>
      <a-button type="primary" style="margin-top:10px" block :loading="loading" @click="submit">
        认证
      </a-button>
    </a-card>
  </div>
</template>

<script>
  import IndexMinxin, { Common } from 'mixins'
  export default {
    mixins: [Common],
    data() {
      return {
        accessToken: '',
        loading: false
      }
    },
    methods: {
      async submit() {
        this.loading = true
        let res = await (
          await fetch(`${this.$config.server}/auth`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
              secret: this.accessToken
            }),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          })
        ).json()
        if (!res || res.code === 500) {
          this.loading = false
          return this.$message.error({ content: res.msg || '未知错误' })
        }
        localStorage.setItem('access', JSON.stringify(res.access))
        this.$message.success({ content: '认证成功', duration: 1 }).then(() => {
          let currentRoute = this.formatCookie('route')
          this.$router.replace(currentRoute ? currentRoute : '/')
          window.location.reload()
          this.loading = false
        })
      }
    }
  }
</script>

<style scoped lang="stylus">
  .auth
      width 100%
      height 100%
      background url('https://cn.bing.com/th?id=OHR.LifeguardEntrance_ZH-CN7394984988_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=1920&h=1080&rs=1&c=4')
      background-size cover
      display flex
      justify-content center
      align-items center
</style>
