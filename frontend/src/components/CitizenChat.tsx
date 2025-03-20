/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import classnames from 'classnames';
import { MessageSquare, Menu, Send } from 'react-feather';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, InputGroup } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import userImg from '../assets/images/user.png';
import io from 'socket.io-client';
import { skipToken } from '@reduxjs/toolkit/query';
import { useAppSelector } from '../redux/store';
import Avatar from './Avatar';
import { useSelectChatQuery } from '../redux/api/contactAPI';

type Message = {
    _id: string;
    content: string;
    createdAt: string;
    sender: [{ _id: string; avatar?: string }];
    contact: [{ _id: string }];
};

type ChatData = {
    chats: Message[];
};

type Contact = {
    contactId: string;
};

type User = {
    _id: string;
    username?: string;
    avatar?: string;
};

type SelectedUser = {
    authority?: User | null;
};

type CitizenChatProps = {
    messages: ChatData;
    setMessages: (messages: any) => void;
    selectedContact: Contact;
    selectedUser: SelectedUser;
};

const socket = io('http://localhost:3009');

const CitizenChat: React.FC<CitizenChatProps> = ({ messages, setMessages, selectedContact, selectedUser }) => {
    const [msg, setMsg] = useState('');
    const user = useAppSelector((state) => state.userState.user);
    const chatArea = useRef<HTMLDivElement | null>(null);
    const queryParams = selectedContact;

    const { data: selectedUserChats, refetch } = useSelectChatQuery(queryParams.contactId ? queryParams : skipToken);

    const scrollToBottom = () => {
        if (chatArea.current) {
            chatArea.current.scrollTop = chatArea.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (messages?.chats?.length) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (selectedUserChats) {
            setMessages(selectedUserChats);
            refetch();
        }
    }, [selectedUserChats, refetch]);

    useEffect(() => {
        // Updated listener with Message type
        const messageListener = (message: Message) => {
            if (message.contact && message.contact[0]._id === selectedContact.contactId) {
                setMessages((prevMessages: ChatData) => ({
                    ...prevMessages, // Preserve existing state
                    chats: [...(prevMessages?.chats ?? []), message], // Append new message
                }));
            }
        };

        socket.on('message', messageListener);

        return () => {
            socket.off('message', messageListener);
        };
    }, [selectedContact.contactId, setMessages]);

    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (msg.trim().length) {
            const message = {
                room: selectedContact.contactId,
                text: msg,
                sender: user?._id,
                receiver: selectedUser?.authority?._id,
                contact: selectedContact.contactId,
            };
            socket.emit('chatMessage', message);
            setMsg('');
        }
    };

    const formattedChatData = () => {
        const chatLog = messages?.chats || [];
        const formattedChatLog: { senderId: string; senderAvatar: string; messages: { msg: string; time: string }[] }[] = [];
        let msgGroup: any = null;
        let lastSenderId = '';

        chatLog.forEach((msg, index) => {
            const senderId = msg.sender[0]._id;
            const senderAvatar = msg.sender[0].avatar || userImg;

            if (senderId === lastSenderId && msgGroup) {
                msgGroup.messages.push({ msg: msg.content, time: msg.createdAt });
            } else {
                if (msgGroup) formattedChatLog.push(msgGroup);
                msgGroup = { senderId, senderAvatar, messages: [{ msg: msg.content, time: msg.createdAt }] };
                lastSenderId = senderId;
            }

            if (index === chatLog.length - 1 && msgGroup) formattedChatLog.push(msgGroup);
        });

        return formattedChatLog;
    };

    const renderChats = () => {
        return formattedChatData().map((item, index) => (
            <div key={index} className={classnames('chat', { 'chat-left': item.senderId !== user?._id })}>
                <div className="chat-avatar">
                    <Avatar imgWidth={36} imgHeight={36} className="box-shadow-1 cursor-pointer" img={item.senderAvatar} />
                </div>
                <div className="chat-body">
                    {item.messages.map((chat, index1) => (
                        <div key={index1} className="chat-content">
                            <p>{chat.msg}</p>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    const ChatWrapper = messages?.chats?.length ? PerfectScrollbar : 'div';

    return (
        <div className="chat-app-window">
            <div className={classnames('start-chat-area', { 'd-none': messages?.chats?.length || selectedUser.authority })}>
                <div className="start-chat-icon mb-1">
                    <MessageSquare />
                </div>
                <h5 className="sidebar-toggle start-chat-text">Start Conversation</h5>
            </div>
            {selectedUser?.authority && (
                <div className={classnames('active-chat', { 'd-none': selectedUser.authority === null })}>
                    <div className="chat-navbar">
                        <div className="chat-header">
                            <div className="d-flex align-items-center">
                                <div className="sidebar-toggle d-block d-lg-none me-3">
                                    <Menu size={21} />
                                </div>
                                <Avatar imgHeight="36" imgWidth="36" img={selectedUser.authority?.avatar || userImg} className="avatar-border user-profile-toggle m-0 me-3" />
                                <h6 className="mb-0">{selectedUser.authority?.username}</h6>
                            </div>
                        </div>
                    </div>
                    <ChatWrapper containerRef={(ref: any) => (chatArea.current = ref)} className="user-chats" options={{ wheelPropagation: false }}>
                        {messages?.chats && <div className="chats">{renderChats()}</div>}
                    </ChatWrapper>
                    <Form className="chat-app-form" onSubmit={handleSendMsg}>
                        <InputGroup className="input-group-merge me-3 form-send-message">
                            <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message" />
                        </InputGroup>
                        <Button className="send" color="orange">
                            <Send size={14} />
                        </Button>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default CitizenChat;
