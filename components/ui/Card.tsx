import React from 'react';

// FIX: Update Card component to accept and pass through standard HTML div attributes.
// This allows using props like `onClick` on the Card component, which was causing an error
// in AdminView.tsx.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
