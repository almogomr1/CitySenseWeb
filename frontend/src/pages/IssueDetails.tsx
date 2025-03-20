/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Col, Row, Button, Form, FormGroup, Card, CardBody } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { IComment } from '../redux/api/types';
import { useGetIssueQuery, usePostCommentMutation } from '../redux/api/issueAPI';
import { SubmitHandler, useForm } from 'react-hook-form';
import classnames from 'classnames';
import FullScreenLoader from '../components/FullScreenLoader';
import userImg from '../assets/images/user.png';
import { getDateFormat } from '../utils/Utils';
import { toast } from "react-toastify";

const IssueDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: issue, refetch: refetchIssue, isLoading } = useGetIssueQuery(id ?? '', {
        skip: !id,
    });
    const [postComment, { isError, error, isSuccess, data }] = usePostCommentMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IComment>();

    useEffect(() => {
        refetchIssue();
    }, [refetchIssue]);

    const onSubmit: SubmitHandler<IComment> = async (formData) => {
        formData.issueId = id ?? "";
        formData.notificationType = "New Comment";
        await postComment(formData);
        refetchIssue();
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Comment posted successfully!");
        }

        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: any) =>
                    toast.error(el.message, { position: "top-right" })
                );
            } else {
                toast.error(
                    (error as any)?.data?.message || "An unexpected error occurred!",
                    { position: "top-right" }
                );
            }
        }
    }, [isSuccess, isError]);

    if (isLoading) {
        return (<FullScreenLoader />);
    }

    return (
        <div className="container main-board py-4">
            <Card className='issue-card shadow-sm'>
                <CardBody>
                    <Row className="mb-4">
                        <Col>
                            <h3 className="text-primary">Issue Details</h3>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6}>
                            <p><strong>Description:</strong> {issue.description}</p>
                            <p><strong>Address:</strong> {issue.address}</p>
                            <p><strong>Priority:</strong> {issue.priority}</p>
                            <p><strong>Category:</strong> {issue?.category}</p>
                            <p><strong>Status:</strong> {issue.status}</p>
                            {/* {issue.transcription && (
                                <div>
                                    <p><strong>Audio Transcription:</strong></p>
                                    <p>{issue.transcription}</p>
                                </div>
                            )} */}
                        </Col>
                        <Col md={6} className="text-center">
                            {issue.photoUrl && (
                                <div>
                                    <p><strong>Photo:</strong></p>
                                    <img
                                        src={issue.photoUrl}
                                        alt="Issue"
                                        style={{ maxHeight: '300px' }}
                                        className="img-fluid rounded shadow-sm d-block mx-auto mb-3"
                                    />
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <h4 className="text-secondary">Comments</h4>
                            <>
                                {issue && issue.comments.map((comment: any, index: number) => (
                                    <div
                                        className="social-feed-box border rounded p-3 mb-3 shadow-sm"
                                        key={comment._id}
                                    >
                                        <div className="d-flex align-items-center mb-2">
                                            <img
                                                src={userImg}
                                                alt='user'
                                                className="rounded-circle me-2"
                                                style={{ width: '40px', height: '40px' }}
                                            />
                                            <div>
                                                <strong>{comment.createdBy?.fullname}</strong>
                                                <br />
                                                <small className="text-muted">{getDateFormat(comment.createdAt)}</small>
                                            </div>
                                        </div>
                                        <div className="social-body">
                                            <p className="mb-0">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                            <div className='mt-4'>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <FormGroup>
                                        <textarea
                                            id="content"
                                            className={`form-control ${classnames({ 'is-invalid': errors.content })}`}
                                            {...register('content', {
                                                required: 'Comment is required.',
                                                minLength: {
                                                    value: 10,
                                                    message: 'Comment must be at least 10 characters long.'
                                                },
                                                maxLength: {
                                                    value: 500,
                                                    message: 'Comment must be less than 500 characters long.'
                                                }
                                            })}
                                            rows={4}
                                            placeholder="Write your comment here..."
                                        ></textarea>
                                        {errors.content && (
                                            <small className="text-danger">{errors.content.message}</small>
                                        )}
                                    </FormGroup>
                                    <Button color="primary" type="submit">
                                        Submit Comment
                                    </Button>
                                </Form>
                            </div>

                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </div>
    );
};

export default IssueDetails;
