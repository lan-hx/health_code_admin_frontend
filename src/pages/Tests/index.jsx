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

Tests.propTypes = {

};

const test_data = [
  {
    nucleic_id: '1',
    user_id: '123123',
    place_id: 'dsf',
    result: 0,
    datetime: 0,
    new: false
  }
]

function Tests(props) {
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
        const response = await axios.post('/api/DeleteNucleic', {
          token: userToken,
          nucleic_id: record.nucleic_id,
        })
        console.log(response);
        const res = response.data
        if (res.error !== 0) {
          notification.error({message: '提示', description: `删除核酸检测记录失败，错误码${res.error}，错误信息：${res.message}`})
        } else {
          notification.success({message: '提示', description: `删除核酸检测记录成功`})
          const newData = data.filter(item => item.nucleic_id !== record.nucleic_id);
          setData(newData);
          console.log('delete', record.nucleic_id)
        }
      } catch (error) {
        console.error(error);
        notification.error({message: '提示', description: `删除核酸检测记录失败，网络错误`})
      }
    } else {
      const newData = data.filter(item => item.nucleic_id !== record.nucleic_id);
      setData(newData);
      console.log('delete', record.nucleic_id)
    }
  };

  // add a row
  const handleAddUser = async (nucleic_id) => {
    setAddUserLoadingRow(nucleic_id)
    setAddUserLoading(true)
    const newData = [...data];
    const index = newData.findIndex((item) => nucleic_id === item.nucleic_id);
    const item = newData[index];
    try {
      const response = await axios.post('/api/AddNucleic', {
        token: userToken,
        user_id: item.user_id,
        place_id: item.place_id,
        result: parseInt(item.result),
        datetime: parseInt(item.datetime),
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `添加核酸检测记录失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `添加核酸检测记录成功，[debug]服务器返回id = ${res.nucleic_id}`})
        newData.splice(index, 1, {
          ...item,
          nucleic_id: res.nucleic_id,
          new: false
        });
        setData(newData);
      }
    } catch (error) {
      console.error(error);
      notification.error({message: '提示', description: `添加核酸检测记录失败，网络错误`})
    }
    setAddUserLoading(false)
  };

  // column config
  const columns = [
    {
      title: '[debug] id',
      dataIndex: 'nucleic_id',
      key: 'nucleic_id',
      filters: [
        {
          text: '未保存核酸检测记录',
          value: true
        }
      ],
      onFilter: (value, record) => record.new === value,
      sorter: (a, b) => a.nucleic_id.localeCompare(b.nucleic_id),
    },
    {
      title: '核酸检测对象id',
      dataIndex: 'user_id',
      key: 'user_id',
      editable: true,
      sorter: (a, b) => a.user_id.localeCompare(b.user_id),
      ...getColumnSearchProps('user_id', '核酸检测对象id')
    },
    {
      title: '核酸检测地址id',
      dataIndex: 'place_id',
      key: 'place_id',
      editable: true,
      sorter: (a, b) => a.place_id.localeCompare(b.place_id),
      ...getColumnSearchProps('place_id', '核酸检测地址id')
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      editable: true,
      filters: [
        {
          text: '阴性',
          value: 0
        },
        {
          text: '混管阳性',
          value: 1
        },
        {
          text: '阳性',
          value: 2
        },
        {
          text: '报告未出',
          value: 3
        },
      ],
      onFilter: (value, record) => record.result === value,
      sorter: (a, b) => a.result < b.result,
    },
    {
      title: '时间',
      dataIndex: 'datetime',
      key: 'datetime',
      editable: true,
      sorter: (a, b) => a.datetime < b.datetime,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => <Space>
        {record.new ? <><Button type="link" style={{padding: 0}} disabled={addUserLoading} onClick={() => {
          handleAddUser(record.nucleic_id)
        }}>保存</Button>{addUserLoading && addUserLoadingRow === record.nucleic_id ?
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
      nucleic_id: nanoid(),
      user_id: '123123',
      place_id: 'dsf',
      result: 0,
      datetime: 0,
      new: true
    };
    setData([...data, newData]);
  };
  const handleSave = async (row, column_name) => {
    row.result = parseInt(row.result)
    row.datetime = parseInt(row.datetime)
    const index = data.findIndex((item) => row.nucleic_id === item.nucleic_id);
    const changed = row[column_name] !== data[index][column_name]
    console.log(changed)
    if (changed) {
      const newData = [...data];
      const item = newData[index];
      if (!row.new) {
        try {
          const response = await axios.post('/api/SetNucleic', {
            token: userToken,
            ...item,
            ...row,
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
      const response = await axios.post('/api/GetNucleicAll', {
        token: userToken,
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `数据获取失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `数据获取成功`})
        setData(res.result)
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
      <Button type="primary" onClick={handleAdd}>添加核酸检测记录</Button>
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
        rowKey={record => record.nucleic_id}
        loading={tableLoading}
        showSorterTooltip={false}
      />
    </>
  );

}

export default Tests;