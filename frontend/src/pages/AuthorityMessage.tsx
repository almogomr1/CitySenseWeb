/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import { useGetContactsQuery } from "../redux/api/contactAPI";
import { useGetContactUsersQuery } from "../redux/api/userAPI";
import AuthorityMessageSidebarLeft from "../components/AuthorityMessageSidebarLeft";
import AuthorityChat from "../components/AuthorityChat";

const AuthorityMessage: React.FC = () => {
    // Use `any` for chats and contactUsers
    const { data: chats, refetch } = useGetContactsQuery();
    const queryParams = { role: "Authority" };
    const { data: contactUsers, refetch: refetchContact } = useGetContactUsersQuery(queryParams);

    // Using `any` type for state variables
    const [messages, setMessages] = useState<any>({});
    const [selectedContact, setSelectedContact] = useState<any>({ contactId: null });
    const [selectedUser, setSelectedUser] = useState<any>({ client: null });
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

    // Use fallback to empty arrays in case the data is undefined
    const safeChats: any[] = chats || [];
    const safeContactUsers: any[] = contactUsers || [];

    useEffect(() => {
        refetch();
        refetchContact();
    }, [refetch, refetchContact]);

    return (
        <div className="container main-view">
            <div className="content-area-wrapper p-0">
                <Fragment>
                    <AuthorityMessageSidebarLeft
                        setSelectedContact={setSelectedContact}
                        setSelectedUser={setSelectedUser}
                        chats={safeChats}
                        contactUsers={safeContactUsers}
                        refetch={refetch}
                        filteredUsers={filteredUsers}
                        setFilteredUsers={setFilteredUsers}
                    />
                    <div className="content-right">
                        <div className="content-wrapper">
                            <div className="content-body">
                                <div className="body-content-overlay"></div>
                                <AuthorityChat
                                    selectedContact={selectedContact}
                                    selectedUser={selectedUser}
                                    messages={messages}
                                    setMessages={setMessages}
                                />
                            </div>
                        </div>
                    </div>
                </Fragment>
            </div>
        </div>
    );
};

export default AuthorityMessage;
