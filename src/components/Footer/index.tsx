import React from 'react';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => (
  <DefaultFooter
    copyright="2021 集团出品"
    links={[
      {
        key: 'Ant Design Pro',
        title: '香港',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: '欧洲',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);
