import React, {useContext, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Divider, Form, Input, notification, Popconfirm, Space, Spin, Table} from "antd";
import {nanoid} from "nanoid";
import {EditableCell, EditableRow, rowStyle} from "../../components/EditableTable";
import styles from "./index.module.css";
import {LoadingOutlined, SearchOutlined} from "@ant-design/icons";
import Highlighter from 'react-highlight-words';

User.propTypes = {};

const test_data = [
  {
    id: '1',
    name: '张三',
    card_id: 'XXXXXXXXXXXXXXXXXX',
    phone: '1XXXXXXXXXX',
    email: 'XXX@XXX.XXX',
    address: 'XXXXXXX',
    new: false
  }
]

function User(props) {
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
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      // name: record.name,
    }),
  };

  // delete a row
  const handleDelete = async (record) => {
    if (!record.new) {
      await new Promise(r => setTimeout(r, 1000));
    }
    const newData = data.filter((item) => item.id !== record.id);
    setData(newData);
    console.log('delete', record.id)
    notification.success({
      message: '修改提示',
      description: '删除用户成功！',
    });
  };

  // add a row
  const handleAddUser = async (id) => {
    setAddUserLoadingRow(id)
    setAddUserLoading(true)
    const newData = [...data];
    const index = newData.findIndex((item) => id === item.id);
    const item = newData[index];
    const new_id = nanoid()
    newData.splice(index, 1, {
      ...item,
      id: new_id,
      new: false
    });
    await new Promise(r => setTimeout(r, 1000));
    setData(newData);
    setAddUserLoading(false)
    notification.success({
      message: '修改提示',
      description: `添加用户成功！[debug]服务器返回id = ${new_id}`,
    });
  };

  // column config
  const columns = [
    {
      title: '[debug] id',
      dataIndex: 'id',
      key: 'id',
      filters: [
        {
          text: '未保存用户',
          value: true
        }
      ],
      onFilter: (value, record) => record.new === value,
      sorter: (a, b) => a.id.localeCompare(b.id),
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
          handleAddUser(record.id)
        }}>保存</Button>{addUserLoading && addUserLoadingRow === record.id ?
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
      id: nanoid(),
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
    const index = data.findIndex((item) => row.id === item.id);
    const changed = row[column_name] !== data[index][column_name]
    console.log(changed)
    if (changed) {
      const newData = [...data];
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      if(!row.new) {
        await new Promise(r => setTimeout(r, 1000));
      }
      setData(newData);
    }
    console.log('save', row)
    if (!row.new && changed) {
      notification.success({
        message: '修改提示',
        description: '保存成功！',
      });
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
    await new Promise(r => setTimeout(r, 3000));
    setTableLoading(false);
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
        rowKey={record => record.id}
        loading={tableLoading}
        showSorterTooltip = {false}
      />
    </>
  );
}

export default User;