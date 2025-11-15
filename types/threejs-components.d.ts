// types/threejs-components.d.ts

declare module "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js" {
  // We only need a loose shape so TS stops complaining.
  const TubesCursor: (
    canvas: HTMLCanvasElement,
    options?: any
  ) => {
    resize?: () => void;
    dispose?: () => void;
    [key: string]: any;
  };

  export default TubesCursor;
}