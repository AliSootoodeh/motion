import { Poses } from "../../types"
import { AnimationManager } from "../../animation"
import { PoseKeys } from "../types"
import { AnimationControls } from "./use-animation-controls"
import { resolvePoses, asDependencyList } from "./pose-resolvers"
import { useMemo, useEffect, useRef, useContext } from "react"
import { MotionContext } from "./MotionContext"

const isPoses = (animation: any): animation is Poses => {
    return !(animation instanceof AnimationManager) && animation !== undefined
}

export const usePoses = (
    animation: AnimationManager | Poses | undefined,
    inherit: boolean,
    controls: AnimationControls,
    onPoseComplete?: () => void,
    pose?: PoseKeys,
    initialPose?: PoseKeys
) => {
    const parentPose = useContext(MotionContext).pose
    const poseToResolve = inherit ? parentPose : pose
    const poseList = resolvePoses(poseToResolve)
    const hasMounted = useRef(false)
    const isPoseControlled = isPoses(animation)

    if (isPoseControlled) {
        controls.setPoses(animation as Poses)
    }

    // Set initial value according to Pose
    useMemo(
        () => {
            if (!isPoseControlled) return
            const initial = initialPose ? resolvePoses(initialPose) : poseList
            controls.set(initial)
        },
        [isPoseControlled]
    )

    // Fire animations when poses change
    useEffect(() => {
        if (inherit || !isPoseControlled) return

        if (hasMounted.current || initialPose) {
            controls.start(poseList).then(() => {
                onPoseComplete && onPoseComplete()
            })
        }

        hasMounted.current = true
    }, asDependencyList(poseList))
}