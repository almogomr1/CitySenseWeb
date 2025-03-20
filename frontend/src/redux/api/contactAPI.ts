import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface ChatResponse {
    chats: any[];
}

interface CreateContactPayload {
    name: string;
    email: string;
    phone?: string;
}

interface ReadMessagePayload {
    contactId: string;
    data: any;
}

export const contactAPI = createApi({
    reducerPath: 'contactAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Contacts'],
    endpoints: (builder) => ({
        getContacts: builder.query<Contact[], void>({
            query: () => ({
                url: `/contacts`,
                credentials: 'include'
            }),
            providesTags: (result) =>
                result ? result.map(({ id }) => ({ type: 'Contacts', id })) : [],
            transformResponse: (result: { contacts: Contact[] }) => result.contacts,
        }),
        selectChat: builder.query<ChatResponse, { contactId: string }>({
            query: (args) => ({
                url: `/contacts/selectChat`,
                params: { ...args },
                credentials: 'include'
            }),
            providesTags: (_result, _error, args) => [{ type: 'Contacts', id: args.contactId }],
        }),
        createContact: builder.mutation<void, CreateContactPayload>({
            query: (payload) => ({
                url: '/contacts/create',
                method: 'POST',
                credentials: 'include',
                body: payload
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
        }),
        readMessage: builder.mutation<void, ReadMessagePayload>({
            query: ({ contactId, data }) => ({
                url: `/contacts/read/${contactId}`,
                method: 'PUT',
                credentials: 'include',
                body: { client: data }
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
        }),
        readClientMessage: builder.mutation<void, ReadMessagePayload>({
            query: ({ contactId, data }) => ({
                url: `/contacts/read/${contactId}`,
                method: 'PUT',
                credentials: 'include',
                body: { admin: data }
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
        })
    })
});

export const {
    useCreateContactMutation,
    useGetContactsQuery,
    useSelectChatQuery,
    useReadClientMessageMutation,
    useReadMessageMutation
} = contactAPI;
