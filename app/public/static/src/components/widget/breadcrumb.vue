<template>
  <div>
    <a-breadcrumb :routes="labels" separator=">" @click="handleClick(item)">
      <template slot="itemRender" slot-scope="{ route, params, routes }">
        <span v-if="routes.indexOf(route) === routes.length - 1">
          {{ route.breadcrumbName }}
        </span>
        <a v-else href="javascript:void(0)" @click="handleClick(route)">
          {{ route.breadcrumbName }}
        </a>
      </template>
    </a-breadcrumb>
  </div>
</template>
<script>
export default {
  props: {
    labels: Array
  },
  methods: {
    handleClick(e) {
      this.$emit("clickBreadcrumb", e);
    }
  },
  data() {
    const { lang } = this.$route.params;
    return {};
  }
};
</script>
<style lang="stylus" scoped></style>
