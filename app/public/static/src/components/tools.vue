<template>
  <h1>tools</h1>
</template>

<script>
export default {
  activated() {
    this.$emit("ChangeBreadcrumb", this.routers);
  },
  data() {
    return {
      routers: [
        {
          path: "/tools",
          breadcrumbName: "工具"
        }
      ]
    };
  }
};
</script>

<style lang="stylus" scoped></style>
