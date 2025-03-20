/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import classnames from 'classnames';
import { MessageSquare, Menu, Send } from 'react-feather';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, InputGroup } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import userImg from '../assets/images/user.png';
import io from 'socket.io-client';
import { skipToken } from '@reduxjs/toolkit/query';
import { useSelectChatQuery } from '../redux/api/contactAPI';
import Avatar from './Avatar';
import { useAppSelector } from '../redux/store';

const socket = io('http://localhost:3009');

interface Message {
    _id: string;
    content: string;
    createdAt: string;
    sender: { _id: string; avatar?: string }[];
    contact: { _id: string }[];
}

interface ChatData {
    chats: Message[];
}

interface Contact {
    contactId: string;
}

interface Client {
    _id: string;
    username?: string;
    avatar?: string;
}

interface SelectedUser {
    client?: Client;
}

interface AuthorityChatProps {
    messages: ChatData;
    setMessages: (messages: any) => void;
    selectedContact: Contact;
    selectedUser: SelectedUser;
}

const AuthorityChat: React.FC<AuthorityChatProps> = ({ messages, setMessages, selectedContact, selectedUser }) => {
    const [msg, setMsg] = useState<string>('');
    const user = useAppSelector((state) => state.userState.user);
    const chatArea = useRef<HTMLDivElement | null>(null);
    const queryParams = selectedContact;

    const { data: selectedUserChats, refetch } = useSelectChatQuery(queryParams.contactId ? queryParams : skipToken);

    // ** Scroll to chat bottom
    const scrollToBottom = () => {
        if (chatArea.current) {
            chatArea.current.scrollTop = Number.MAX_SAFE_INTEGER;
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
        // Define the message listener for new incoming messages
        const messageListener = (message: Message) => {
            if (message.contact && message.contact[0]._id === selectedContact.contactId) {
                setMessages((prevMessages: ChatData) => ({
                    ...prevMessages, // Preserve existing state
                    chats: [...(prevMessages?.chats ?? []), message], // Append new message
                }));
            }
        };

        // Subscribe to the 'message' event from the socket server
        socket.on('message', messageListener);

        // Cleanup the event listener when the component unmounts or the contactId changes
        return () => {
            socket.off('message', messageListener);
        };
    }, [selectedContact.contactId, setMessages]); // Dependencies: re-run when contactId or setMessages changes


    // ** Sends New Msg
    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (msg.trim().length) {
            const message = {
                room: selectedContact.contactId,
                text: msg,
                sender: user?._id,
                receiver: selectedUser?.client?._id,
                contact: selectedContact.contactId,
            };
            socket.emit('chatMessage', message);
            setMsg('');
        }
    };

    // ** Formats chat data based on sender
    // ** Formats chat data based on sender
    const formattedChatData = () => {
        const chatLog = messages?.chats || [];
        const formattedChatLog: { senderId: string; senderAvatar: string; messages: { msg: string; time: string }[] }[] = [];
        let chatMessageSenderId = chatLog[0]?.sender[0]._id || '';  // default to empty string

        let msgGroup = {
            senderId: chatMessageSenderId,
            senderAvatar: chatLog[0]?.sender[0].avatar || userImg,
            messages: [] as { msg: string; time: string }[],
        };

        chatLog.forEach((msg, index) => {
            if (chatMessageSenderId === msg.sender[0]._id) {
                msgGroup.messages.push({ msg: msg.content, time: msg.createdAt });
            } else {
                formattedChatLog.push(msgGroup);
                chatMessageSenderId = msg.sender[0]._id;
                msgGroup = {
                    senderId: msg.sender[0]._id,
                    senderAvatar: msg.sender[0].avatar || userImg,
                    messages: [{ msg: msg.content, time: msg.createdAt }],
                };
            }
            if (index === chatLog.length - 1) formattedChatLog.push(msgGroup);
        });
        return formattedChatLog;
    };


    // ** Renders user chat
    const renderChats = () => {
        return formattedChatData().map((item, index) => (
            <div
                key={index}
                className={classnames('chat', { 'chat-left': item.senderId !== user?._id })}
            >
                <div className="chat-avatar">
                    <Avatar
                        imgWidth={36}
                        imgHeight={36}
                        className="box-shadow-1 cursor-pointer"
                        img={item.senderAvatar}
                    />
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
            <div className={classnames('start-chat-area', { 'd-none': messages?.chats?.length || selectedUser.client })}>
                <div className="start-chat-icon mb-1">
                    <MessageSquare />
                </div>
                <h5 className="sidebar-toggle start-chat-text">Start Conversation</h5>
            </div>
            {selectedUser?.client && (
                <div className="active-chat">
                    <div className="chat-navbar">
                        <div className="chat-header">
                            <div className="d-flex align-items-center">
                                <div className="sidebar-toggle d-block d-lg-none me-3">
                                    <Menu size={21} />
                                </div>
                                <Avatar
                                    imgHeight="36"
                                    imgWidth="36"
                                    img={selectedUser.client?.avatar || userImg}
                                    className="avatar-border user-profile-toggle m-0 me-3"
                                />
                                <h6 className="mb-0">
                                    {selectedUser.client.username}
                                </h6>
                            </div>
                        </div>
                    </div>
                    <ChatWrapper containerRef={(ref: any) => (chatArea.current = ref)} className="user-chats" options={{ wheelPropagation: false }} style={{ overflowX: 'hidden' }}>
                        {messages?.chats && <div className="chats">{renderChats()}</div>}
                    </ChatWrapper>
                    <Form className="chat-app-form" onSubmit={handleSendMsg}>
                        <InputGroup className="input-group-merge me-3 form-send-message">
                            <Input
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                placeholder="Type your message or use speech to text"
                            />
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

export default AuthorityChat;
