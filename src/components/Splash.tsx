import React, { useEffect, useState } from 'react';

export const Splash: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="splash" aria-hidden="true">
      <div className="splash-interior" />
    </div>
  );
};
