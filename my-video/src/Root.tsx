import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { MeshVideo } from "./mesh/MeshVideo";
import { scanWorks } from "./videos/scan-works";
import { laptopTest } from "./videos/laptop-test";
import { motionDuration } from "./motion/Stage";
import { SendHomework, sendHomework } from "./motion/videos/send-homework";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="MOTION">
        <Composition
          id="motion-send-homework"
          component={SendHomework}
          durationInFrames={Math.ceil(motionDuration(sendHomework) * 30)}
          fps={30}
          width={sendHomework.width}
          height={sendHomework.height}
        />
      </Folder>
      <Folder name="MESH">
        <Composition
          id="scan-works"
          component={MeshVideo}
          durationInFrames={Math.ceil(scanWorks.durationSec * 30)}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ cfg: scanWorks }}
        />
        <Composition
          id="laptop-test"
          component={MeshVideo}
          durationInFrames={Math.ceil(laptopTest.durationSec * 30)}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ cfg: laptopTest }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />

    </>
  );
};
