import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styles from "./index.module.css";
import {useSelector} from "react-redux";
import {Button, Divider, Input, notification, Popconfirm, Space, Spin, Table} from "antd";
import {LoadingOutlined, SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import axios from "axios";
import {EditableCell, EditableRow, rowStyle} from "../../components/EditableTable";
import {nanoid} from "nanoid";

TestPoint.propTypes = {

};

const test_data = [
  {
    place_id: '1',
    place_name: '浙江大学',
    place_addr_x: 123.456,
    place_addr_y: 11.22,
    place_addr_string: 'xx路xx号',
    new: false
  }
]

function TestPoint(props) {
  const userToken = useSelector(state => state.user.token)
  const [data, setData] = useState([]) // 数据
  const [selectedRowKeys, setSelectedRowKeys] = useState([]) // [选中行的id]
  const hasSelected = selectedRowKeys.length > 0
  const [buttonLoading, setButtonLoading] = useState(false) // 测试按钮的loading
  const [addUserLoading, setAddUserLoading] = useState(false) // 最后保存按钮的loading
  const [addUserLoadingRow, setAddUserLoadingRow] = useState('')
  const [tableLoading, setTableLoading] = useState(false) // 表格的loading
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
      <div style={{padding: 8}} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`搜索${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined/>}
            size="small"
          >
            搜索
          </Button>
          <Button onClick={() => {
            setSearchText('');
            clearFilters();
            confirm({closeDropdown: false});
          }} size="small">
            重置
          </Button>
          <Button size="small" onClick={() => close()}>关闭</Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{
          backgroundColor: '#ffc069',
          padding: 0,
        }}
                     searchWords={[searchText]}
                     autoEscape
                     textToHighlight={text ? text.toString() : ''}
        />
      ) : (text),
  });

  // 指定行选择属性
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      console.log(`newSelectedRowKeys: ${newSelectedRowKeys}`, 'newSelectedRows: ', newSelectedRows);
      setSelectedRowKeys(newSelectedRowKeys);
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === 'Disabled User',
    //   // Column configuration not to be checked
    //   // name: record.name,
    // }),
  };

  // delete a row
  const handleDelete = async (record) => {
    if (!record.new) {
      try {
        const response = await axios.post('/api/DeleteNucleicPlaces', {
          token: userToken,
          place_id: record.place_id,
        })
        console.log(response);
        const res = response.data
        if (res.error !== 0) {
          notification.error({message: '提示', description: `删除核酸检测点失败，错误码${res.error}，错误信息：${res.message}`})
        } else {
          notification.success({message: '提示', description: `删除核酸检测点成功`})
          const newData = data.filter(item => item.place_id !== record.place_id);
          setData(newData);
          console.log('delete', record.place_id)
        }
      } catch (error) {
        console.error(error);
        notification.error({message: '提示', description: `删除核酸检测点失败，网络错误`})
      }
    } else {
      const newData = data.filter(item => item.place_id !== record.place_id);
      setData(newData);
      console.log('delete', record.place_id)
    }
  };

  // add a row
  const handleAddUser = async (place_id) => {
    setAddUserLoadingRow(place_id)
    setAddUserLoading(true)
    const newData = [...data];
    const index = newData.findIndex((item) => place_id === item.place_id);
    const item = newData[index];
    try {
      const response = await axios.post('/api/AddNucleicPlaces', {
        token: userToken,
        place_name: item.place_name,
        place_addr: {latitude: parseFloat(item.place_addr_x), longitude: parseFloat(item.place_addr_y)},
        place_addr_string: item.place_addr_string,
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `添加核酸检测点失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `添加核酸检测点成功，[debug]服务器返回id = ${res.place_id}`})
        newData.splice(index, 1, {
          ...item,
          place_id: res.place_id,
          new: false
        });
        setData(newData);
      }
    } catch (error) {
      console.error(error);
      notification.error({message: '提示', description: `添加核酸检测点失败，网络错误`})
    }
    setAddUserLoading(false)
  };

  // column config
  const columns = [
    {
      title: '[debug] id',
      dataIndex: 'place_id',
      key: 'place_id',
      filters: [
        {
          text: '未保存核酸检测点',
          value: true
        }
      ],
      onFilter: (value, record) => record.new === value,
      sorter: (a, b) => a.place_id.localeCompare(b.place_id),
    },
    {
      title: '核酸检测点名称',
      dataIndex: 'place_name',
      key: 'place_name',
      editable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('place_name', '核酸检测点名称')
    },
    {
      title: '核酸检测点纬度',
      dataIndex: 'place_addr_x',
      key: 'place_addr_x',
      editable: true,
      sorter: (a, b) => a.place_addr_x < b.place_addr_x,
    },
    {
      title: '核酸检测点经度',
      dataIndex: 'place_addr_y',
      key: 'place_addr_y',
      editable: true,
      sorter: (a, b) => a.place_addr_y < b.place_addr_y,
    },
    {
      title: '核酸检测点地址详情',
      dataIndex: 'place_addr_string',
      key: 'place_addr_string',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => <Space>
        {record.new ? <><Button type="link" style={{padding: 0}} disabled={addUserLoading} onClick={() => {
          handleAddUser(record.place_id)
        }}>保存</Button>{addUserLoading && addUserLoadingRow === record.place_id ?
          <Spin indicator={<LoadingOutlined spin/>}/> : null}</> : null}
        <Popconfirm title="确定删除吗?" okText="确定" cancelText="取消" onConfirm={() => handleDelete(record)}>
          <Button type="link" style={{padding: 0}}>删除</Button>
        </Popconfirm>
      </Space>
    },
  ]

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleAdd = () => {
    const newData = {
      place_id: nanoid(),
      place_name: '浙江大学',
      place_addr_x: 123.456,
      place_addr_y: 11.22,
      place_addr_string: 'xx路xx号',
      new: true
    };
    setData([...data, newData]);
  };
  const handleSave = async (row, column_name) => {
    const index = data.findIndex((item) => row.place_id === item.place_id);
    const changed = row[column_name] !== data[index][column_name]
    console.log(changed)
    if (changed) {
      const newData = [...data];
      const item = newData[index];
      if (!row.new) {
        try {
          const response = await axios.post('/api/SetNucleicPlaces', {
            token: userToken,
            place_id: row.place_id,
            place_name: row.place_name,
            place_addr: {latitude: parseFloat(row.place_addr_x), longitude: parseFloat(row.place_addr_y)},
            place_addr_string: row.place_addr_string,
          })
          console.log(response);
          const res = response.data
          if (res.error !== 0) {
            notification.error({message: '提示', description: `保存失败，错误码${res.error}，错误信息：${res.message}`})
          } else {
            notification.success({message: '提示', description: `保存成功`})
            newData.splice(index, 1, {
              ...item,
              ...row,
            });
            setData(newData);
            console.log('change', row)
          }
        } catch (error) {
          console.error(error);
          notification.error({message: '提示', description: `保存失败，网络错误`})
        }
      } else {
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        console.log('change', row)
      }
    }
  };
  const real_columns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  const fetchData = async () => {
    setTableLoading(true);
    console.log(userToken)
    try {
      const response = await axios.post('/api/GetNucleicPlacesAll', {
        token: userToken,
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `数据获取失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `数据获取成功`})
        setData(res.result.map(item => {
          return {
            place_id: item.place_id,
            place_name: item.place_name,
            place_addr_x: item.place_addr.latitude,
            place_addr_y: item.place_addr.longitude,
            place_addr_string: item.place_addr_string,
          }
        }))
        setTableLoading(false);
      }
    } catch (error) {
      console.error(error);
      notification.error({message: '提示', description: `数据获取失败，网络错误`})
    }
    // await new Promise(r => setTimeout(r, 100));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Button type="primary" onClick={handleAdd}>添加核酸检测点</Button>
      <Button type="primary" onClick={async () => {
        setButtonLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setSelectedRowKeys([]);
        setButtonLoading(false)
      }} disabled={!hasSelected} loading={buttonLoading}>
        ahhhhhhhhhhhhh
      </Button>
      <Divider/>
      <Table
        components={components}
        rowClassName={() => rowStyle}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        bordered
        dataSource={data}
        columns={real_columns}
        rowKey={record => record.place_id}
        loading={tableLoading}
        showSorterTooltip={false}
      />
    </>
  );
}

export default TestPoint;