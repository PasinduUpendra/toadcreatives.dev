declare module "*/tubes1.min.js" {
  const init: (canvas: HTMLCanvasElement, config?: { tubes?: { colors?: string[]; lights?: { intensity?: number; colors?: string[] } } }) => {
    resize?: () => void;
    dispose?: () => void;
  };
  export default init;
}
