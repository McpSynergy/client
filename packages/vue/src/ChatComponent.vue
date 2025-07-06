<template>
  <div v-if="isValidating">
    <slot name="fallback">
      <div>Validating component...</div>
    </slot>
  </div>
  <div v-else-if="validationError">
    <slot name="error-fallback" :error="validationError">
      <div>Failed to validate component: {{ validationError }}</div>
    </slot>
  </div>
  <Suspense v-else>
    <template #default>
      <component
        :is="DynamicComponent"
        v-bind="{ _mcp_comp_name: name, ...props }"
      />
    </template>
    <template #fallback>
      <slot name="fallback">
        <div>Loading component...</div>
      </slot>
    </template>
  </Suspense>
</template>

<script lang="ts">
import {
  defineComponent,
  defineAsyncComponent,
  ref,
  watch,
  provide,
  computed,
} from "vue";
import { MCPComponentSymbol } from "./composables";
import { clientCore } from "@mcp-synergy/client-core";
import type { ComponentSchema } from "@mcp-synergy/client-core";

import MCPComponentImports from "virtual:mcp-comp-vue/imports";
import MCPComponentData from "virtual:mcp-comp-vue/data";

export default defineComponent({
  name: "ChatComponent",
  props: {
    name: {
      type: String,
      required: true,
    },
    serverName: {
      type: String,
      required: false,
    },
    props: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const isValidating = ref(true);
    const validationError = ref<string | null>(null);

    const safeExportName = computed(() =>
      clientCore.getSafeExportName(props.name, props.serverName),
    );

    const DynamicComponent = computed(() => {
      const componentLoader = MCPComponentImports[safeExportName.value];
      if (!componentLoader) {
        throw new Error(`Component not found: ${safeExportName.value}`);
      }
      return defineAsyncComponent(componentLoader);
    });

    const validateAndLoad = async () => {
      isValidating.value = true;
      validationError.value = null;

      if (!props.name) {
        isValidating.value = true;
        return;
      }

      const validationResult = clientCore.validateMCPComponent(
        props.name,
        props.serverName,
        props.props,
        MCPComponentData as ComponentSchema[],
      );

      if (!validationResult.success) {
        validationError.value =
          validationResult.error || "Failed to validate component";
        console.error(validationResult.error);
      }

      isValidating.value = false;
    };

    // Watch for changes in props
    watch(
      [() => props.name, () => props.serverName, () => props.props],
      validateAndLoad,
      {
        immediate: true,
      },
    );

    // Provide context
    provide(MCPComponentSymbol, {
      isMCPComponent: true,
    });

    return {
      isValidating,
      validationError,
      DynamicComponent,
    };
  },
});
</script>
