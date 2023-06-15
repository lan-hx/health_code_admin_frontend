import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import styles from "./index.module.css";
import {Pie} from "@ant-design/plots";
import axios from "axios";
import {notification} from "antd";
import {useSelector} from "react-redux";

Root.propTypes = {};

const test_data = [
  {
    type: '绿码',
    value: 0,
  },
  {
    type: '黄码',
    value: 0,
  },
  {
    type: '红码',
    value: 0,
  },
  {
    type: '灰码',
    value: 0,
  },
]
function Root(props) {
  const userToken = useSelector(state => state.user.token)
  const [data, setData] = useState(test_data)
  const fetchData = async () => {
    try {
      const response = await axios.post('/api/GetStatisticsData', {
        token: userToken,
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `获取统计数据失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `获取统计数据成功`})
        console.log(res.health_code_statistics)
        setData(res.health_code_statistics);
      }
    } catch (error) {
      console.error(error);
      notification.error({message: '提示', description: `获取统计数据失败，网络错误`})
    }
  }
  useEffect(()=>{
    fetchData()
  }, [])
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
        data={data}
      />
    </>
  );
}

export default Root;