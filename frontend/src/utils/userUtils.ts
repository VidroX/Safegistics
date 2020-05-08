import {UserPayload} from "../interfaces/user";
import {User} from "../interfaces/appState";

export const UserTypes = {
    UNKNOWN: -1,
    DEFAULT: 0,
    DRIVER: 1,
    DEVICE: 2,
};

export const isUserPayloadValid = (localUser: UserPayload): boolean => {
    return localUser.id != null && localUser.email != null && localUser.is_staff != null;
};

export const canOpenLink = (user: User, id: string | null = null) => {
    if (id != null) {
        return user != null && user.isActive && user.id != null && user.id === id;
    }

    return user != null && user.isActive && user.id != null;
};

export const canAdminOpenLink = (user: User, id: string | null = null) => {
    if (id != null) {
        return user != null && user.isActive && user.id != null && (user.id === id || user.isStaff);
    }

    return user != null && user.isActive && user.isStaff && user.id != null;
};

export const canServerAdminOpenLink = (user: UserPayload, id: string | null = null) => {
    if (id != null) {
        return user != null && user.id != null && (user.id === id || user.is_staff);
    }

    return user != null && user.is_staff && user.id != null;
};

export const getParsedUserType = (userType?: string): number | null => {
    if (!userType) {
        return UserTypes.UNKNOWN;
    }

    switch (userType) {
        case "BaseUserModel.UserModel": {
            return UserTypes.DEFAULT;
        }
        case "BaseUserModel.DriverModel": {
            return UserTypes.DRIVER;
        }
    }

    return null;
};
