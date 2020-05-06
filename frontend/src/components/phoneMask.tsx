import * as React from "react";
import MaskedInput from "react-text-mask";

interface TextMaskCustomProps {
    inputRef: (ref: HTMLInputElement | null) => void;
}

const PhoneMask = (props: TextMaskCustomProps) => {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
            {...other}
            ref={(ref: any) => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={[
                '+', '3', '8', '0', ' ', '(', /[0-9]/, /[0-9]/, ')', ' ',
                /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/
            ]}
            showMask
        />
    );
};

export default PhoneMask;
