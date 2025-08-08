import 'ugos-core/dist/ugos-core.css';
import UGOSCore from 'ugos-core';
import { type App } from 'vue';
import { type Router } from 'vue-router';

interface UGOSCoreConfig {
  app: App<Element>;
  router: Router;
}

export function register({ app, router }: UGOSCoreConfig) {
  UGOSCore.init(app, router);

  if (import.meta.env.VITE_NODE_ENV === 'development') {
    return UGOSCore.i18nInit('zh-CN');
  }
  return UGOSCore.i18nInit();
}
