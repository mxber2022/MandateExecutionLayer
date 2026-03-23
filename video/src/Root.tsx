import { Composition } from "remotion";
import { MelDemo } from "./MelDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MelDemo"
      component={MelDemo}
      durationInFrames={90 * 30} // 90 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
