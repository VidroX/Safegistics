import * as React from "react";
import { useEffect } from "react";
import {Button, CircularProgress} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types";

const STATUS_UNDEFINED = 0;
const STATUS_LOADING = 1;

interface LoadingSubmitButton {
    title: string;
    variant?: "outlined" | "contained" | "text";
    color?: "primary" | "secondary";
    loadingStatus?: boolean;
    onButtonClick?: () => void,
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}

const LoadingSubmitButton = (props: LoadingSubmitButton) => {
    const {
        title,
        onButtonClick,
        loadingStatus,
        variant = "contained",
        color = "secondary",
        disabled = false,
        fullWidth = true
    } = props;

    const classes = useStyles();
    const [status, setStatus] = React.useState(STATUS_UNDEFINED);

    useEffect(() => {
        setStatus(loadingStatus ? STATUS_LOADING : STATUS_UNDEFINED);
    }, [props, loadingStatus]);

    const handleButtonClick = () => {
        if (status !== STATUS_LOADING) {
            if (onButtonClick) {
                onButtonClick();
            }
        }
    };

    if (!fullWidth) {
        return (
            <Button
                type="submit"
                color={color}
                variant={variant}
                disabled={status === STATUS_LOADING || disabled}
                onClick={handleButtonClick}
                className={props.className}
            >
                {status === STATUS_LOADING && <CircularProgress size={24} className={classes.buttonProgress} />}
                {status !== STATUS_LOADING && title}
            </Button>
        );
    }

    return (
        <div className={classes.wrapper}>
            <Button
                type="submit"
                color={color}
                variant={variant}
                disabled={status === STATUS_LOADING || disabled}
                onClick={handleButtonClick}
                className={props.className}
            >
                {status === STATUS_LOADING && <CircularProgress size={24} className={classes.buttonProgress} />}
                {status !== STATUS_LOADING && title}
            </Button>
        </div>
    );
};

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flex: 1,
        width: '100%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonProgress: {
        color: theme.palette.primary.main,
    }
}));

LoadingSubmitButton.propTypes = {
    title: PropTypes.string.isRequired,
    loadingStatus: PropTypes.bool.isRequired,
    className: PropTypes.string.isRequired,
    onButtonClick: PropTypes.func.isRequired
};

LoadingSubmitButton.defaultProps = {
    title: "",
    loadingStatus: false,
    className: "",
    onButtonClick: () => {}
};

export default LoadingSubmitButton;
