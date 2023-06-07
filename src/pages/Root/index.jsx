import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styles from "./index.module.css";
import {Pie} from "@ant-design/plots";

Root.propTypes = {};

function Root(props) {
  const test_data = [
    {
      type: '绿码',
      value: 61,
    },
    {
      type: '黄码',
      value: 12,
    },
    {
      type: '红码',
      value: 2,
    },
    {
      type: '灰码',
      value: 16,
    },
  ]
  return (
    <>
      <Pie
        appendPadding={10}
        angleField='value'
        colorField='type'
        color={({type}) => {
          if (type === '绿码') {
            return 'green';
          }
          if (type === '黄码') {
            return 'orange';
          }
          if (type === '红码') {
            return 'red';
          }
          if (type === '灰码') {
            return 'grey';
          }
          return 'white';
        }}
        radius={0.8}
        label={{
          type: 'inner',
          offset: '-10%',
          content: '{percentage}',
          // autoRotate: false,
        }}
        interactions={[
          {
            type: 'element-active',
          },
        ]}
        data={test_data}
      />
    </>
  );
}

export default Root;