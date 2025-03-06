/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Button,
    Input,
    Form,
    FormGroup,
    Label,
    Card,
    CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import GooglePlacesAutocomplete from 'react-google-autocomplete';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IssueSubmissionRequest } from '../redux/api/types';
import { toast } from 'react-toastify';
import { useCreateIssueMutation } from '../redux/api/issueAPI';

const IssueSubmission: React.FC = () => {
    const navigate = useNavigate();

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        setError
    } = useForm<IssueSubmissionRequest>();

    // Local State
    const [photo, setPhoto] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [address, setAddress] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Handlers
    const handleCancel = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const [createIssue, { isLoading, isError, error, isSuccess, data }] = useCreateIssueMutation();

    const onSubmit: SubmitHandler<IssueSubmissionRequest> = async (data) => {
        setIsSubmitting(true);

        if (!address) {
            setError('address', {
                type: 'manual',
                message: 'Please select an address using the suggested option.',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            data.address = address;

            const submissionData = new FormData();
            submissionData.append('description', data.description);
            if (photo) submissionData.append('photo', photo);
            if (audio) submissionData.append('audio', audio);
            submissionData.append('address', address);
            await createIssue(submissionData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit the issue. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Issue submitted successfully!");
            navigate("/citizen/issues");
        }
        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: { message: string }) =>
                    toast.error(el.message, { position: "top-right" })
                );
            } else {
                const errorMsg = (error as any)?.data?.message || "An unexpected error occurred!";
                toast.error(errorMsg, { position: "top-right" });
            }
        }
    }, [isSuccess, isError]);

    return (
        <div className="main-board container">
            <Row className="my-3">
                <Col>
                    <h3 className="mb-3">Report an Issue</h3>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            {/* Description */}
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className={`form-control ${classnames({ 'is-invalid': errors.description })}`}
                                        {...register('description', {
                                            required: 'Description is required.',
                                            minLength: {
                                                value: 10,
                                                message: 'Description must be at least 10 characters long.'
                                            },
                                            maxLength: {
                                                value: 500,
                                                message: 'Description must be less than 500 characters long.'
                                            }
                                        })}
                                    ></textarea>
                                    {errors.description && (
                                        <small className="text-danger">{errors.description.message}</small>
                                    )}
                                </FormGroup>
                            </Col>

                            {/* Photo Upload */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="photo">Upload a Photo (optional)</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                    />
                                </FormGroup>
                            </Col>

                            {/* Audio Upload */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="audio">Record an Audio Message (optional)</Label>
                                    <Input
                                        id="audio"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setAudio(e.target.files?.[0] || null)}
                                    />
                                </FormGroup>
                            </Col>

                            {/* Address */}
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="address">Address</Label>
                                    <GooglePlacesAutocomplete
                                        apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                                        className={`form-control ${classnames({ 'is-invalid': errors.address })}`}
                                        onPlaceSelected={(place) => {
                                            clearErrors('address');
                                            setAddress(place.formatted_address || '');
                                        }}
                                        options={{
                                            types: ['address'],
                                            componentRestrictions: { country: 'IL' },
                                        }}
                                    />
                                    {errors.address && (
                                        <small className="text-danger mt-1">{errors.address.message}</small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Buttons */}
                        <Row className="mt-4">
                            <Col>
                                <Button type="submit" color="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                                <Button
                                    type="button"
                                    color="secondary"
                                    className="ms-3"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default IssueSubmission;
