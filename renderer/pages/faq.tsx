/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import BrandHeader from '@components/core/brand-header';
import type { FAQCardProps } from '@components/faq-card';
import FAQCard from '@components/faq-card';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
// import type { PromiseTypeFunction, WrappedProps } from '@typed/common';
import { ReactElement } from 'react';
import { Fragment } from 'react';
import Container from 'react-bootstrap/Container';

export declare interface FAQPageProps {
    _?: unknown;
}

// export const getServerSideProps: PromiseTypeFunction<WrappedProps<FAQPageProps>> = async (): Promise<
//     WrappedProps<FAQPageProps>
// > => {
//     return { props: {} };
// };

export declare type FAQPair = { q: string; a: string };

export default function FAQPage(_props: FAQPageProps): ReactElement<FAQPageProps> {
    const { t, /* tA, */ tO }: UseLocalizationReturn = useLocalization();
    const tagline: string = t('/faq.head');
    const rawFAQs: FAQPair[] = tO('/faq.faqs') ?? [];
    const answers: string[] = rawFAQs.map((_v: FAQPair, i: number): string => t(`/faq.faqs.${i}.a` as `/faq.faqs.0.a`)!);
    const questions: string[] = rawFAQs.map((_v: FAQPair, i: number): string => t(`/faq.faqs.${i}.q` as `/faq.faqs.0.q`)!);
    return (
        <Fragment>
            <BrandHeader type="altsmall" words={questions} tagline={tagline} />
            <Container className="text-center py-5 noverflow">
                {rawFAQs.map(
                    (_v: FAQPair, i: number): ReactElement<FAQCardProps> => (
                        <FAQCard index={i} key={'faq' + i} q={questions[i]} a={answers[i]} />
                    )
                )}
            </Container>
        </Fragment>
    );
}
