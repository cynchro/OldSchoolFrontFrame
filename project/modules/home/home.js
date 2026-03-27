import { defineModule } from "../../framework/module/module.js";

export default defineModule({
  css: true,
  state: () => ({
    title: "Home",
    count: 0
  }),
  methods: {
    increment(_, ctx) {
      ctx.state.count += 1;
    }
  }
});
