import * as React from "react";
import {NextPage} from "next";
import {ErrorProps} from "next/error";
import {useTranslation} from "../i18n";
import useTitle from "../hooks/useTitle";

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
    const { t } = useTranslation('errors');
    useTitle(t('error') + ' ' + (statusCode != null ? statusCode : 0));

    return (
        <>
            {
                t('error')} {statusCode != null ? statusCode : 0} - {
                statusCode != null ?
                    t('descriptions.' + statusCode.toString()) :
                    t('descriptions.general')
            }
        </>
    );
};

Error.getInitialProps = async (ctx) => {
    const statusCode = ctx.res ? ctx.res.statusCode : 404;
    return { statusCode };
};

export default Error;
