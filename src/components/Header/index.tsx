import React from 'react';

interface HeaderProps {
  title: string | undefined;
}

const Header: React.FC<HeaderProps> = ({ title }: HeaderProps) => {
  return <header>{title && <h1>{title}</h1>}</header>;
};

export default Header;
