/* eslint-disable react-hooks/exhaustive-deps */
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Card, CardBody, Col, Form, FormGroup, Label, Row } from "reactstrap";
import classnames from "classnames";
import { TeamCreateRequest } from "../redux/api/types";
import { useEffect, useState } from "react";
import { useCreateTeamMutation } from "../redux/api/teamAPI";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TeamCreate: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TeamCreateRequest>();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [createTeam, { isLoading, isError, error, isSuccess, data }] =
        useCreateTeamMutation();

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
            navigate('/authority/teams');
        }
        if (isError) {
            const errorData = (error as any)?.data?.error;
            if (Array.isArray(errorData)) {
                errorData.forEach((el: any) =>
                    toast.error(el.message, {
                        position: "top-right",
                    })
                );
            } else {
                const errorMsg =
                    (error as any)?.data?.message || (error as any)?.data || "failed";
                toast.error(errorMsg, {
                    position: "top-right",
                });
            }
        }
    }, [isLoading]);

    const onSubmit: SubmitHandler<TeamCreateRequest> = (data) => {
        setIsSubmitting(true);
        createTeam(data);
        setIsSubmitting(false);
    };

    return (
        <div className="container main-board">
            <Row className="my-3">
                <Col>
                    <h3 className="mb-3">Team Create</h3>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <input
                                className={`form-control ${classnames({ 'is-invalid': errors.name })}`}
                                id="name"
                                {...register('name', { required: true })}
                            />
                            {errors.name && <small className="text-danger">Team Name is required.</small>}
                        </FormGroup>

                        {/* Buttons */}
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Create Team'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}

export default TeamCreate;