import NextI18Next from 'next-i18next';

import enLocale from "date-fns/locale/en-GB";
import ukLocale from "date-fns/locale/uk";

const NextI18NextInstance = new NextI18Next({
    defaultLanguage: 'en',
    otherLanguages: ['uk'],
    strictMode: false,
    localeSubpaths: {
        en: 'en',
        uk: 'uk',
    }
});

export const localeMap: any = {
    en: enLocale,
    uk: ukLocale,
};

export default NextI18NextInstance;

export const { appWithTranslation, useTranslation, Link, Router } = NextI18NextInstance;
