import React, {useContext, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Divider, Form, Input, notification, Popconfirm, Space, Spin, Table} from "antd";
import {nanoid} from "nanoid";
import {EditableCell, EditableRow, rowStyle} from "../../components/EditableTable";
import styles from "./index.module.css";
import {LoadingOutlined, SearchOutlined} from "@ant-design/icons";
import Highlighter from 'react-highlight-words';
import {useSelector} from "react-redux";
import axios from "axios";
import {setUserToken} from "../../redux/user/userSlice";
import {setUserInfo} from "../../redux/userInfo/userInfoSlice";

User.propTypes = {};

const test_data = [
  {
    user_id: '1',
    name: '张三',
    card_id: 'XXXXXXXXXXXXXXXXXX',
    phone: '1XXXXXXXXXX',
    email: 'XXX@XXX.XXX',
    address: 'XXXXXXX',
    new: false
  }
]

function User(props) {
  const userToken = useSelector(state => state.user.token)
  const [data, setData] = useState(test_data) // 数据
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
        const response = await axios.post('/api/DeleteUser', {
          token: userToken,
          user_id: record.user_id,
        })
        console.log(response);
        const res = response.data
        if (res.error !== 0) {
          notification.error({message: '提示', description: `删除用户失败，错误码${res.error}，错误信息：${res.message}`})
        } else {
          notification.success({message: '提示', description: `删除用户成功`})
          const newData = data.filter(item => item.user_id !== record.user_id);
          setData(newData);
          console.log('delete', record.user_id)
        }
      } catch (error) {
        console.error(error);
        notification.error({message: '提示', description: `删除用户失败，网络错误`})
      }
    } else {
      const newData = data.filter(item => item.user_id !== record.user_id);
      setData(newData);
      console.log('delete', record.user_id)
    }
  };

  // add a row
  const handleAddUser = async (user_id) => {
    setAddUserLoadingRow(user_id)
    setAddUserLoading(true)
    const newData = [...data];
    const index = newData.findIndex((item) => user_id === item.user_id);
    const item = newData[index];
    try {
      const response = await axios.post('/api/AddUser', {
        token: userToken,
        name: item.name,
        card_id: item.card_id,
        phone: item.phone,
        email: item.email,
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `添加用户失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `添加用户成功，[debug]服务器返回id = ${res.user_id}`})
        newData.splice(index, 1, {
          ...item,
          user_id: res.user_id,
          new: false
        });
        setData(newData);
      }
    } catch (error) {
      console.error(error);
      notification.error({message: '提示', description: `添加用户失败，网络错误`})
    }
    setAddUserLoading(false)
  };

  // column config
  const columns = [
    {
      title: '[debug] id',
      dataIndex: 'user_id',
      key: 'user_id',
      filters: [
        {
          text: '未保存用户',
          value: true
        }
      ],
      onFilter: (value, record) => record.new === value,
      sorter: (a, b) => a.user_id.localeCompare(b.user_id),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', '姓名')
    },
    {
      title: '身份证号',
      dataIndex: 'card_id',
      key: 'card_id',
      editable: true,
      filters: [
        {
          text: '为XXXXXXXXXXXXXXXXXX',
          value: 'XXXXXXXXXXXXXXXXXX'
        }
      ],
      onFilter: (value, record) => record.card_id === value,
      sorter: (a, b) => a.card_id.localeCompare(b.card_id),
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      editable: true,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      editable: true,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => <Space>
        {record.new ? <><Button type="link" style={{padding: 0}} disabled={addUserLoading} onClick={() => {
          handleAddUser(record.user_id)
        }}>保存</Button>{addUserLoading && addUserLoadingRow === record.user_id ?
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
      user_id: nanoid(),
      name: '张三',
      card_id: 'XXXXXXXXXXXXXXXXXX',
      phone: '1XXXXXXXXXX',
      email: 'XXX@XXX.XXX',
      address: 'XXXXXXX',
      new: true
    };
    setData([...data, newData]);
  };
  const handleSave = async (row, column_name) => {
    const index = data.findIndex((item) => row.user_id === item.user_id);
    const changed = row[column_name] !== data[index][column_name]
    console.log(changed)
    if (changed) {
      const newData = [...data];
      const item = newData[index];
      if (!row.new) {
        try {
          const response = await axios.post('/api/SetUser', {
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
      const response = await axios.post('/api/GetUserAll', {
        token: userToken,
      })
      console.log(response);
      const res = response.data
      if (res.error !== 0) {
        notification.error({message: '提示', description: `数据获取失败，错误码${res.error}，错误信息：${res.message}`})
      } else {
        notification.success({message: '提示', description: `数据获取成功`})
        setData(res.users)
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
      <Button type="primary" onClick={handleAdd}>添加用户</Button>
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
        rowKey={record => record.user_id}
        loading={tableLoading}
        showSorterTooltip={false}
      />
    </>
  );
}

export default User;