import React, { useState, useEffect, useCallback } from "react";

import {
    Headphones,
    MessageSquare,
    Clock,
    CheckCircle2,
    RefreshCw,
    Mail,
    User,
    Calendar,
    AlertCircle,
    Sparkles,
    Bot,
    FileText,
    Pencil,
    Save,
    Trash2,
    X
} from "lucide-react";

import { API_URL } from "./api";
import "./SupportRequests.css";

function SupportRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [regeneratingId, setRegeneratingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editedSolution, setEditedSolution] = useState("");
    const [savingSolutionId, setSavingSolutionId] = useState(null);
    const [deletingRequestId, setDeletingRequestId] = useState(null);

    // FETCH SUPPORT REQUESTS
    const fetchRequests = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/support`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load support requests."
                );
            }

            setRequests(data.requests || []);

        } catch (err) {
            console.error("Support Requests Error:", err);
            setError(err.message || "Unable to connect to the server.");

        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    // AUTOMATIC REFRESH
    useEffect(() => {
        fetchRequests();

        const interval = setInterval(() => {
            fetchRequests(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchRequests]);

    // UPDATE REQUEST STATUS
    const updateStatus = async (requestId, newStatus) => {
        try {
            setUpdatingId(requestId);
            setError("");

            const response = await fetch(
                `${API_URL}/support/${requestId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update status."
                );
            }

            setRequests(previous =>
                previous.map(request =>
                    Number(request.request_id) === Number(requestId)
                        ? { ...request, status: newStatus }
                        : request
                )
            );

        } catch (err) {
            console.error("Status Update Error:", err);
            setError(err.message || "Status update failed.");

        } finally {
            setUpdatingId(null);
        }
    };

    // REGENERATE AI SOLUTION
    const regenerateSolution = async (requestId) => {
        try {
            setRegeneratingId(requestId);
            setError("");

            const response = await fetch(
                `${API_URL}/support/${requestId}/regenerate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to regenerate AI solution."
                );
            }

            setRequests(previous =>
                previous.map(request =>
                    Number(request.request_id) === Number(requestId)
                        ? {
                            ...request,
                            solution: data.solution,
                            status: data.status || "Resolved"
                        }
                        : request
                )
            );

        } catch (err) {
            console.error("AI Regeneration Error:", err);
            setError(
                err.message || "AI solution regeneration failed."
            );

        } finally {
            setRegeneratingId(null);
        }
    };

    // DELETE THE ENTIRE SUPPORT ISSUE
    const deleteSupportRequest = async (requestId) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete Support Issue #${requestId}? This will remove the complete issue, including customer details, message, AI solution, status, and date. This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeletingRequestId(requestId);
            setError("");

            const response = await fetch(
                `${API_URL}/support/${requestId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to delete the support issue."
                );
            }

            // REMOVE THE DELETED ISSUE FROM THE LIST
            setRequests(previous =>
                previous.filter(
                    request =>
                        Number(request.request_id) !== Number(requestId)
                )
            );

            if (Number(editingId) === Number(requestId)) {
                setEditingId(null);
                setEditedSolution("");
            }

        } catch (err) {
            console.error("Delete Support Request Error:", err);
            setError(
                err.message || "Unable to delete support issue."
            );

        } finally {
            setDeletingRequestId(null);
        }
    };

    // START EDITING SOLUTION
    const startEditing = (request) => {
        setEditingId(request.request_id);
        setEditedSolution(request.solution || "");
        setError("");
    };

    // CANCEL EDITING
    const cancelEditing = () => {
        setEditingId(null);
        setEditedSolution("");
    };

    // SAVE EDITED SOLUTION
    const saveSolution = async (requestId) => {
        if (!editedSolution.trim()) {
            setError("Solution cannot be empty.");
            return;
        }

        try {
            setSavingSolutionId(requestId);
            setError("");

            const response = await fetch(
                `${API_URL}/support/${requestId}/solution`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        solution: editedSolution.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to save the solution."
                );
            }

            setRequests(previous =>
                previous.map(request =>
                    Number(request.request_id) === Number(requestId)
                        ? {
                            ...request,
                            solution: editedSolution.trim()
                        }
                        : request
                )
            );

            setEditingId(null);
            setEditedSolution("");

        } catch (err) {
            console.error("Save Solution Error:", err);
            setError(err.message || "Unable to save solution.");

        } finally {
            setSavingSolutionId(null);
        }
    };

    // STATISTICS
    const pendingCount = requests.filter(
        request => request.status === "Pending"
    ).length;

    const progressCount = requests.filter(
        request => request.status === "In Progress"
    ).length;

    const resolvedCount = requests.filter(
        request => request.status === "Resolved"
    ).length;

    // FORMAT DATE
    const formatDate = (date) => {
        return date
            ? new Date(date).toLocaleString("en-IN")
            : "Date unavailable";
    };

    return (
        <div className="support-management-page">

            {/* HEADER */}
            <div className="support-management-header">
                <div>
                    <span className="support-management-badge">
                        <Headphones size={15} />
                        SUPPORT MANAGEMENT
                    </span>

                    <h1>Support Requests</h1>

                    <p>
                        Manage customer issues with intelligent AI-generated solutions.
                    </p>
                </div>

                <button
                    className="support-refresh-button"
                    onClick={() => fetchRequests()}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* STATISTICS */}
            <div className="support-stats-grid">

                <div className="support-stat-card">
                    <div className="support-stat-icon total">
                        <MessageSquare size={23} />
                    </div>
                    <p>Total Requests</p>
                    <h2>{requests.length}</h2>
                </div>

                <div className="support-stat-card">
                    <div className="support-stat-icon pending">
                        <Clock size={23} />
                    </div>
                    <p>Pending</p>
                    <h2>{pendingCount}</h2>
                </div>

                <div className="support-stat-card">
                    <div className="support-stat-icon progress">
                        <RefreshCw size={23} />
                    </div>
                    <p>In Progress</p>
                    <h2>{progressCount}</h2>
                </div>

                <div className="support-stat-card">
                    <div className="support-stat-icon resolved">
                        <CheckCircle2 size={23} />
                    </div>
                    <p>Resolved</p>
                    <h2>{resolvedCount}</h2>
                </div>

            </div>

            {/* CUSTOMER REQUESTS */}
            <div className="support-requests-container">

                <div className="support-requests-title">
                    <div>
                        <h2>Customer Issues</h2>
                        <p>
                            Customer problems and AI-powered support solutions.
                        </p>
                    </div>

                    <span>{requests.length} Requests</span>
                </div>

                {error && (
                    <div className="support-management-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="support-management-empty">
                        Loading support requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="support-management-empty">
                        <MessageSquare size={40} />
                        <h3>No support requests yet</h3>
                        <p>
                            Submitted customer issues will appear here.
                        </p>
                    </div>
                ) : (

                    <div className="support-request-list">

                        {requests.map(request => (

                            <div
                                className="support-request-card"
                                key={request.request_id}
                            >

                                {/* REQUEST HEADER */}
                                <div className="support-request-top">

                                    <div className="support-request-heading">
                                        <div className="support-request-icon">
                                            <MessageSquare size={22} />
                                        </div>

                                        <div>
                                            <h3>{request.subject}</h3>
                                            <span>
                                                Request #{request.request_id}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`support-status ${String(
                                            request.status || "Pending"
                                        ).toLowerCase().replace(/\s+/g, "-")}`}
                                    >
                                        {request.status || "Pending"}
                                    </span>

                                </div>

                                {/* CUSTOMER INFORMATION */}
                                <div className="support-request-details">

                                    <div>
                                        <User size={17} />
                                        <span>{request.name}</span>
                                    </div>

                                    <div>
                                        <Mail size={17} />
                                        <span>{request.email}</span>
                                    </div>

                                    <div>
                                        <Calendar size={17} />
                                        <span>
                                            {formatDate(request.created_at)}
                                        </span>
                                    </div>

                                </div>

                                {/* CUSTOMER ISSUE */}
                                <div className="support-request-message">

                                    <strong>
                                        <FileText size={17} />
                                        Customer Issue
                                    </strong>

                                    <p>{request.message}</p>

                                </div>

                                {/* AI SOLUTION */}
                                <div className="support-ai-solution">

                                    <div className="support-ai-heading">

                                        <div className="support-ai-title">

                                            <div className="support-ai-icon">
                                                <Bot size={22} />
                                            </div>

                                            <div>
                                                <h3>AI-Generated Solution</h3>
                                                <span>
                                                    Powered by BoloSaathi AI
                                                </span>
                                            </div>

                                        </div>

                                        <span className="support-ai-badge">
                                            <Sparkles size={14} />
                                            AI POWERED
                                        </span>

                                    </div>

                                    {/* SOLUTION DISPLAY / EDITOR */}
                                    {editingId === request.request_id ? (

                                        <div style={{ marginTop: "15px" }}>

                                            <textarea
                                                value={editedSolution}
                                                onChange={e =>
                                                    setEditedSolution(e.target.value)
                                                }
                                                rows={5}
                                                placeholder="Enter the updated solution..."
                                                style={{
                                                    width: "100%",
                                                    padding: "14px",
                                                    borderRadius: "10px",
                                                    border: "1px solid #cfcfcf",
                                                    fontSize: "14px",
                                                    resize: "vertical",
                                                    boxSizing: "border-box"
                                                }}
                                            />

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    marginTop: "12px"
                                                }}
                                            >

                                                <button
                                                    className="support-refresh-button"
                                                    onClick={() =>
                                                        saveSolution(request.request_id)
                                                    }
                                                    disabled={
                                                        savingSolutionId === request.request_id
                                                    }
                                                >
                                                    <Save size={16} />

                                                    {savingSolutionId === request.request_id
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </button>

                                                <button
                                                    className="support-refresh-button"
                                                    onClick={cancelEditing}
                                                    disabled={
                                                        savingSolutionId === request.request_id
                                                    }
                                                    style={{
                                                        background: "#777"
                                                    }}
                                                >
                                                    <X size={16} />
                                                    Cancel
                                                </button>

                                            </div>

                                        </div>

                                    ) : request.solution ? (

                                        <div className="support-ai-answer">
                                            <p>{request.solution}</p>
                                        </div>

                                    ) : (

                                        <div className="support-ai-pending">
                                            <AlertCircle size={18} />

                                            <div>
                                                <strong>
                                                    AI solution not available
                                                </strong>

                                                <p>
                                                    Generate an AI solution or add one manually.
                                                </p>
                                            </div>
                                        </div>

                                    )}

                                    {/* EDIT BUTTON */}
                                    {editingId !== request.request_id && (

                                        <button
                                            className="support-refresh-button"
                                            onClick={() => startEditing(request)}
                                            style={{ marginTop: "15px" }}
                                        >
                                            <Pencil size={16} />

                                            {request.solution
                                                ? "Edit Solution"
                                                : "Add Solution"}
                                        </button>

                                    )}

                                    {/* REGENERATE BUTTON */}
                                    {editingId !== request.request_id && (

                                        <button
                                            className="support-refresh-button"
                                            onClick={() =>
                                                regenerateSolution(request.request_id)
                                            }
                                            disabled={
                                                regeneratingId === request.request_id
                                            }
                                            style={{
                                                marginTop: "10px",
                                                background: "#7255d9"
                                            }}
                                        >
                                            <RefreshCw
                                                size={16}
                                                style={{
                                                    animation:
                                                        regeneratingId === request.request_id
                                                            ? "spin 1s linear infinite"
                                                            : "none"
                                                }}
                                            />

                                            {regeneratingId === request.request_id
                                                ? "Generating Solution..."
                                                : request.solution
                                                    ? "Regenerate AI Solution"
                                                    : "Generate AI Solution"}

                                        </button>

                                    )}

                                </div>

                                {/* STATUS MANAGEMENT */}
                                <div className="support-request-footer">

                                    <label>
                                        Update Request Status
                                    </label>

                                    <select
                                        value={request.status || "Pending"}
                                        disabled={
                                            updatingId === request.request_id
                                        }
                                        onChange={e =>
                                            updateStatus(
                                                request.request_id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="In Progress">
                                            In Progress
                                        </option>

                                        <option value="Resolved">
                                            Resolved
                                        </option>

                                    </select>

                                    {updatingId === request.request_id && (
                                        <span>Updating...</span>
                                    )}

                                </div>

                                {/* DELETE ENTIRE ISSUE */}
                                <div
                                    className="support-request-delete-row"
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginTop: "16px"
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="support-delete-solution"
                                        onClick={() =>
                                            deleteSupportRequest(request.request_id)
                                        }
                                        disabled={
                                            deletingRequestId === request.request_id ||
                                            updatingId === request.request_id ||
                                            regeneratingId === request.request_id ||
                                            savingSolutionId === request.request_id
                                        }
                                        title="Permanently delete this entire support issue"
                                    >
                                        <Trash2 size={16} />

                                        {deletingRequestId === request.request_id
                                            ? "Deleting Issue..."
                                            : "Delete Issue"}

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default SupportRequests;