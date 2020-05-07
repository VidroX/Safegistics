import * as React from "react";
import {Autocomplete} from "@material-ui/lab";
import { makeStyles } from '@material-ui/core/styles';
import {CircularProgress, TextField, Theme} from "@material-ui/core";
import {useTranslation} from "../../i18n";
import {useQuery} from "@apollo/react-hooks";
import { UserEdge} from "../../interfaces/user";
import {GET_DRIVERS} from "../../apollo/queries/user";
import clsx from "clsx";
import {OptionType} from "../../interfaces/searchers";

interface DriverSearcherProps {
    error?: boolean;
    helperText?: string;
    onSelect?(value: OptionType): void;
    title?: string;
    className?: string;
    required?: boolean;
}

interface DriverData {
    drivers: {
        __typename: string;
        totalCount: number;
        edges: UserEdge[];
        pageInfo: {
            endCursor: string;
            hasNextPage: boolean;
        }
    };
}

const DriverSearcher = (props: DriverSearcherProps) => {
    const { t } = useTranslation();

    const {
        onSelect,
        error,
        helperText,
        className,
        title = t('users.driver'),
        required = false
    } = props;

    const classes = useStyles();

    const { data, loading, error: queryError, refetch } = useQuery<DriverData>(GET_DRIVERS, {
        variables: {
            orderBy: "-_cls",
            rowsPerPage: 5
        }
    });

    const [suggestions, setSuggestions] = React.useState<OptionType[]>([]);
    const [open, setOpen] = React.useState<boolean>(false);
    const [value, setValue] = React.useState<OptionType>({id: "", label: ""});

    React.useEffect(() => {
        if (!loading && !queryError && data != null) {
            setSuggestions(data.drivers.edges.map((obj: UserEdge) => {
                return {
                    id: obj.node.id,
                    label: obj.node.firstName + ' ' + obj.node.lastName + ' ' + obj.node.patronymic
                };
            }));
        }
    }, [data, loading, queryError]);

    return (
        <Autocomplete
            className={clsx(className, classes.textField)}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            getOptionLabel={option => option != null && option.label != null ? option.label : ""}
            options={suggestions}
            loading={loading}
            freeSolo={true}
            getOptionSelected={(option, value) => value.id === option.id}
            onChange={(event: object, value: OptionType | null) => {
                if (value != null) {
                    if(onSelect != null) {
                        onSelect(value);
                    }
                    setValue(value);
                } else {
                    refetch({
                        orderBy: "-_cls",
                        rowsPerPage: 5
                    });
                }
            }}
            onInputChange={(event: object, value: string) => {
                if(value != null && value.length <= 0) {
                    setValue({
                        id: "",
                        label: ""
                    });
                }
                if (value == null) {
                    setValue({
                        id: "",
                        label: ""
                    });
                }

                refetch({
                    orderBy: "-_cls",
                    search: value,
                    rowsPerPage: 5
                });
            }}
            renderInput={params => (
                <TextField
                    {...params}
                    label={title}
                    fullWidth
                    required={required}
                    type="text"
                    error={error != null ? error : false}
                    helperText={helperText}
                    variant="outlined"
                    color="secondary"
                    value={value.label}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="secondary" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    textField: {
        display: 'flex',
        marginBottom: theme.spacing(2),
        width: 300,
        [theme.breakpoints.down('sm')]: {
            width: 'auto',
            flex: 1
        }
    }
}));


export default DriverSearcher;
