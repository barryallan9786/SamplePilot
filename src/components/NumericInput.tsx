import React, { useState, useEffect } from 'react';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (val: number) => void;
  isDecimal?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  isDecimal = false,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => (value === 0 ? '' : String(value)));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const regex = isDecimal ? /^\d*\.?\d*$/ : /^\d*$/;

    if (val === '' || regex.test(val)) {
      setDisplayValue(val);
      if (val === '' || val === '.') {
        onChange(0);
      } else {
        const parsed = isDecimal ? parseFloat(val) : parseInt(val, 10);
        onChange(isNaN(parsed) ? 0 : parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setDisplayValue(value === 0 ? '' : String(value));
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode={isDecimal ? "decimal" : "numeric"}
      value={isFocused ? displayValue : (value === 0 ? '' : String(value))}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};
