import {format} from "date-fns";
import i18n, { localeMap } from "../i18n";
import Cookies from "js-cookie";

export const localizedFormat = (date: Date, formatStr = 'Pp') => {
    const language = Cookies.get('next-i18next') || 'en';

    return format(date, formatStr, {
        locale: localeMap[language]
    })
};
