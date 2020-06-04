<template>
  <div v-if="panes.length" class="tags">
    <a-tabs
      :tabBarGutter="20"
      size="large"
      v-model="activeKey"
      hide-add
      type="editable-card"
      @edit="onEdit"
      @tabClick="tabClick"
    >
      <a-tab-pane
        v-for="pane in panes"
        :key="pane.key"
        :tab="pane.title"
        :closable="pane.closable"
      >
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
export default {
  props: {
    panes: {
      type: Array,
      default: () => []
    },
    watchKey: null
  },
  watch: {
    watchKey(val, old) {
      this.activeKey = val;
    },
    panes(val, oldval) {
      if (!val.length || this.activeKey === val[val.length - 1].key) return;
      this.activeKey = val[val.length - 1].key;
    },
    activeKey(val, oldval) {
      let i = this.panes.findIndex(item => item.key === val);
      this.$router.push(
        (this.panes[i] && this.panes[i].link) || 0,
        onComplete => {},
        onAbort => {}
      );
      document.cookie = `route=${this.panes[i].link}`;
    }
  },
  data() {
    return {
      activeKey: 1
    };
  },
  methods: {
    tabClick(key) {
      this.$emit("changeMenu", key);
    },
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    remove(targetKey) {
      let activeKey = this.activeKey;
      let lastIndex;
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.panes.filter(pane => pane.key !== targetKey);
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key;
        } else {
          activeKey = panes[0].key;
        }
      }
      this.$emit("removePanesItem", panes);
      this.activeKey = activeKey;
    }
  }
};
</script>
<style lang="stylus" scoped>
.tags
   background white
   >>> .ant-tabs-bar
    margin: 0px
</style>
