/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import { useGetContactsQuery } from "../redux/api/contactAPI";
import { useGetContactUsersQuery } from "../redux/api/userAPI";
import CitizenMessageSidebarLeft from "../components/CitizenMessageSidebarLeft";
import CitizenChat from "../components/CitizenChat";

const CitizenMessage: React.FC = () => {
    // Use `any` for chats and contactUsers
    const { data: chats, refetch } = useGetContactsQuery();
    const queryParams = { role: "Citizen" };
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
    console.log(safeContactUsers, contactUsers, "-------");
    return (
        <div className="container main-view">
            <div className="content-area-wrapper pt-5">
                <Fragment>
                    <CitizenMessageSidebarLeft
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
                                <CitizenChat
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

export default CitizenMessage;
