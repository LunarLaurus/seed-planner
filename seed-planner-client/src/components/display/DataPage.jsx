import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "../../styles/Forms.css";

function DataPage({
    title,
    queryConfigs,
    modalComponent,
    tableComponent,
}) {
    const queryClient = useQueryClient();

    // Run all queries defined in queryConfigs
    const queries = queryConfigs.map(({ queryKey, queryFn }) =>
        useQuery({
            queryKey,
            queryFn,
            onSuccess: (data) => {
                console.log(`Successfully fetched data for ${queryKey}:`, data);
            },
            onError: (error) => {
                console.error(`Error fetching data for ${queryKey}:`, error);
            }
        })
    );

    // Log the queries to see their states
    console.log("Queries states:", queries);

    // Check for loading or error states
    const isLoading = queries.some(query => query.isLoading);
    const isError = queries.some(query => query.isError);

    // Render loading or error message if data is still loading or an error occurs
    if (isLoading) {
        console.log("Loading state active");
        return <p>Loading {title.toLowerCase()}...</p>;
    }
    if (isError) {
        console.error("Error loading data:", title);
        return <p>Error loading {title.toLowerCase()}. Check the backend.</p>;
    }

    // Safely extract data, ensuring it's not undefined
    const data = queries.map(query => query.data || []);
    console.log("Data from queries:", data);

    // If data is not available for the first query, show a no data message
    if (!data[0]) {
        console.warn("No data found for", title);
        return <p>No data available for {title.toLowerCase()}.</p>;
    }

    // Log data before passing to components
    console.log("Data passed to modal and table:", data);

    return (
        <div className="page-container">
            <h1>{title}</h1>
            {/* Pass the data array into modal and table components */}
            {modalComponent && React.createElement(modalComponent, { queryClient, data: data[1] })}
            {React.createElement(tableComponent, { data: data[0], queryClient })}
        </div>
    );
}

export default DataPage;
