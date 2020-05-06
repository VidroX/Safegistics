import * as React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { LinkProps as NextLinkProps } from 'next/link';
import { Link as NextLink } from "../i18n";
import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';
import {makeStyles} from "@material-ui/core/styles";

interface CustomLinkProps {
    noDecoration?: boolean;
}

type NextComposedProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
    NextLinkProps & CustomLinkProps;

const NextComposed = React.forwardRef<HTMLAnchorElement, NextComposedProps>((props, ref) => {
    const { as, href, replace, scroll, className, passHref, shallow, prefetch, noDecoration, ...other } = props;
    const classes = useStyles();

    return (
        <NextLink
            href={href}
            prefetch={prefetch}
            as={as}
            replace={replace}
            scroll={scroll}
            shallow={shallow}
            passHref={passHref}
        >
            <a className={noDecoration ? clsx(className, classes.disabledDecoration) : className} ref={ref} {...other} />
        </NextLink>
    );
});

interface LinkPropsBase {
    activeClassName?: string;
    innerRef?: React.Ref<HTMLAnchorElement>;
    naked?: boolean;
}

export type LinkProps = LinkPropsBase & NextComposedProps & Omit<MuiLinkProps, 'href'> & CustomLinkProps;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props: LinkProps) {
    const {
        href,
        activeClassName = 'active',
        className: classNameProps,
        innerRef,
        naked,
        noDecoration,
        ...other
    } = props;

    const router = useRouter();
    const classes = useStyles();
    const pathname = typeof href === 'string' ? href : href.pathname;
    const className = clsx(classNameProps, {
        [activeClassName]: router.pathname === pathname && activeClassName,
    });

    if (naked) {
        return <NextComposed
            noDecoration={noDecoration}
            className={className}
            ref={innerRef}
            href={href}
            {...other}
        />;
    }

    return (
        <MuiLink
            component={NextComposed}
            className={noDecoration ? clsx(className, classes.disabledDecoration) : className}
            ref={innerRef}
            href={href as string}
            {...other}
        />
    );
}

export default React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
    <Link {...props} innerRef={ref} />
));

const useStyles = makeStyles((theme) => ({
    disabledDecoration: {
        textDecoration: 'none',
        color: 'inherit',
        '&:link': {
            textDecoration: 'none',
            color: 'inherit',
        },
        '&:visited': {
            textDecoration: 'none',
            color: 'inherit',
        },
        '&:active': {
            textDecoration: 'none',
            color: 'inherit',
        }
    },
}));
