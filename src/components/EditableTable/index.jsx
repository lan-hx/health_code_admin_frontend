import {Form, Input, Space, Spin} from "antd";
import React, {useContext, useEffect, useRef, useState} from "react";
import styles from "./index.module.css";
import {LoadingOutlined} from "@ant-design/icons";

const EditableContext = React.createContext(null);

export const EditableRow = ({index, ...props}) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
export const EditableCell = ({
                               title,
                               editable,
                               children,
                               dataIndex,
                               record,
                               handleSave,
                               ...restProps
                             }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      setLoading(true)
      await handleSave({
        ...record,
        ...values,
      }, Object.keys(values)[0]);
      setLoading(false)
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Space>
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} disabled={loading}/>
        </Form.Item>
        {loading ? <Spin indicator={<LoadingOutlined spin/>}/> : <></>}
      </Space>
    ) : (
      <Space>
        <div
          className={styles.editableCellValueWrap}
          onClick={toggleEdit}
        >
          {children}
        </div>
        {loading ? <Spin indicator={<LoadingOutlined spin/>}/> : <></>}
      </Space>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

export const rowStyle = styles.editableRow
