<template>
  <div class="list">
    <a-modal
      v-model="visible3"
      title="分享链接"
      ok-text="确认"
      cancel-text="取消"
      @ok="hideModal"
      @cancel="close3"
    >
      <a-form-model :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
        <a-form-model-item label="密码设置 ">
          <a-radio-group v-model="form.resource">
            <a-radio value="1">
              随机码
            </a-radio>
            <a-radio value="2">
              无
            </a-radio>
            <a-radio value="3">
              自定义
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="自定义密码">
          <a-input
            :disabled="form.resource !== '3'"
            v-model="form.pass"
            placeholder="请输入分享密码,长度4位"
          />
        </a-form-model-item>
        <a-form-model-item label="有效期">
          <a-select v-model="form.expired" placeholder="请选择有效时间">
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
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal
      :title="windowTitle"
      :visible="visible"
      centered
      :footer="null"
      @cancel="close"
      :mask="false"
      class="list-window"
    >
      <iframe
        align="middle"
        :src="url"
        frameborder="0"
        class="window-content"
        allowfullscreen="true"
        border="0"
        marginwidth="0"
        marginheight="0"
        scrolling="auto"
        v-if="!toggleVideo"
      >
      </iframe>
      <img :src="url" class="preview" v-else />
    </a-modal>
    <a-modal
      title="直链"
      :visible="visible2"
      centered
      :footer="null"
      @cancel="close2"
      :mask="false"
      class="list-window"
    >
      <a-textarea v-model="copys" autoSize />
    </a-modal>
    <div style="margin-bottom: 16px">
      <a-button type="primary" :disabled="hasBack" icon="rollback" @click="back" class="btn-back"
        >返回上一级</a-button
      >
      <a-tooltip>
        <template slot="title">
          注意:不能获取文件夹直链
        </template>
        <a-button type="primary" :disabled="!hasSelected" @click="getdownloadUrls">
          获取直链
        </a-button>
      </a-tooltip>
      <span style="margin-left: 8px">
        <template v-if="hasSelected">
          {{ ` 已选中${selectedRowKeys.length}项 ` }}
        </template>
      </span>
      <a-tooltip v-if="selectUser && selectFamilyId">
        <template slot="title">
          切换用户
        </template>
        <!-- <a-select style="width: 130px" v-model="selectUser">
          <a-icon slot="suffixIcon" type="user" />
          <a-select-option :value="item.uid" v-for="item in users" :key="item.uid">
            {{ item.uid }}
          </a-select-option>
        </a-select> -->
        <a-cascader
          :options="options"
          :allowClear="false"
          style="width:220px"
          change-on-select
          :load-data="loadData"
          @change="CascaderOnChange"
          :defaultValue="[selectUser, selectFamilyId]"
          ref="casc"
          v-model="CascValue"
        />
      </a-tooltip>
      <a-button type="primary" icon="sync" @click="refresh" class="btn-refresh">刷新</a-button>
      <a-tooltip>
        <template slot="title">
          上传新文件后必须刷新缓存才能显示
        </template>
        <a-button type="danger" icon="delete" @click="cleanCache" class="btn-refresh"
          >清空缓存</a-button
        >
      </a-tooltip>
      <a-input-search
        placeholder="请输入搜索内容"
        enter-button
        @search="onSearch"
        style="float:right;width:20%"
      />
    </div>
    <a-table
      size="small"
      :scroll="{ y: '65vh' }"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      @change="changeTables"
      :pagination="pagination"
    >
      <template slot="fileName" slot-scope="text, record">
        <a-icon :type="record.fileType === 'folder' ? 'folder' : 'file'" />
        {{ text }}
      </template>
      <template slot="fileType" slot-scope="text">
        <a-tag color="#87d068">
          {{ text }}
        </a-tag>
      </template>
      <template slot="operation" slot-scope="text, record">
        <a-row>
          <a-col :span="24">
            <a-button
              class="file-btn"
              type="primary"
              v-if="record.fileType === 'folder'"
              icon="folder-open"
              size="small"
              @click="getFileList(record.fileId)"
            >
              打开
            </a-button>
            <a-button
              class="file-btn"
              v-if="record.fileType === 'mp4' || record.fileType === 'mp3'"
              type="primary"
              icon="play-circle"
              size="small"
              @click="play(record)"
            >
              播放
            </a-button>
            <a-button
              class="file-btn"
              type="primary"
              v-if="
                record.previewUrl &&
                  (record.fileType === 'jpg' ||
                    record.fileType === 'png' ||
                    record.fileType === 'gif')
              "
              icon="file-image"
              size="small"
              @click="preview(record)"
            >
              预览
            </a-button>
            <a-button
              class="file-btn"
              v-if="record.downloadUrl"
              type="danger"
              icon="down-circle"
              size="small"
              @click="down(record)"
            >
              下载
            </a-button>
            <a-button
              class="file-btn"
              type="dashed"
              icon="share-alt"
              size="small"
              @click="share(record)"
            >
              分享
            </a-button>
          </a-col>
        </a-row>
      </template>
    </a-table>
  </div>
</template>

<script>
  import IndexMinxin, { Common } from 'mixins'
  export default {
    mixins: [Common],
    props: {
      e: Object
    },
    async created() {
      await this.getUsers()
      await this.getFamilyIds(this.selectUser)
      this.options[0].children = this.formatFamilyId()
      this.CascValue = [this.selectUser, this.selectFamilyId]
      console.log(this.CascValue)
    },
    watch: {
      async e(val, old) {
        this.query = ''
        if (!val.fileId) {
          return val.breadcrumbName === '家庭云' ? await this.getFileList() : ''
        }
        let is = this.currentInfo.path.find(item => item.fid === val.fileId)
        if (!is) return
        await this.getFileList(val.fileId)
      },
      data(val, old) {
        this.BreadcrumbConcat()
      },
      async selectFamilyId(val, old) {
        this.query = ''
        await this.getFileList()
      }
      // async selectUser(val, old) {
      //   this.query = ''
      //   await this.getFileList()
      // }
    },
    data() {
      return {
        form: {
          pass: '',
          expired: '86400',
          resource: '1'
        },
        options: [],
        users: [],
        CascValue: [],
        familyIds: [],
        selectUser: '',
        selectFamilyId: '',
        visible: false,
        url: '',
        windowTitle: '',
        pagination: {
          // hideOnSinglePage: true,
          showTotal: (total, range) => `当前范围:${range[0]}-${range[1]}  总数:  ${total}`,
          showQuickJumper: true
        },
        loading: true,
        routers: [
          {
            breadcrumbName: '列表'
          },
          {
            breadcrumbName: '家庭云'
          }
        ],
        data: [],
        currentInfo: null,
        columns: [
          {
            title: '文件名',
            dataIndex: 'fileName',
            width: '100px',
            scopedSlots: { customRender: 'fileName' },
            ellipsis: true
          },
          {
            title: '文件大小',
            dataIndex: 'fileSize',
            width: '100px'
          },
          {
            title: '文件ID',
            dataIndex: 'fileId',
            width: '160px'
          },
          {
            title: '文件类型',
            dataIndex: 'fileType',
            scopedSlots: { customRender: 'fileType' },
            width: '150px'
          },
          {
            title: '操作',
            dataIndex: 'operation',
            width: '200px',
            scopedSlots: { customRender: 'operation' }
          }
        ],
        selectedRowKeys: [],
        selectedRowName: [],
        query: '',
        copys: '',
        visible2: false,
        visible3: false,
        toggleVideo: true,
        Addshare: null
      }
    },
    computed: {
      hasBack() {
        if (!this.currentInfo) return true
        if (!this.currentInfo.path) return false
        return this.currentInfo.path.length <= 1
      },
      hasSelected() {
        return this.selectedRowKeys.length > 0
      }
    },
    activated() {
      if (!this.currentInfo) {
        this.$emit('ChangeBreadcrumb', this.routers)
        return
      }
      this.BreadcrumbConcat()
    },
    methods: {
      async hideModal() {
        let pass
        if (this.form.resource === '3') {
          if (this.form.pass.length > 11 || !this.form.pass.length)
            return this.$message.error({ content: '密码最大长度不能大于11位' })
          pass = this.form.pass
        } else if (this.form.resource === '2') {
          pass = ''
        } else {
          pass = 'random'
        }
        this.Addshare.expired = this.form.expired
        try {
          let res = await (
            await fetch(`${this.$config.server}/addShare`, {
              method: 'POST',
              body: JSON.stringify({
                file: this.Addshare,
                pass: pass
              }),
              credentials: 'include',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: JSON.parse(localStorage.getItem('access'))
              }
            })
          ).json()
          this.visible3 = false
          if (res.code !== 200)
            return this.$message.error({ content: res.msg || res.message || '未知错误' })
          this.$notification.success({
            message: '分享成功',
            description: `分享链接: ${this.$config.server}/shareList/${
              this.Addshare.fileId
            } 密码: ${res.pass ? res.pass : '空'}`,
            duration: 0,
            btn: h => {
              return h(
                'a-button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => this.$notification.close('share')
                  }
                },
                '关闭'
              )
            },
            key: 'share',
            onClose: close
          })
          this.form.resource = '1'
          this.form.pass = ''
          this.form.expired = '86400'
        } catch (error) {
          this.$message.error({ content: error.toString() })
        }
      },
      async share(item) {
        this.visible3 = true
        this.Addshare = Object.assign({}, item, { user: this.selectUser, category: '家庭云' })
      },
      close3() {
        this.visible3 = false
        this.$nextTick(() => {
          this.Addshare = null
        })
      },
      async loadData(selectedOptions) {
        const targetOption = selectedOptions[selectedOptions.length - 1]
        targetOption.loading = true
        this.selectUser = selectedOptions[0].value
        await this.getFamilyIds(this.selectUser)
        selectedOptions[0].children = this.formatFamilyId()
        this.CascValue = [this.selectUser, this.selectFamilyId]
        targetOption.loading = false
        this.options = [...this.options]
      },
      async cleanCache() {
        let modal = this.$confirm({
          content: '确定要清空缓存吗?',
          onOk: async () => {
            try {
              let res = await (
                await fetch(`${this.$config.server}/cleanCache`, {
                  headers: {
                    Authorization: JSON.parse(localStorage.getItem('access'))
                  }
                })
              ).json()
              if (res.code !== 200) throw new Error(res.msg)
              this.$message.success({ content: res.msg })
            } catch (error) {
              this.$message.error({ content: error.toString() })
            }
          },
          okText: '确定',
          cancelText: '取消',
          onCancel: () => modal.destroy()
        })
      },
      async CascaderOnChange(val, arr) {
        if (val.length === 1) return
        this.selectUser = val[0]
        this.selectFamilyId = val[1]
        this.CascValue = [this.selectUser, this.selectFamilyId]
      },
      async getFamilyIds(user) {
        let res = await (
          await fetch(`${this.$config.server}/familyInfos/${user}`, {
            headers: {
              Authorization: JSON.parse(localStorage.getItem('access'))
            }
          })
        ).json()
        this.familyIds = res && res.familyInfo.length ? res : { familyInfo: [res.familyInfo] }
        this.selectFamilyId =
          res && res.familyInfo.length
            ? res.familyInfo.find(item => item.remarkName === +user).familyId
            : res.familyInfo.familyId
      },
      async back() {
        // if (this.currentInfo.path.length <= 1) return
        await this.getFileList(this.currentInfo.path[this.currentInfo.path.length - 2].fid, 1)
      },
      async refresh() {
        await this.getFileList(this.currentInfo.path[this.currentInfo.path.length - 1].fid, 1)
      },
      async getdownloadUrls() {
        if (!this.hasSelected) return
        let urls = this.selectedRowKeys.map(
          (item, index) =>
            `${this.selectedRowName[index]} : ${this.$config.server}/familyDown/${
              this.selectUser
            }/${this.selectFamilyId}/${item}?auth=${JSON.parse(
              localStorage.getItem('access')
            )} \n\r`
        )
        this.visible2 = true
        urls.forEach(item => {
          this.copys += item
        })
      },
      async onSearch(query) {
        this.query = query
        await this.getFileList()
      },
      async getUsers() {
        let res
        try {
          res = await (
            await fetch(`${this.$config.server}/users`, {
              headers: {
                Authorization: JSON.parse(localStorage.getItem('access'))
              }
            })
          ).json()
          if (res.name === 'TokenExpiredError') throw new Error('认证已过期,请重新认证')
        } catch (error) {
          this.loading = false
          this.$message.error({ content: error.toString(), duration: 5 })
          return this.$router.push('auth')
        }
        this.users = res
        this.options = this.users.map(item => {
          return {
            value: item.uid,
            label: item.uid,
            isLeaf: false
          }
        })
        this.selectUser = (res[0] && res[0].uid) || '无'
      },
      close() {
        this.visible = false
        this.$nextTick(() => {
          this.url = ''
          this.windowTitle = ''
        })
      },
      close2() {
        this.visible2 = false
        this.$nextTick(() => {
          this.copys = ''
        })
      },
      BreadcrumbConcat() {
        let rou = [...this.routers, ...this.formatPath(this.currentInfo.path)]
        this.$emit('ChangeBreadcrumb', rou)
      },
      async changeTables({ current }) {
        let paths = this.formatPath(this.currentInfo.path),
          last = paths[paths.length - 1],
          fileId = !this.query ? last.fileId : ' '
        await this.getFileList(fileId, current)
      },
      async down(item) {
        window.open(
          `${this.$config.server}/familyDown/${this.selectUser}/${this.selectFamilyId}/${
            item.fileId
          }?auth=${JSON.parse(localStorage.getItem('access'))}`
        )
      },
      async preview(item) {
        this.windowTitle = item.fileNames
        this.visible = true
        this.toggleVideo = true
        this.url = item.previewUrl
        // window.open(current.origPicUrl)
      },
      async play(item) {
        // let { data } = await (
        //   await fetch(`${this.$config.server}/player/${this.selectUser}/${item.fileId}`)
        // ).json()
        // let cuurent = data.find(item => item.fileId === item.fileId)
        this.windowTitle = item.fileName
        this.visible = true
        this.toggleVideo = false
        this.url = `${this.$config.server}/familyPlayer/${this.selectUser}/${this.selectFamilyId}/${
          item.fileId
        }?auth=${JSON.parse(localStorage.getItem('access'))}`
        // window.open(`${this.$config.server}/player/${this.selectUser}/${item.fileId}`)
      },
      async getFileList(fileId = ' ', page = 1) {
        this.loading = true
        this.selectedRowKeys = []
        this.selectedRowName = []
        let res
        if (this.selectUser === '无') {
          this.loading = false
          return this.$message.error({ content: '还未登录请先登录' })
        }
        if (!this.query || fileId != ' ') {
          try {
            let {
              listFiles: { fileList }
            } = await (
              await fetch(
                `${this.$config.server}/family/${this.selectUser}/${fileId}/${page}${
                  this.selectFamilyId ? '?family=' + this.selectFamilyId : ''
                }`,
                {
                  headers: {
                    Authorization: JSON.parse(localStorage.getItem('access'))
                  }
                }
              )
            ).json()
            res = fileList
          } catch (err) {
            this.loading = false
            return this.$message.error({ content: '获取列表失败' })
          }
        } else {
          try {
            let fileList = await (
              await fetch(
                `${this.$config.server}/familySearch/${this.selectUser}/${this.selectFamilyId}/${this.query}/${page}`,
                {
                  headers: {
                    Authorization: JSON.parse(localStorage.getItem('access'))
                  }
                }
              )
            ).json()
            res = fileList
          } catch (error) {
            this.loading = false
            return this.$message.error({ content: '获取列表失败' })
          }
        }
        if (res.code === 500 || res.code === 404) {
          this.loading = false
          return this.$message.error({ content: res.msg })
        }
        this.currentInfo = res
        let { count } = this.currentInfo
        this.setPageInfo(100, count, page)
        let formatData = this.formatList(this.currentInfo),
          path

        if (fileId == ' ') {
          path = [
            {
              fid: formatData[0] && formatData[0].parentId,
              fname: '全部文件'
            }
          ]
        } else {
          let {
            parentFolderList: { folder }
          } = await (
            await fetch(
              `${this.$config.server}/familyGetFileInfo/${this.selectUser}/${this.selectFamilyId}/${fileId}`,
              {
                headers: {
                  Authorization: JSON.parse(localStorage.getItem('access'))
                }
              }
            )
          ).json()
          path = folder.length ? folder : [folder]
        }
        this.$set(this.currentInfo, 'path', path)
        // this.currentInfo.path = path
        this.currentInfo.path[0].fname = '全部文件'
        this.data = formatData
        this.loading = false
      },
      setPageInfo(pageSize, recordCount, pageNum) {
        let pagination = { ...this.pagination }
        pagination.pageSize = pageSize
        pagination.total = recordCount
        pagination.pageNum = pageNum
        pagination.current = pageNum
        this.pagination = pagination
      },
      formatPath(paths) {
        return paths.map(item => {
          return {
            breadcrumbName: item.fname,
            fileId: item.fid
          }
        })
      },
      formatFamilyId() {
        console.log(this.familyIds)
        if (!this.familyIds.familyInfo.map)
          return [
            {
              value: this.familyIds.familyInfo.familyId,
              label: this.familyIds.familyInfo.remarkName,
              isLeaf: true
            }
          ]
        return this.familyIds.familyInfo.map(item => {
          return {
            value: item.familyId,
            label: item.remarkName,
            isLeaf: true
          }
        })
      },
      formatList(list) {
        let folder = list.folder ? (list.folder.length ? list.folder : [list.folder]) : [],
          file = list.file ? (list.file.length ? list.file : [list.file]) : []
        return [...folder, ...file].map(item => {
          let name = item.name.toString()
          let fieId = name.match(/\.(\w+)$/i)
          return {
            key: item.id,
            fileName: item.name,
            fileType: fieId ? fieId[1] : 'folder',
            fileId: item.id,
            parentId: item.parentId,
            fileSize: item.size ? this.formatFileSize(item.size) : '无',
            downloadUrl: !fieId ? false : true,
            previewUrl: item.icon ? item.icon.max600 : false
          }
        })
      },
      onSelectChange(selectedRowKeys, originRowKeys) {
        this.selectedRowKeys = selectedRowKeys.filter(
          (item, index) => originRowKeys[index].fileType !== 'folder'
        )
        this.selectedRowName = this.selectedRowKeys.map(
          item => originRowKeys.find(item2 => item2.key === item).fileName
        )
      }
    }
  }
</script>

<style lang="stylus">
  .ant-notification-notice
    width: 600px;
    margin-left: -235px;
  .file-btn
    margin-right 10px
  .list-window
    width 50% !important
  .window-content
    height:100%;
    width:100%;
    min-height:560px
  .btn-refresh
    margin-left 10px
  .btn-back
    margin-right 10px
  .preview
    margin: 0 auto;
    width: 75%;
    min-height 40vh
    padding: 20px;
    display block
</style>
