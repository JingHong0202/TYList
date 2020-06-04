module.exports = {
  schedule: {
    interval: '6h',
    type: 'worker',
    immediate: true
  },
  async task(ctx) {
    await ctx.app.cache.reset()
  }
}
