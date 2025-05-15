import { useMCPComponent } from "./ChatComponent";



export const useIsMCPComponent = () => {
  const { isMCPComponent } = useMCPComponent();
  return isMCPComponent;
};
