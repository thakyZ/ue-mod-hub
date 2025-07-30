/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import UseMediaQuery from '@hooks/use-media-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ReactElement } from 'react';
import { useTypewriter } from 'react-simple-typewriter';

export declare interface BrandHeaderProps {
    words?: string[];
    tagline: string;
    type: 'altsmall' | 'small';
    showImage?: boolean;
}

export default function BrandHeader({
    words,
    tagline,
    type,
    showImage = true,
}: BrandHeaderProps): ReactElement<BrandHeaderProps> {
    const isDesktop: boolean = UseMediaQuery('(min-width: 960px)');
    const { t, tA }: Localization = useLocalization();

    const [text] = useTypewriter({
        words: words || tA('/privacy.tldr'),
        loop: 0, // Infinit
    });

    const height: number = showImage ? (isDesktop ? 420 : 280) : 128;
    const image_size: number = isDesktop ? 256 : 192;

    return (
        <motion.div
            className="bg-darker text-white"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            initial={{ height: '100%' }}
            animate={{ height: height }}
            transition={{ duration: 1 }}
        >
            <div style={{ width: '100%', overflow: 'hidden' }}>
                {showImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 512 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        // whileInView={{ opacity: 1 }}
                        // viewport={{ once: true }}
                        className="text-center w-100"
                    >
                        <Image
                            src="/logo.webp"
                            alt="PalHUB's Logo"
                            width={image_size}
                            height={image_size}
                            unoptimized={true}
                            className="img-fluid"
                        />
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: -32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    // whileInView={{ opacity: 1 }}
                    // viewport={{ once: true }}
                    className="text-center w-100"
                >
                    {type === 'altsmall' ? (
                        <h1>
                            <strong>{tagline}</strong>
                        </h1>
                    ) : (
                        <h1>
                            {t('app.brandname')} <strong className="text-secondary">{text}|</strong>
                        </h1>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -64 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    // whileInView={{ opacity: 1 }}
                    // viewport={{ once: true }}
                    className="text-center w-100"
                >
                    {type === 'altsmall' ? (
                        <h6>
                            <strong className="text-secondary">{text}|</strong>
                        </h6>
                    ) : (
                        <h6>
                            <strong>{tagline}</strong>
                        </h6>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
