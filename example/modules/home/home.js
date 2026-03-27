import { defineModule } from "../../../framework/module/module.js";

export default defineModule({
  css: true,
  state: () => ({
    message: "Hello from Home module",
    count: 0
  }),
  methods: {
    increment(_event, ctx) {
      ctx.state.count += 1;
    }
  },
  mounted(ctx) {
    if (ctx.store) {
      console.log("Current user from store:", ctx.store.state.user);
    }
  }
});
