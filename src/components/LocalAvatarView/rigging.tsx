import { Face, Hand, Pose, Utils, Vector } from "kalidokit";
import { Euler, Quaternion, Vector3 } from "three";
import { VRM } from "@pixiv/three-vrm";

export const animateVRM = (
  vrm: VRM,
  results: any,
  videoEl: HTMLVideoElement | null
) => {
  if (!vrm) return;
  if (!videoEl) return;
  // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
  let riggedPose, riggedLeftHand, riggedRightHand, riggedFace;

  const faceLandmarks = results.faceLandmarks;
  // Pose 3D Landmarks are with respect to Hip distance in meters
  const pose3DLandmarks = results.za;
  // Pose 2D landmarks are with respect to videoWidth and videoHeight
  const pose2DLandmarks = results.poseLandmarks;
  // Be careful, hand landmarks may be reversed
  const leftHandLandmarks = results.rightHandLandmarks;
  const rightHandLandmarks = results.leftHandLandmarks;

  // Animate Face
  if (faceLandmarks) {
    riggedFace = Face.solve(faceLandmarks, {
      runtime: "mediapipe",
      video: videoEl,
    });
    rigFace(riggedFace, vrm);
  }

  // Animate Pose
  if (pose2DLandmarks && pose3DLandmarks) {
    riggedPose = Pose.solve(pose3DLandmarks, pose2DLandmarks, {
      runtime: "mediapipe",
      video: videoEl,
    });
    if (!riggedPose) {
      return;
    }
    rigRotation(
      "hips",
      {
        x: (riggedPose.Hips.rotation?.x || 0) * -1,
        y: (riggedPose.Hips.rotation?.y || 0) * -1,
        z: (riggedPose.Hips.rotation?.z || 0) * -1,
      },
      0.7,
      0.3,
      vrm
    );
    rigPosition(
      "hips",
      {
        x: riggedPose.Hips.position.x, // Reverse direction
        y: riggedPose.Hips.position.y + 1, // Add a bit of height
        z: riggedPose.Hips.position.z, // Reverse direction
      },
      1,
      0.07,
      vrm
    );

    rigRotation("chest", riggedPose.Spine, 0.25, 0.3, vrm);
    rigRotation("spine", riggedPose.Spine, 0.45, 0.3, vrm);

    rigRotation("rightUpperArm", riggedPose.RightUpperArm, 1, 0.3, vrm);
    rigRotation("rightLowerArm", riggedPose.RightLowerArm, 1, 0.3, vrm);
    rigRotation("leftUpperArm", riggedPose.LeftUpperArm, 1, 0.3, vrm);
    rigRotation("leftLowerArm", riggedPose.LeftLowerArm, 1, 0.3, vrm);

    rigRotation("leftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3, vrm);
    rigRotation("leftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3, vrm);
    rigRotation("rightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3, vrm);
    rigRotation("rightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3, vrm);
  }

  // Animate Hands
  if (leftHandLandmarks) {
    riggedLeftHand = Hand.solve(leftHandLandmarks, "Left");
    if (!riggedLeftHand || !riggedPose) return;
    rigRotation(
      "leftHand",
      {
        // Combine pose rotation Z and hand rotation X Y
        z: riggedPose.LeftHand.z,
        y: riggedLeftHand.LeftWrist.y,
        x: riggedLeftHand.LeftWrist.x,
      },
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftRingProximal",
      riggedLeftHand.LeftRingProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftRingIntermediate",
      riggedLeftHand.LeftRingIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation("leftRingDistal", riggedLeftHand.LeftRingDistal, 1, 0.3, vrm);
    rigRotation(
      "leftIndexProximal",
      riggedLeftHand.LeftIndexProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftIndexIntermediate",
      riggedLeftHand.LeftIndexIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation("leftIndexDistal", riggedLeftHand.LeftIndexDistal, 1, 0.3, vrm);
    rigRotation(
      "leftMiddleProximal",
      riggedLeftHand.LeftMiddleProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftMiddleIntermediate",
      riggedLeftHand.LeftMiddleIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftMiddleDistal",
      riggedLeftHand.LeftMiddleDistal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftThumbProximal",
      riggedLeftHand.LeftThumbProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftThumbIntermediate",
      riggedLeftHand.LeftThumbIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation("leftThumbDistal", riggedLeftHand.LeftThumbDistal, 1, 0.3, vrm);
    rigRotation(
      "leftLittleProximal",
      riggedLeftHand.LeftLittleProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftLittleIntermediate",
      riggedLeftHand.LeftLittleIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "leftLittleDistal",
      riggedLeftHand.LeftLittleDistal,
      1,
      0.3,
      vrm
    );
  }
  if (rightHandLandmarks) {
    riggedRightHand = Hand.solve(rightHandLandmarks, "Right");
    if (!riggedPose || !riggedRightHand) return;
    rigRotation(
      "rightHand",
      {
        // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
        z: riggedPose.RightHand.z,
        y: riggedRightHand.RightWrist.y,
        x: riggedRightHand.RightWrist.x,
      },
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightRingProximal",
      riggedRightHand.RightRingProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightRingIntermediate",
      riggedRightHand.RightRingIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightRingDistal",
      riggedRightHand.RightRingDistal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightIndexProximal",
      riggedRightHand.RightIndexProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightIndexIntermediate",
      riggedRightHand.RightIndexIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightIndexDistal",
      riggedRightHand.RightIndexDistal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightMiddleProximal",
      riggedRightHand.RightMiddleProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightMiddleIntermediate",
      riggedRightHand.RightMiddleIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightMiddleDistal",
      riggedRightHand.RightMiddleDistal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightThumbProximal",
      riggedRightHand.RightThumbProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightThumbIntermediate",
      riggedRightHand.RightThumbIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightThumbDistal",
      riggedRightHand.RightThumbDistal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightLittleProximal",
      riggedRightHand.RightLittleProximal,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightLittleIntermediate",
      riggedRightHand.RightLittleIntermediate,
      1,
      0.3,
      vrm
    );
    rigRotation(
      "rightLittleDistal",
      riggedRightHand.RightLittleDistal,
      1,
      0.3,
      vrm
    );
  }
};

let oldLookTarget = new Euler();
const rigFace = (riggedFace: any, vrm: VRM) => {
  if (!vrm) {
    return;
  }

  const expressionManager = vrm.expressionManager;
  if (!expressionManager) {
    return;
  }

  rigRotation(
    "neck",
    {
      x: riggedFace.head.x * -1,
      y: riggedFace.head.y * -1,
      z: riggedFace.head.z * -1,
    },
    1,
    0.7,
    vrm
  );

  // Blendshapes and Preset Name Schema

  // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
  // for VRM, 1 is closed, 0 is open.
  riggedFace.eye.l = Vector.lerp(
    Utils.clamp(1 - riggedFace.eye.l, 0, 1),
    expressionManager.getValue("blinkLeft") || 0,
    0.5
  );
  riggedFace.eye.r = Vector.lerp(
    Utils.clamp(1 - riggedFace.eye.r, 0, 1),
    expressionManager.getValue("blinkRight") || 0,
    0.5
  );
  riggedFace.eye = Face.stabilizeBlink(riggedFace.eye, riggedFace.head.y);
  expressionManager.setValue("blinkLeft", riggedFace.eye.l);
  expressionManager.setValue("blinkRight", riggedFace.eye.r);

  // Interpolate and set mouth blendshapes
  expressionManager.setValue(
    "ih",
    Vector.lerp(riggedFace.mouth.shape.I, expressionManager.getValue("ih"), 0.5)
  );
  expressionManager.setValue(
    "aa",
    Vector.lerp(riggedFace.mouth.shape.A, expressionManager.getValue("aa"), 0.5)
  );
  expressionManager.setValue(
    "eh",
    Vector.lerp(riggedFace.mouth.shape.E, expressionManager.getValue("eh"), 0.5)
  );
  expressionManager.setValue(
    "oh",
    Vector.lerp(riggedFace.mouth.shape.O, expressionManager.getValue("oh"), 0.5)
  );
  expressionManager.setValue(
    "ou",
    Vector.lerp(riggedFace.mouth.shape.U, expressionManager.getValue("ou"), 0.5)
  );

  //PUPILS
  //interpolate pupil and keep a copy of the value
  let lookTarget = new Euler(
    Vector.lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
    Vector.lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
    0,
    "XYZ"
  );
  oldLookTarget.copy(lookTarget);
  vrm.lookAt!.applier.lookAt(lookTarget);
};
// Animate Rotation Helper function
export const rigRotation = (
  name: string,
  rotation = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3,
  vrm: VRM
) => {
  if (!vrm) return;
  const bones = vrm.humanoid.normalizedHumanBones;
  const Part = (bones as any)[name]?.node;
  if (!Part) {
    return;
  }

  let euler = new Euler(
    rotation.x * dampener,
    rotation.y * dampener,
    rotation.z * dampener * -1
  );
  let quaternion = new Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};
// Animate Position Helper Function
export const rigPosition = (
  name: string,
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
  dampener: number = 1,
  lerpAmount: number = 0.3,
  vrm: VRM
) => {
  if (!vrm) {
    return;
  }
  const bones = vrm.humanoid.normalizedHumanBones;
  const Part = (bones as any)[name]?.node;
  if (!Part) {
    return;
  }
  let vector = new Vector3(
    position.x * dampener,
    position.y * dampener,
    position.z * dampener
  );
  Part.position.lerp(vector, lerpAmount); // interpolate
};
