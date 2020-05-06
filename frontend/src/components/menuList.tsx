import * as React from "react";
import {IconButton, Menu, MenuItem} from "@material-ui/core";
import {ButtonData} from "../interfaces/materialTable";
import { FiMoreVertical } from "react-icons/fi";

interface MenuListProps {
    buttons: ButtonData[];
    className?: string;
}

const MenuList = (props: MenuListProps) => {
    const { buttons, className } = props;

    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
    const isMenuOpened = Boolean(menuAnchorEl);

    const handleClose = () => {
        setMenuAnchorEl(null);
    };

    const handleMenuOpen = (event: any) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleActionClick = (button: ButtonData) => {
        handleClose();
        if (button && button.onPress) {
            button.onPress();
        }
    };

    return (
        <>
            <IconButton
                aria-label="Actions"
                aria-controls="actions"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="secondary"
                className={className}
            >
                <FiMoreVertical />
            </IconButton>
            <Menu
                id="actions"
                anchorEl={menuAnchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={isMenuOpened}
                onClose={handleClose}
            >
                { buttons.map((button, index) => (
                    <MenuItem
                        key={'btn-' + index}
                        onClick={() => handleActionClick(button)}
                        aria-label={button.title}
                    >
                        { button.title }
                    </MenuItem>
                )) }
            </Menu>
        </>
    );
};

export default MenuList;
