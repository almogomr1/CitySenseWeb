import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';
import { IIssue, ITeamIssue } from './types';

export const issueAPI = createApi({
    reducerPath: 'issueAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Issues'],
    endpoints: (builder) => ({
        createIssue: builder.mutation<any, any>({
            query(issue) {
                return {
                    url: '/issues/create',
                    method: 'POST',
                    credentials: 'include',
                    body: issue,
                };
            },
            invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (result: { data: { issue: any } }) =>
                result
        }),
        generateAI: builder.mutation<any, any>({
            query(issue) {
                return {
                    url: '/issues/generate-ai',
                    method: 'POST',
                    credentials: 'include',
                    body: issue,
                };
            },
            invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (result: { data: { issue: any } }) =>
                result
        }),
        updateIssue: builder.mutation<any, any>({
            query({ id, issue }) {
                return {
                    url: `/issues/update/${id}`,
                    method: 'PUT',
                    credentials: 'include',
                    body: issue,
                };
            },
            invalidatesTags: (result, _error, { id }) =>
                result
                    ? [
                        { type: 'Issues', id },
                        { type: 'Issues', id: 'LIST' },
                    ]
                    : [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (response: any) =>
                response,
        }),

        postComment: builder.mutation<any, any>({
            query(comment) {
                return {
                    url: `/comments/postComment`,
                    method: 'POST',
                    credentials: 'include',
                    body: comment,
                };
            },
            invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (result: { data: { issue: any } }) =>
                result
        }),

        upvoteIssue: builder.mutation<any, any>(
            {
                query(id) {
                    return {
                        url: `/issues/upvote/${id}`,
                        method: 'PUT',
                        credentials: 'include',
                    };
                },
                invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
                transformResponse: (response: any) =>
                    response,
            }
        ),

        assignTeam: builder.mutation<any, any>(
            {
                query({ id, data }) {
                    return {
                        url: `/issues/assignTeam/${id}`,
                        method: 'PUT',
                        credentials: 'include',
                        body: data,
                    };
                },
                invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
                transformResponse: (response: any) =>
                    response,
            }
        ),

        updateStatus: builder.mutation<any, any>(
            {
                query({ id, data }) {
                    return {
                        url: `/issues/updateStatus/${id}`,
                        method: 'PUT',
                        credentials: 'include',
                        body: data,
                    };
                },
                invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
                transformResponse: (response: any) =>
                    response,
            }
        ),

        getIssue: builder.query<any, any>({
            query(id) {
                return {
                    url: `/issues/getOneIssue/${id}`,
                    credentials: 'include',
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'Issues', id }],
        }),

        getExploreIssue: builder.query<any, any>({
            query(id) {
                return {
                    url: `/issues/explore/getOneIssue/${id}`,
                    credentials: 'include',
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'Issues', id }],
        }),

        getIssues: builder.query<IIssue[], any>({
            query: (params) => ({
                url: '/issues',
                credentials: 'include',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Issues' as const, id: _id })),
                        { type: 'Issues', id: 'LIST' },
                    ]
                    : [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (response: IIssue[]) => response,
        }),

        getExploreIssues: builder.query<
            { data: IIssue[]; totalPages: number; currentPage: number },
            { page: number; limit: number }
        >({
            query: ({ page, limit }) => ({
                url: `/issues/explore-issues?page=${page}&limit=${limit}`,
                credentials: "include",
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map((issue) => ({ type: "Issues" as const, id: issue._id })),
                        { type: "Issues", id: "LIST" },
                    ]
                    : [{ type: "Issues", id: "LIST" }],
            transformResponse: (response: {
                data: IIssue[];
                totalPages: number;
                currentPage: number;
            }) => response,
        }),

        getTeamIssues: builder.query<ITeamIssue[], any>({
            query: (params) => ({
                url: '/issues/getTeamIssues',
                credentials: 'include',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Issues' as const, id: _id })),
                        { type: 'Issues', id: 'LIST' },
                    ]
                    : [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (response: ITeamIssue[]) => response,
        }),

        getMyIssues: builder.query<IIssue[], any>({
            query: (params) => ({
                url: '/issues/myissues',
                credentials: 'include',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Issues' as const, id: _id })),
                        { type: 'Issues', id: 'LIST' },
                    ]
                    : [{ type: 'Issues', id: 'LIST' }],
            transformResponse: (response: IIssue[]) => response,
        }),

        deleteIssue: builder.mutation<any, string>({
            query(id) {
                return {
                    url: `/issues/delete/${id}`,
                    method: 'Delete',
                    credentials: 'include',
                };
            },
            invalidatesTags: [{ type: 'Issues', id: 'LIST' }],
        }),

    }),
});

export const {
    useCreateIssueMutation,
    useUpdateIssueMutation,
    useGetIssueQuery,
    useGetIssuesQuery,
    useDeleteIssueMutation,
    useUpvoteIssueMutation,
    useGetMyIssuesQuery,
    useGetTeamIssuesQuery,
    usePostCommentMutation,
    useAssignTeamMutation,
    useUpdateStatusMutation,
    useGetExploreIssuesQuery,
    useGetExploreIssueQuery,
    useGenerateAIMutation,
} = issueAPI;