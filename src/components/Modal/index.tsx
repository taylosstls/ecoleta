import React, { useState } from 'react';
import { Overlay } from 'react-portal-overlay';

const Modal: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Overlay open={open} onClose={() => setOpen(false)}>
        <h1>My overlay</h1>
      </Overlay>
    </>
  );
};

export default Modal;
