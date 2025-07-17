/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { CommonIcon } from '@config/common-icons';
import { motion } from 'framer-motion';
import type { ReactElement, SVGProps } from 'react';

export declare interface MotionSliderProps {
    Icon: CommonIcon;
    // delay?: number;
    xdir?: 'right' | 'left' | undefined;
    ydir?: 'down' | 'up' | undefined;
    xmove?: number | undefined;
    ymove?: number | undefined;
    header?: string | undefined;
    text?: string | undefined;
    small?: string | undefined;
}

export const icon_props: SVGProps<SVGElement> = {
    fill: 'currentColor',
    height: '7rem',
    width: '7rem',

    // height: 128,
    // width: 128,
    style: {
        opacity: 0.75,
    },
};

export default function MotionSlider({
    Icon,
    // delay = 0,
    xdir = 'right',
    ydir = 'down',
    xmove = xdir === 'right' ? 128 : -128,
    ymove = ydir === 'down' ? 64 : -64,
    header = '',
    text = '',
    small = '',
}: MotionSliderProps): ReactElement<MotionSliderProps> {
    const delay = 0.25;

    return (
        <motion.div
            initial={{ x: xmove }}
            animate={{ x: 0 }}
            transition={{ duration: 1, delay }}
            // whileInView={{opacity: 1}}
            className="col-12 col-md-6 col-lg-4 my-2"
        >
            <motion.div
                initial={{ y: ymove, opacity: 0 }}
                // animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay }}
                whileInView={{ y: 0, opacity: 1 }}
                className=""
            >
                <Icon {...icon_props} />
            </motion.div>

            {!!header && (
                <motion.div
                    initial={{ y: ymove, opacity: 0 }}
                    // animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className=""
                >
                    <h4>{header}</h4>
                </motion.div>
            )}
            {!!text && (
                <motion.div
                    initial={{ y: ymove, opacity: 0 }}
                    // animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className=""
                >
                    <p className="mb-0">{text}</p>
                </motion.div>
            )}
            {!!small && (
                <motion.div
                    initial={{ y: ymove, opacity: 0 }}
                    // animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className=""
                >
                    <small>
                        <strong>{small}</strong>
                    </small>
                </motion.div>
            )}
        </motion.div>
    );
}
