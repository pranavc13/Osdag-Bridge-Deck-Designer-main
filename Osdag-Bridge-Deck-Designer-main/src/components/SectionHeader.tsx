import React from 'react';

interface SectionHeaderProps {
  title: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, className = '' }) => {
  return (
    <div className={`section-header ${className}`}>
      {title}
    </div>
  );
};

export default SectionHeader;
