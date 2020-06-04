<template>
  <div class="user">
    <a-modal
      title="添加账户"
      :visible="addBtn.visible"
      :confirm-loading="addBtn.confirmLoading"
      @ok="handleSubmit"
      @cancel="toggleModal"
      :cancelText="addBtn.cancel"
      :okText="addBtn.ok"
      centered
    >
      <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
        <a-form-item label="用户名" hasFeedback help="用户名格式错误,最少长度11位">
          <a-input
            v-decorator="[
              'username',
              {
                trigger: 'blur',
                validateTrigger: 'blur',
                rules: [
                  {
                    required: true,
                    len: 11,
                    whitespace: true
                  }
                ]
              }
            ]"
            name="username"
            placeholder="请输入用户名"
            size="large"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
        <a-form-item hasFeedback label="密码" help="密码不能为空或少于6位">
          <a-input-password
            name="password"
            v-decorator="[
              'password',
              {
                trigger: 'blur',
                validateTrigger: 'blur',
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    min: 6
                  }
                ]
              }
            ]"
            placeholder="请输入密码"
            size="large"
          >
            <a-icon slot="prefix" type="credit-card" />
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-button class="editable-add-btn" @click="handleAdd" type="primary" icon="user-add">
      添加
    </a-button>

    <a-table bordered :data-source="dataSource" :columns="columns" :loading="loading">
      <template slot="operation" slot-scope="text, record">
        <a-row>
          <a-col :span="12">
            <a-popconfirm
              v-if="dataSource.length"
              title="确认要删除吗?"
              okText="确认"
              cancelText="取消"
              @confirm="() => onDelete(record.key)"
            >
              <a-icon slot="icon" type="question-circle-o" style="color: red" />
              <a-button type="danger" icon="delete">删除</a-button>
            </a-popconfirm>
          </a-col>
          <a-col :span="8" :offset="2">
            <a-popconfirm
              v-if="dataSource.length"
              title="确认要刷新吗?"
              okText="确认"
              cancelText="取消"
              @confirm="() => onRefresh(record.key)"
            >
              <a-button type="primary" icon="sync">刷新</a-button>
            </a-popconfirm>
          </a-col>
        </a-row>
      </template>
    </a-table>
  </div>
</template>
<script>
  import IndexMinxin, { Common } from 'mixins'
  export default {
    mixins: [IndexMinxin, Common],
    async created() {
      await this.getUsers()
    },
    activated() {
      this.$emit('ChangeBreadcrumb', this.routers)
    },
    data() {
      return {
        routers: [
          {
            path: '/user',
            breadcrumbName: '账号'
          }
        ],
        loading: false,
        username: '',
        password: '',
        formLayout: 'horizontal',
        form: this.$form.createForm(this, { name: 'coordinated' }),
        addBtn: {
          visible: false,
          confirmLoading: false,
          ok: '确定',
          cancel: '取消'
        },
        dataSource: [],
        count: 2,
        columns: [
          {
            title: '用户名',
            dataIndex: 'username',
            width: '116px'
          },
          {
            title: '总空间',
            dataIndex: 'total'
          },
          {
            title: '已使用空间',
            dataIndex: 'useSize'
          },
          {
            title: 'cookie有效性',
            dataIndex: 'cookie'
          },
          {
            title: '添加时间',
            dataIndex: 'addTime'
          },
          {
            width: '229px',
            title: '操作',
            dataIndex: 'operation',
            scopedSlots: { customRender: 'operation' }
          }
        ]
      }
    },
    computed: {},
    methods: {
      async getUsers() {
        this.loading = true
        let response
        try {
          response = await (
            await fetch(`${this.$config.server}/users`, {
              headers: {
                Authorization: JSON.parse(localStorage.getItem('access'))
              }
            })
          ).json()
          if (response.name === 'TokenExpiredError') throw new Error('认证已过期,请重新认证')
        } catch (error) {
          this.loading = false
          this.$message.error({ content: error.toString(), duration: 5 })
          return this.$router.push('auth')
        }
        this.dataSource = await Promise.all(
          response.map(async item => {
            let validata = await (
              await fetch(`${this.$config.server}/files/${item.uid}`, {
                headers: {
                  Authorization: JSON.parse(localStorage.getItem('access'))
                }
              })
            ).json()
            return {
              key: item.id,
              username: item.uid,
              cookie: validata.code === 500 ? validata.msg : '有效',
              total: this.formatFileSize(item.total),
              useSize: this.formatFileSize(item.size),
              addTime: item.add_time,
              pass: item.pass
            }
          })
        )
        this.loading = false
      },
      handleSubmit() {
        this.addBtn.confirmLoading = true
        this.form.validateFields({ first: true }, async (err, value) => {
          if (err) return (this.addBtn.confirmLoading = false)
          this.username = value.username
          this.password = value.password
          await this.loadingState({
            key: 'addUser',
            loadingMessage: '添加中...',
            fn: async () => {
              let res = await (
                await fetch(`${this.$config.server}/login`, {
                  body: JSON.stringify({
                    username: this.username,
                    password: this.password
                  }),
                  credentials: 'include',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: JSON.parse(localStorage.getItem('access'))
                  },
                  method: 'POST'
                })
              ).json()
              return res
            },
            success: async () => {
              await this.getUsers()
              this.toggleModal()
            },
            error: () => {
              this.toggleModal()
            },
            duration: 1
          })
        })
      },
      toggleModal() {
        this.addBtn.visible = !this.addBtn.visible
        this.addBtn.confirmLoading = false
        this.username = ''
        this.password = ''
      },
      async onDelete(key) {
        const dataSource = [...this.dataSource]
        let id = dataSource.filter(item => item.key === key)[0].key

        await this.loadingState({
          success: () => {
            this.dataSource = dataSource.filter(item => item.key !== key)
          },
          loadingMessage: '删除中...',
          key: 'delete',
          fn: async () => {
            return await (
              await fetch(`${this.$config.server}/userDelete/${id}`, {
                headers: {
                  Authorization: JSON.parse(localStorage.getItem('access'))
                }
              })
            ).json()
          }
        })
      },
      async onRefresh(key) {
        let row = this.dataSource.find(item => item.key === key)
        await this.loadingState({
          key: 'refresh',
          loadingMessage: '刷新中...',
          fn: async () => {
            let res = await (
              await fetch(`${this.$config.server}/login?sercret=1`, {
                body: JSON.stringify({
                  username: row['username'],
                  password: row['pass']
                }),
                credentials: 'include',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: JSON.parse(localStorage.getItem('access'))
                },
                method: 'POST'
              })
            ).json()
            return res
          },
          success: () => {
            row.cookie = '有效'
          },
          error: () => {},
          duration: 1
        })
      },
      handleAdd() {
        this.addBtn.visible = true
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .editable-cell {
    position: relative;
  }

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    line-height: 18px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell:hover .editable-cell-icon {
    display: inline-block;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
</style>
