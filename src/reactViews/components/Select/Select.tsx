import * as React from 'react';
import { ChangeEventHandler } from 'react';
import './Select.css';

interface SelectProps {
    label: string;
    id?: string;
    values: string[];
    defaultValue?: string;
    onChange?:ChangeEventHandler<HTMLSelectElement>;
}

export const Select: React.FC<SelectProps> = ( {id ,label, defaultValue, onChange, values}) => {
    return <div className="select field--text">
        <label className="select__label" htmlFor={id}>
            <b>{label}</b>
        </label>
        <select 
            className="select__select" 
            id={id}
            onChange={onChange}  
            defaultValue={defaultValue} 
        >
            {values.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
    </div>;
};
