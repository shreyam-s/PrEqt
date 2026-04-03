"use client";
import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";



const DebtBarChart = ({ isPrivate, data: apiData }) => {
    // Transform API data to chart format with error handling
   const transformData = (data) => {
    try {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('DebtBarChart: No valid data provided, using fallback');
            return [];
        }

        return data
            .map(item => {
                if (!item || typeof item !== 'object') {
                    console.warn('DebtBarChart: Invalid item in data array', item);
                    return null;
                }

                return {
                    year: item.year ? `FY'${item.year.toString().slice(-2)}` : "FY'00",

                    // FIX: convert string/number to number
                    value: Number(item.debt_to_equity) || 0
                };
            })
            .filter(item => item !== null);
    } catch (error) {
        console.error('DebtBarChart: Error transforming data', error);
        return [];
    }
};


    // Safe data selection with fallback
    const chartData = (() => {
        try {
            if (apiData) {
                const transformed = transformData(apiData);
                return transformed.length > 0 ? transformed : (isPrivate ? [
                    { year: "FY'22", value: 13.8 },
                    { year: "FY'23", value: 14.0 },
                    { year: "FY'24", value: 9.3 },
                    { year: "FY'25", value: 3.0 },
                ] : [
                    { year: "FY'23", value: 5.9 },
                    { year: "FY'24", value: 6.2 },
                    { year: "FY'25", value: 3.0 },
                ]);
            }
            return isPrivate ? [
                { year: "FY'22", value: 13.8 },
                { year: "FY'23", value: 14.0 },
                { year: "FY'24", value: 9.3 },
                { year: "FY'25", value: 3.0 },
            ] : [
                { year: "FY'23", value: 5.9 },
                { year: "FY'24", value: 6.2 },
                { year: "FY'25", value: 3.0 },
            ];
        } catch (error) {
            console.error('DebtBarChart: Error selecting chart data', error);
            return isPrivate ? [
                { year: "FY'22", value: 13.8 },
                { year: "FY'23", value: 14.0 },
                { year: "FY'24", value: 9.3 },
                { year: "FY'25", value: 3.0 },
            ] : [
                { year: "FY'23", value: 5.9 },
                { year: "FY'24", value: 6.2 },
                { year: "FY'25", value: 3.0 },
            ];
        }
    })();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={60}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isPrivate ? "#374151" : "#E2E8F0"}
                />
                <XAxis
                    dataKey="year"
                    tick={{
                        fill: "var(--Gray-500, #9CA3AF)", // text color
                        fontSize: 14,
                        fontStyle: "normal",
                        fontWeight: 500,
                        letterSpacing: -0.56,

                    }}
                    axisLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
                    tickLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
                    
                />
                <YAxis
                    domain={[0, (dataMax) => dataMax + 0.3]}
                    tick={{
                        fill: "var(--Gray-500, #9CA3AF)", // text color
                        fontSize: 14,
                        fontStyle: "normal",
                        fontWeight: 500,
                        letterSpacing: -0.56,
                        // aligns right
                    }}
                    axisLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
                    tickLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
                    tickFormatter={(value) => value.toFixed(1)} 

                />
              <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div
                                    style={{
                                        background: "#fff",
                                        padding: "8px 12px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <p style={{ margin: 0, fontWeight: "600" }}>{label}</p>
                                    <p style={{ margin: 0, color: "#e6cf93" }}>
                                        D/E: {payload[0].value}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="value"
                    fill="#E4C575"
                    radius={[6, 6, 0, 0]} // rounded top corners
                >
                    <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(val) => val}
                        style={{ fill: "#9CA3AF", fontWeight: 600 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DebtBarChart;
