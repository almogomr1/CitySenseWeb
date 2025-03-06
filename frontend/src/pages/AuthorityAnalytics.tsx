import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useGetAuthorityAnalyticsQuery } from '../redux/api/analyticAPI';
import GooglePlacesAutocomplete from 'react-google-autocomplete';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Filters {
    startDate: string;
    endDate: string;
    location: string;
    category: string;
}

const AuthorityAnalytics: React.FC = () => {
    const [filters, setFilters] = useState<Filters>({
        startDate: '',
        endDate: '',
        location: '',
        category: '',
    });

    const [errorMessage, setErrorMessage] = useState<string>(''); // For validation messages

    const { data: analyticsData = {}, refetch, isLoading } = useGetAuthorityAnalyticsQuery(filters);

    const handleFilterChange = (name: keyof Filters, value: string) => {
        // Ensure startDate <= endDate
        if (name === 'startDate' && filters.endDate && value > filters.endDate) {
            setErrorMessage('Start date cannot be greater than the end date.');
            return;
        }

        if (name === 'endDate' && filters.startDate && value < filters.startDate) {
            setErrorMessage('End date cannot be earlier than the start date.');
            return;
        }

        // Clear error and update filters
        setErrorMessage('');
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();

        // Fetch data if no errors
        if (!errorMessage) {
            refetch();
        }
    };

    const barData = {
        labels: analyticsData?.issuesByCategory?.map((cat: any) => cat._id) || [],
        datasets: [
            {
                label: 'Issues by Category',
                data: analyticsData?.issuesByCategory?.map((cat: any) => cat.count) || [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1>Analytics Dashboard</h1>
                </Col>
            </Row>

            <Row>
                <Col md={3}>
                    <Card>
                        <CardBody>
                            <h5>Filters</h5>
                            <Form onSubmit={handleApplyFilters}>
                                {errorMessage && (
                                    <p className="text-danger">{errorMessage}</p>
                                )}
                                <FormGroup>
                                    <Label for="startDate">Start Date</Label>
                                    <Input
                                        type="date"
                                        name="startDate"
                                        id="startDate"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="endDate">End Date</Label>
                                    <Input
                                        type="date"
                                        name="endDate"
                                        id="endDate"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="location">Location</Label>
                                    <GooglePlacesAutocomplete
                                        apiKey={process.env.REACT_APP_GOOGLE_API_KEY || ''}
                                        className="form-control"
                                        onPlaceSelected={(place) => {
                                            const address = place.formatted_address || '';
                                            handleFilterChange('location', address);
                                        }}
                                        options={{
                                            types: ['address'],
                                            componentRestrictions: { country: 'IL' },
                                        }}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="category">Category</Label>
                                    <Input
                                        type="select"
                                        name="category"
                                        id="category"
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Road Maintenance">Road Maintenance</option>
                                        <option value="Waste Disposal">Waste Disposal</option>
                                        <option value="Streetlight Repair">Streetlight Repair</option>
                                    </Input>
                                </FormGroup>
                                <Button type="submit" color="primary" block>
                                    Apply Filters
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={9}>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4 text-center bg-primary">
                                        <CardBody>
                                            <h5 className="text-white">Total Issues Reported</h5>
                                            <h2 className="text-white">{analyticsData?.totalIssues || 0}</h2>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="mb-4 text-white text-center bg-success">
                                        <CardBody>
                                            <h5 className="text-white">Resolved This Month</h5>
                                            <h2 className="text-white">{analyticsData?.resolvedIssuesThisMonth || 0}</h2>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card className="mb-4">
                                        <CardBody>
                                            <h5>Issues by Category</h5>
                                            <Bar data={barData} />
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AuthorityAnalytics;
