import React from 'react';
import { DatePicker, Space } from 'antd';

const { RangePicker } = DatePicker;

const DatePickerMenu = ({ onChange }) => (
  <Space direction="vertical" size={12}>
    <RangePicker 
      onChange={onChange} 
      format="DD/MM/YYYY"
    />
  </Space>
);

export default DatePickerMenu;
