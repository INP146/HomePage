import { createApp } from "vue";
import { ElMessage } from "element-plus";
import "element-plus/es/components/message/style/css";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "@/style/style.scss";
import App from "@/App.vue";
import "swiper/css";
import "swiper/css/pagination";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.mount("#app");

navigator.serviceWorker.addEventListener("controllerchange", () => {
  ElMessage("Site updated. Refresh to apply changes.");
});
