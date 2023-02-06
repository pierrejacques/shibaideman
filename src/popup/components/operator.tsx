import React, { FC, ReactNode } from 'react';
import { Button } from 'antd';

export const Operator: FC<{
  onClick?(): void;
  submit?: boolean;
  primary?: boolean;
  disabled?: boolean;
  children: ReactNode | ReactNode[];
}> = ({
  onClick,
  primary = false,
  disabled = false,
  submit = false,
  children
}) => (
    <Button
      htmlType={submit ? 'submit' : 'button'}
      disabled={disabled}
      size="large"
      type={primary ? 'primary' : 'default'}
      className='operator'
      onClick={onClick}
    >
      {children}
    </Button>
  );
