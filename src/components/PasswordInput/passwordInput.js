import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../view/driver/driver.css';

const PasswordInput = ({ onChange, id, onBlur }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        onChange(value); // Notificar o pai sobre a mudança de senha
    };

    return (
        <div className="password-input">
            <input
                type={showPassword ? 'text' : 'password'}
                onChange={handleChange}
                value={password}
                className="form-control"
                id={id}
                onBlur={onBlur}
            />
            <span className="toggle-password" onClick={handleTogglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>
    );
};

export default PasswordInput;
