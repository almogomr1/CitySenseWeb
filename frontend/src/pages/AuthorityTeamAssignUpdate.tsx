import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Card, CardBody, Form, Button, Input } from "reactstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import { ITeam, ITeamAssignRequest } from "../redux/api/types";
import { useGetTeamsQuery } from "../redux/api/teamAPI";
import { toast } from "react-toastify";

const AuthorityTeamAssignUpdate: React.FC = () => {
    const { data: teams = [], refetch, isLoading } = useGetTeamsQuery(); // Default to an empty array if teams are undefined
    const [filteredTeams, setFilteredTeams] = useState<ITeam[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);

    const { handleSubmit } = useForm<ITeamAssignRequest>();

    const issueSummary = {
        id: 101,
        description: "Pothole repair required on Main Street.",
        reportedBy: "John Doe",
        location: "Main Street, Block 4",
    };

    useEffect(() => {
        if (teams) {
            setFilteredTeams(teams);
        }
    }, [teams]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const onSubmit: SubmitHandler<ITeamAssignRequest> = () => {
        if (!selectedTeam) {
            toast.error('Please select a team to assign.');
            return;
        }

        // Simulate submission
        console.log("Assigned Data:", { issueId: issueSummary.id, team: selectedTeam });
        alert(`Team "${selectedTeam.name}" assigned to the issue.`);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        const filtered = teams.filter(
            (team) =>
                team.name.toLowerCase().includes(query) ||
                team.category.toLowerCase().includes(query)
        );
        setFilteredTeams(filtered);
    };

    const columns: TableColumn<ITeam>[] = [
        {
            name: "Team ID",
            selector: (row) => row.teamNumber,
            sortable: true,
        },
        {
            name: "Team Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Expertise/Category",
            selector: (row) => row.category,
            sortable: true,
        },
        {
            name: "Availability",
            cell: (row) => (
                <span
                    className={row.availability === "Available" ? "text-success" : "text-danger"}
                >
                    {row.availability}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    disabled={row.availability !== "Available"}
                    onClick={() => handleAssignClick(row)}
                >
                    Assign
                </Button>
            ),
        },
    ];

    const handleAssignClick = (team: ITeam) => {
        setSelectedTeam(team);
        alert(`Selected Team: ${team.name}`);
    };

    return (
        <div className="main-board container">
            <h3 className="my-3">Assign Team</h3>
            <Card className="p-3">
                <CardBody>
                    <div className="issue-summary mb-4">
                        <h5>Issue Summary</h5>
                        <p>
                            <strong>Issue ID:</strong> {issueSummary.id}
                        </p>
                        <p>
                            <strong>Description:</strong> {issueSummary.description}
                        </p>
                        <p>
                            <strong>Reported By:</strong> {issueSummary.reportedBy}
                        </p>
                        <p>
                            <strong>Location:</strong> {issueSummary.location}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-3">
                        <Input
                            type="text"
                            placeholder="Search by team name or category..."
                            onChange={handleSearch}
                            disabled={isLoading}
                        />
                    </div>

                    {/* DataTable */}
                    <DataTable
                        columns={columns}
                        data={filteredTeams}
                        pagination
                        highlightOnHover
                        progressPending={isLoading}
                        noDataComponent={<div>No teams found</div>}
                    />

                    {/* Submit Button */}
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="text-end mt-3">
                            <Button type="submit" color="success">
                                Confirm Assignment
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default AuthorityTeamAssignUpdate;
