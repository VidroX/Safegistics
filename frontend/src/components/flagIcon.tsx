import * as React from "react";
import {useTranslation} from "../i18n";
import {makeStyles} from "@material-ui/core";
import clsx from "clsx";

interface FlagIcon {
    code: "UA" | "GB";
    size: number;
    className?: string;
}

const FlagIcon = (props: FlagIcon) => {
    const { code, className, size } = props;
    const { t, i18n } = useTranslation();
    const classes = useStyles();

    return <img
        src={"/static/flags/" + code.toLowerCase() + ".svg"}
        className={clsx([ classes.flagIcon, className ])}
        style={{ width: size, height: size }}
        aria-label={code + "-Flag"}
        alt={t("languages." + code.toLowerCase())}
    />
};

FlagIcon.defaultProps = {
    code: "GB",
    size: 30,
};

const useStyles = makeStyles(theme => ({
    flagIcon: {
        display: 'block',
    }
}));

export default FlagIcon;
