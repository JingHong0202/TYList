<template>
  <div class="share">
    <a-button type="primary" icon="sync" @click="refresh" class="btn-refresh">刷新</a-button>
    <a-button type="danger" icon="delete" :disabled="!hasSelected" @click="deleteSelect">
      删除选中
    </a-button>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :loading="loading"
      :rowKey="row => row.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <a-descriptions title="链接地址" layout="vertical" bordered>
          <a-descriptions-item label="分享链接" :span="1">
            <p>
              <a :href="`${$config.server}/shareList/${record.id}`">{{
                `${$config.server}/shareList/${record.id}`
              }}</a>
            </p>
          </a-descriptions-item>
          <a-descriptions-item label="二维码" :span="2">
            <vueQr :text="`${$config.server}/webdav/${record.id}`" :size="100"></vueQr>
          </a-descriptions-item>
          <a-descriptions-item label="webdav" :span="1">
            <p>
              <a :href="`${$config.server}/webdav/${record.id}`">{{
                `${$config.server}/webdav/${record.id}`
              }}</a>
            </p>
          </a-descriptions-item>
          <a-descriptions-item label="二维码" :span="2">
            <vueQr :text="`${$config.server}/webdav/${record.id}`" :size="100"></vueQr>
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <template v-for="col in ['expired', 'pass']" :slot="col" slot-scope="text, record">
        <div :key="col">
          <a-input
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="e => handleChange(e.target.value, record, col)"
          />
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>
      <template slot="add_time" slot-scope="text, record">
        {{ formatDate(record) }}
      </template>
      <template slot="expired" slot-scope="text, record">
        <div>
          <a-select
            :default-value="record.expired"
            style="width: 120px"
            @change="SelectChange"
            :disabled="!record.editable"
          >
            <a-select-option value="86400">
              1天
            </a-select-option>
            <a-select-option value="604000">
              7天
            </a-select-option>
            <a-select-option value="0">
              永久
            </a-select-option>
          </a-select>
        </div>
      </template>
      <template slot="id" slot-scope="text, record">
        <a-tooltip>
          <template slot="title">
            点击跳转
          </template>
          <a :href="`${$config.server}/share/${record.id}`">{{ text }}</a>
        </a-tooltip>
      </template>

      <template slot="operation" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a-button icon="check" type="primary" @click="save(record)">保存</a-button>
            <a-divider type="vertical" />
            <a-popconfirm
              cancelText="取消"
              okText="确定"
              title="确定要取消吗?"
              @confirm="cancel(record)"
            >
              <a-button icon="close" type="danger">取消</a-button>
            </a-popconfirm>
          </span>
          <span v-else>
            <a-button icon="edit" type="primary" :disabled="editingKey !== ''" @click="edit(record)"
              >编辑</a-button
            >
            <a-divider type="vertical" />
            <a-popconfirm
              cancelText="取消"
              okText="确定"
              title="确定要删除吗?"
              @confirm="del([record.id])"
            >
              <a-button icon="delete" type="danger" :disabled="editingKey !== ''">删除</a-button>
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
  import vueQr from 'vue-qr'
  export default {
    components: { vueQr },
    async created() {
      await this.getShareAll()
    },
    activated() {
      this.$emit('ChangeBreadcrumb', this.routers)
    },
    computed: {
      hasSelected() {
        return this.selectedRowKeys.length > 0
      }
    },
    methods: {
      async onSelectChange(selectedRowKeys) {
        this.selectedRowKeys = selectedRowKeys
      },
      async getShareAll() {
        this.loading = true
        let res
        try {
          res = await (
            await fetch(`${this.$config.server}/getShareAll`, {
              headers: {
                Authorization: JSON.parse(localStorage.getItem('access'))
              }
            })
          ).json()
          if (res.name === 'TokenExpiredError') throw new Error('认证已过期,请重新认证')
          this.$nextTick(() => {
            this.loading = false
            this.data = res
            this.cacheData = [...this.data.map(item => ({ ...item }))]
          })
        } catch (error) {
          this.loading = false
          this.$message.error({ content: error.toString() })
          return this.$router.push('auth')
        }
      },
      async SelectChange(val) {
        this.data.find(item => item.editable).expired = val
      },
      async refresh() {
        await this.getShareAll()
      },
      async deleteSelect() {
        let modal = this.$confirm({
          content: '确定要删除选中的分享吗?',
          onOk: async () => {
            await this.del(this.selectedRowKeys)
          },
          okText: '确定',
          cancelText: '取消',
          onCancel: () => modal.destroy()
        })
      },
      async del(item) {
        try {
          let res = await (
            await fetch(`${this.$config.server}/deleteShare`, {
              credentials: 'include',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: JSON.parse(localStorage.getItem('access'))
              },
              method: 'POST',
              body: JSON.stringify({
                fileId: item
              })
            })
          ).json()

          if (res.code === 500) {
            return this.$message.error({ content: res.msg, duration: 1 })
          }
          this.$message.success({ content: res.msg, duration: 1 })
          await this.refresh()
        } catch (error) {
          this.$message.error({ content: error.toString() })
        }
      },
      formatDate(date) {
        date = new Date(date.add_time * 1000)
        return (
          date.toLocaleDateString().replace(/\//g, '-') + ' ' + date.toTimeString().substr(0, 8)
        )
      },
      handleChange(value, key, column) {
        if (+value === 0 && column === 'add_time') value = '永久'
        const newData = [...this.data]
        const target = newData.filter(item => key.id === item.id)[0]
        if (target) {
          target[column] = value
          this.data = newData
        }
      },
      edit(key) {
        const newData = [...this.data]
        const target = newData.filter(item => key.id === item.id)[0]
        this.editingKey = key.id
        if (target) {
          target.editable = true
          this.data = newData
        }
      },
      async save(key) {
        const newData = [...this.data]
        const newCacheData = [...this.cacheData]
        const target = newData.filter(item => key.id === item.id)[0]
        const targetCache = newCacheData.filter(item => key.id === item.id)[0]
        if (target && targetCache) {
          delete target.editable
          target.add_time = ~~(new Date().getTime() / 1000)
          try {
            let res = await (
              await fetch(`${this.$config.server}/updateShare`, {
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: JSON.parse(localStorage.getItem('access'))
                },
                method: 'POST',
                body: JSON.stringify({
                  share: target
                })
              })
            ).json()
            if (res.code === 500) {
              return this.$message.error({ content: res.msg || '未知错误', duration: 1 })
            }
            this.$message.success({ content: res.msg, duration: 1 })
            this.data = newData
            Object.assign(targetCache, target)
            this.cacheData = newData
          } catch (error) {
            this.$message.error({ content: error.toString() })
          }
        }
        this.editingKey = ''
      },
      cancel(key) {
        const newData = [...this.data]
        const target = newData.filter(item => key.id === item.id)[0]
        this.editingKey = ''
        if (target) {
          Object.assign(target, this.cacheData.filter(item => key.id === item.id)[0])
          delete target.editable
          this.data = newData
        }
      }
    },
    data() {
      return {
        selectedRowKeys: [],
        data: [],
        loading: false,
        cacheData: null,
        columns: [
          {
            title: '文件ID',
            dataIndex: 'id',
            scopedSlots: { customRender: 'id' }
          },
          {
            title: '文件名',
            dataIndex: 'fileName',
            scopedSlots: { customRender: 'fileName' }
          },
          {
            title: '文件类型',
            dataIndex: 'fileType',
            scopedSlots: { customRender: 'fileType' }
          },
          {
            title: '分类',
            dataIndex: 'category'
          },
          {
            title: '分享者',
            dataIndex: 'user',
            scopedSlots: { customRender: 'user' }
          },
          {
            title: '过期时间',
            dataIndex: 'a',
            scopedSlots: { customRender: 'expired' }
          },
          {
            title: '添加时间',
            dataIndex: 'add_time',
            scopedSlots: { customRender: 'add_time' }
          },
          {
            title: '分享密码',
            dataIndex: 'pass',
            scopedSlots: { customRender: 'pass' }
          },
          {
            title: '操作',
            dataIndex: 'operation',
            scopedSlots: { customRender: 'operation' }
          }
        ],
        editingKey: '',
        routers: [
          {
            path: '/share',
            breadcrumbName: '分享管理'
          }
        ]
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .btn-refresh
    margin-bottom 10px
    margin-right 10px
</style>
