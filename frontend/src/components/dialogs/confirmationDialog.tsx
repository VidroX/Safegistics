import * as React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {useTranslation} from "../../i18n";

export const CONFIRMATION_ACTIONS = {
    DENY: 0,
    CONFIRM: 1,
    CANCEL: 2
};

interface ConfirmationDialogProps {
    open: boolean;
    onAction?: (action: number) => void;
    title: string;
}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
    const { onAction, open, title } = props;
    const { t } = useTranslation();

    return (
        <>
            <Dialog
                open={open}
                onClose={() => onAction ? onAction(CONFIRMATION_ACTIONS.CANCEL) : {}}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('dialog.confirmContent')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => onAction ? onAction(CONFIRMATION_ACTIONS.DENY) : {}}
                        color="secondary">
                        {t('dialog.no')}
                    </Button>
                    <Button
                        onClick={() => onAction ? onAction(CONFIRMATION_ACTIONS.CONFIRM) : {}}
                        color="secondary"
                        autoFocus >
                        {t('dialog.yes')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ConfirmationDialog;
