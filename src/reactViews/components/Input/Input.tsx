import * as React from 'react';
import { ChangeEventHandler } from 'react';
import './Input.css';

interface InputProps {
    label: string;
    id?: string;
    defaultValue?: string;
    onChange?:ChangeEventHandler<HTMLInputElement>;
}

export const Input: React.FC<InputProps> = ( {id ,label, defaultValue, onChange}) => {
    return <div className="field field--text">
        <label className="field__label" htmlFor={id}>
            <b>{label}</b>
        </label>
        <input 
            className="field__input" 
            id={id} 
            type="text" 
            onChange={onChange}  
            defaultValue={defaultValue} 
        />
    </div>;
};
