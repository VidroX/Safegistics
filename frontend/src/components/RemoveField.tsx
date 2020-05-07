import * as React from "react";
import {
    IconButton,
    InputAdornment,
    TextField
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { MdRemove } from "react-icons/md";
import theme from "../theme";

export interface RemoveFieldValue {
    id?: string | null;
    name: string;
}

interface RemoveFieldProps {
    className: string;
    onRemove?: (value: RemoveFieldValue) => void;
    placeholder: string;
    value: RemoveFieldValue;
    onChangeText?: (value: RemoveFieldValue) => void;
    disabled?: boolean;
    showRemoveButton?: boolean;
}

const RemoveField = (props: RemoveFieldProps) => {
    const {
        className,
        onRemove,
        value,
        placeholder,
        onChangeText,
        disabled = true,
        showRemoveButton = true
    } = props;
    const classes = useStyles();

    const [inputValue, setInputValue] = React.useState<RemoveFieldValue>(value);

    return (
        <TextField
            label={placeholder}
            type='text'
            disabled={disabled}
            color="secondary"
            className={clsx(className, classes.textField)}
            value={inputValue.name}
            onChange={(e) => {
                if (e.target.value != null) {
                    setInputValue({
                        id: null,
                        name: e.target.value
                    })
                }

                if (onChangeText) {
                    onChangeText(inputValue);
                }
            }}
            InputProps={{
                endAdornment: showRemoveButton ?
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="remove item"
                            onClick={() => onRemove ? onRemove(inputValue) : {}}
                        >
                            <MdRemove color={theme.palette.secondary.light} />
                        </IconButton>
                    </InputAdornment> : null,
            }}
            variant="outlined"
        />
    );
};

const useStyles = makeStyles(theme => ({
    textField: {
        flexDirection: 'column'
    },
    iconMargin: {
        marginRight: 16
    }
}));

export default RemoveField;
