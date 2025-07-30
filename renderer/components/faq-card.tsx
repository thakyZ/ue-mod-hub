/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { UseStatePair } from '@typed/common';
import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';
import type { ButtonVariant } from 'react-bootstrap/types';

export declare interface FAQCardProps {
    q?: string | undefined;
    a?: string | undefined;
    index: number;
}

export default function FAQCard({ q = '', a = '', index }: FAQCardProps): ReactElement<FAQCardProps> {
    const [open, setOpen]: UseStatePair<boolean> = useState<boolean>(false);
    const even: boolean = index % 2 === 0;
    const el_index: string = `faq-${index}`;
    const initial_x: number = even ? 128 : -128;
    const color: ButtonVariant = even ? 'secondary' : 'primary';

    return (
        <motion.div
            initial={{ opacity: 0, x: initial_x }}
            // animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.25 + (index + 1) / 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-2 col col-md-10 offset-md-1"
        >
            <Button
                variant={color}
                className="w-100 p-3 radius0"
                onClick={(): void => setOpen(!open)}
                aria-controls={el_index}
                aria-expanded={open}
            >
                <strong>{q.trim() || 'todo'}</strong>
            </Button>
            <Collapse in={open}>
                <div id={el_index} className="">
                    <Card className="theme-border card-grey radius0">
                        <Card.Body className="radius0">
                            <p className="m-0">{a.trim() || 'todo'}</p>
                        </Card.Body>
                    </Card>
                </div>
            </Collapse>
        </motion.div>
    );
}
