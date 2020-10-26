/**
 * Written by Tan Han Wei.
 * October 2020
 * These modes are used for the user to switch mode and generate next action/animation
 * Each modes are only effective once the previous animation has ended.
 */
export const modes = {
    FREE: 'free',
    //the creature behaves with non-uniform random actions and motions
    CATCHUP: 'catchUp',
    //the creature will always move into the Line of Sight (LOS) after the end of each action and motion
    //Used with ATTENTION
    ATTENTION: 'attention',
    //the creature gives full attention to the device's LOS
    PLAY: 'play',
    //the creature will walk into LOS and shows excitement
    //Used with ATTENTIONTOPLAY
    ATTENTIONTOPLAY: 'attentionToPlay',
    //the creature responds based on LOS before the frisbee is thrown
    //The frisbee can be triggered to be thrown in this mode
    //If comes from THROW mode, the creature will 'drop' the frisbee to the user
    THROW: 'throw',
    //The frisbee will be in motion
    //the creature will start chasing and catch the frisbee
    //Used with ATTENTIONTOPLAY
    RESET: 'reset',
    //User can reset the plane tracker and re-position the creature
    TEST: 'test'
    //For direct testing purposes only
}