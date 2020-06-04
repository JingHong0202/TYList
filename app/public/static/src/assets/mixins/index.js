export default {
  methods: {
    async loadingState(options) {
      let res;
      this.$message.loading({
        content: options.loadingMessage,
        key: options.key,
        duration: 0
      });

      try {
        res = await options.fn();
      } catch (error) {
        throw new Error(error.toString());
      }
      if (!res || res.code === 500)
        return this.$message
          .error({
            content: (res && res.msg) || "未知错误",
            key: options.key,
            duration: options.duration
          })
          .then(options.error() || function() {});

      this.$message
        .success({
          content: res.msg,
          duration: options.duration,
          key: options.key
        })
        .then(options.success() || function() {});
    }
  }
};

export const Common = {
  methods: {
    formatFileSize(num) {
      if (null == num || num == "") {
        return "0 Bytes";
      }
      var unitArr = new Array(
        "Bytes",
        "KB",
        "MB",
        "GB",
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB"
      );
      var index = 0;
      var srcsize = parseFloat(num);
      index = Math.floor(Math.log(srcsize) / Math.log(1024));
      var size = srcsize / Math.pow(1024, index);
      size = size.toFixed(2); //保留的小数位数
      return size + unitArr[index];
    },
    formatCookie(query) {
      let arr = document.cookie.split(";").map(item => {
        let str = item.split("="),
          res = {};
        res[str[0].replace(/\s/g, "")] = str[1];
        return res;
      });
      arr = arr.filter(item => item[query]);
      if (arr.length) {
        return arr[0][query];
      }
      return false;
    }
  }
};
