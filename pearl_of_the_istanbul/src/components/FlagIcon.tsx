import { memo } from 'react';
import TR from 'country-flag-icons/react/3x2/TR';
import US from 'country-flag-icons/react/3x2/US';
import DE from 'country-flag-icons/react/3x2/DE';
import FR from 'country-flag-icons/react/3x2/FR';
import ES from 'country-flag-icons/react/3x2/ES';
import IT from 'country-flag-icons/react/3x2/IT';

interface FlagIconProps {
  code: 'TR' | 'US' | 'DE' | 'FR' | 'ES' | 'IT';
  size?: number;
}

const FlagIcon = ({ code, size = 28 }: FlagIconProps) => {
  const flags = {
    TR: TR,
    US: US,
    DE: DE,
    FR: FR,
    ES: ES,
    IT: IT
  };

  const Flag = flags[code];

  return (
    <Flag 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '4px',
        display: 'block'
      }} 
    />
  );
};

export default memo(FlagIcon);
